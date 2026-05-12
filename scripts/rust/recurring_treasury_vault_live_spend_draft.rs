use kaspa_consensus_core::hashing::sighash::{calc_schnorr_signature_hash, SigHashReusedValuesUnsync};
use kaspa_consensus_core::hashing::sighash_type::SIG_HASH_ALL;
use kaspa_consensus_core::tx::{
    CovenantBinding, PopulatedTransaction, ScriptPublicKey, Transaction, TransactionId, TransactionInput,
    TransactionOutpoint, TransactionOutput, TxInputMass, UtxoEntry, VerifiableTransaction,
};
use kaspa_txscript::caches::Cache;
use kaspa_txscript::covenants::CovenantsContext;
use kaspa_txscript::opcodes::codes::OpCheckSig;
use kaspa_txscript::script_builder::ScriptBuilder;
use kaspa_txscript::{pay_to_script_hash_script, EngineCtx, EngineFlags, TxScriptEngine};
use secp256k1::{Keypair, Message, Secp256k1, SecretKey};
use serde_json::json;
use silverscript_lang::ast::{Expr, ExprKind};
use silverscript_lang::compiler::{compile_contract, struct_object, CompileOptions};

fn bytes_expr(bytes: &[u8]) -> Expr<'static> {
    Expr::new(ExprKind::Array(bytes.iter().copied().map(Expr::byte).collect()), Default::default())
}

fn p2pk_script(pubkey: &[u8]) -> ScriptPublicKey {
    ScriptPublicKey::new(
        0,
        ScriptBuilder::new().add_data(pubkey).unwrap().add_op(OpCheckSig).unwrap().drain().into(),
    )
}

fn sign(tx: &Transaction, entries: &[UtxoEntry], input_idx: usize, keypair: &Keypair) -> Vec<u8> {
    let populated = PopulatedTransaction::new(tx, entries.to_vec());
    let reused = SigHashReusedValuesUnsync::new();
    let sig_hash = calc_schnorr_signature_hash(&populated, input_idx, SIG_HASH_ALL, &reused);
    let msg = Message::from_digest_slice(sig_hash.as_bytes().as_slice()).unwrap();
    let sig = keypair.sign_schnorr(msg);
    let mut out = sig.as_ref().to_vec();
    out.push(SIG_HASH_ALL.to_u8());
    out
}

fn hex_to_bytes(value: &str) -> Vec<u8> {
    let normalized = value.strip_prefix("0x").unwrap_or(value);
    assert!(normalized.len() % 2 == 0, "hex value has odd length");
    (0..normalized.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&normalized[i..i + 2], 16).unwrap())
        .collect()
}

fn hex_to_array_32(value: &str) -> [u8; 32] {
    let bytes = hex_to_bytes(value);
    assert_eq!(bytes.len(), 32, "expected 32-byte hex");
    let mut out = [0u8; 32];
    out.copy_from_slice(&bytes);
    out
}

fn bytes_to_hex(bytes: &[u8]) -> String {
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn spk_script_hex(spk: &ScriptPublicKey) -> String {
    bytes_to_hex(spk.script().as_ref())
}

fn main() {
    let repo_root = std::env::var("TN12_REPO_ROOT").unwrap_or_else(|_| ".".to_string());
    let source = std::fs::read_to_string(format!("{repo_root}/contracts/RecurringTreasuryVault.sil")).unwrap();

    let owner_private_key = std::env::var("OWNER_PRIVATE_KEY").expect("OWNER_PRIVATE_KEY");
    let input_txid = std::env::var("INPUT_TXID").expect("INPUT_TXID");
    let input_index = std::env::var("INPUT_INDEX").unwrap_or_else(|_| "0".to_string()).parse::<u32>().unwrap();
    let input_value = std::env::var("INPUT_VALUE_SOMPI")
        .unwrap_or_else(|_| "15000000000".to_string())
        .parse::<u64>()
        .unwrap();
    let covenant_id_hex = std::env::var("COVENANT_ID").expect("COVENANT_ID");
    let spend_amount = std::env::var("SPEND_AMOUNT_SOMPI")
        .unwrap_or_else(|_| "2500000000".to_string())
        .parse::<i64>()
        .unwrap();
    let compute_budget = std::env::var("COMPUTE_BUDGET")
        .unwrap_or_else(|_| "100".to_string())
        .parse::<u16>()
        .unwrap();

    let cap = std::env::var("CAP_SOMPI").unwrap_or_else(|_| "7500000000".to_string()).parse::<i64>().unwrap();
    let window = std::env::var("WINDOW_START").unwrap_or_else(|_| "9899000".to_string()).parse::<i64>().unwrap();
    let prev_spent = std::env::var("PREV_SPENT_SOMPI").unwrap_or_else(|_| "0".to_string()).parse::<i64>().unwrap();
    let miner_fee = std::env::var("MINER_FEE_SOMPI").unwrap_or_else(|_| "10000".to_string()).parse::<i64>().unwrap();
    let next_spent = prev_spent + spend_amount;
    let change_value = (input_value as i64 - spend_amount - miner_fee) as u64;

    let secp = Secp256k1::new();
    let owner = Keypair::from_secret_key(&secp, &SecretKey::from_slice(&hex_to_array_32(&owner_private_key)).unwrap());
    let owner_pk = owner.x_only_public_key().0.serialize().to_vec();
    let destination_pk = hex_to_bytes(
        &std::env::var("DESTINATION_XONLY").unwrap_or_else(|_| {
            "1dbc18aa4c52b6f35caee2c25352d248e5638ffacfb30bb47ac8c6f0a7924700".to_string()
        }),
    );

    let compile_opts = CompileOptions::default();
    let input_compiled = compile_contract(
        &source,
        &[
            bytes_expr(&owner_pk),
            bytes_expr(&destination_pk),
            Expr::int(cap),
            Expr::int(window),
            Expr::int(prev_spent),
            Expr::int(miner_fee),
        ],
        compile_opts,
    )
    .unwrap();
    let next_compiled = compile_contract(
        &source,
        &[
            bytes_expr(&owner_pk),
            bytes_expr(&destination_pk),
            Expr::int(cap),
            Expr::int(window),
            Expr::int(next_spent),
            Expr::int(miner_fee),
        ],
        compile_opts,
    )
    .unwrap();

    let covenant_id = kaspa_consensus_core::Hash::from_bytes(hex_to_array_32(&covenant_id_hex));
    let input = TransactionInput {
        previous_outpoint: TransactionOutpoint {
            transaction_id: TransactionId::from_bytes(hex_to_array_32(&input_txid)),
            index: input_index,
        },
        signature_script: vec![],
        sequence: 0,
        mass: TxInputMass::ComputeBudget(compute_budget.into()),
    };
    let destination_output = TransactionOutput {
        value: spend_amount as u64,
        script_public_key: p2pk_script(&destination_pk),
        covenant: None,
    };
    let continuation_output = TransactionOutput {
        value: change_value,
        script_public_key: pay_to_script_hash_script(&next_compiled.script),
        covenant: Some(CovenantBinding { authorizing_input: 0, covenant_id }),
    };
    let mut tx = Transaction::new(
        1,
        vec![input],
        vec![destination_output, continuation_output],
        0,
        Default::default(),
        0,
        vec![],
    );
    let utxo = UtxoEntry::new(
        input_value,
        pay_to_script_hash_script(&input_compiled.script),
        0,
        tx.is_coinbase(),
        Some(covenant_id),
    );
    let sig = sign(&tx, &[utxo.clone()], 0, &owner);
    let args = vec![
        struct_object(vec![("spent", Expr::int(next_spent)), ("window", Expr::int(window))]),
        bytes_expr(&sig),
        Expr::int(spend_amount),
    ];
    let mut sigscript = input_compiled.build_sig_script("__spend", args).unwrap();
    sigscript.extend_from_slice(&ScriptBuilder::new().add_data(&input_compiled.script).unwrap().drain());
    tx.inputs[0].signature_script = sigscript.clone();

    let populated = PopulatedTransaction::new(&tx, vec![utxo]);
    let cov_ctx = CovenantsContext::from_tx(&populated).unwrap();
    let cache = Cache::new(10_000);
    let reused = SigHashReusedValuesUnsync::new();
    let ctx = EngineCtx::new(&cache).with_reused(&reused).with_covenants_ctx(&cov_ctx);
    let mut engine = TxScriptEngine::from_transaction_input(
        &populated,
        &tx.inputs[0],
        0,
        populated.utxo(0).unwrap(),
        ctx,
        EngineFlags { covenants_enabled: true, ..Default::default() },
    );
    let local_engine_ok = engine.execute().is_ok();

    let output0 = &tx.outputs[0];
    let output1 = &tx.outputs[1];
    let result = json!({
        "transactionId": tx.id().to_string(),
        "localEngineOk": local_engine_ok,
        "input": {
            "previousOutpoint": {
                "transactionId": input_txid,
                "index": input_index
            },
            "signatureScript": bytes_to_hex(&sigscript),
            "sequence": 0,
            "sigOpCount": 0,
            "computeBudget": compute_budget
        },
        "outputs": [
            {
                "amount": output0.value,
                "scriptPublicKey": {
                    "version": output0.script_public_key.version(),
                    "scriptPublicKey": spk_script_hex(&output0.script_public_key)
                }
            },
            {
                "amount": output1.value,
                "scriptPublicKey": {
                    "version": output1.script_public_key.version(),
                    "scriptPublicKey": spk_script_hex(&output1.script_public_key)
                },
                "covenant": {
                    "authorizingInput": 0,
                    "covenantId": covenant_id_hex
                },
                "nextRedeemScriptHex": bytes_to_hex(&next_compiled.script)
            }
        ],
        "state": {
            "capSompi": cap,
            "windowStart": window,
            "prevSpentSompi": prev_spent,
            "spendAmountSompi": spend_amount,
            "nextSpentSompi": next_spent,
            "minerFeeSompi": miner_fee
        },
        "inputRedeemScriptHex": bytes_to_hex(&input_compiled.script)
    });
    println!("{}", serde_json::to_string_pretty(&result).unwrap());
}
