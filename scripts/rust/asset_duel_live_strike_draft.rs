use kaspa_consensus_core::hashing::sighash::{calc_schnorr_signature_hash, SigHashReusedValuesUnsync};
use kaspa_consensus_core::hashing::sighash_type::SIG_HASH_ALL;
use kaspa_consensus_core::tx::{
    CovenantBinding, PopulatedTransaction, ScriptPublicKey, Transaction, TransactionId, TransactionInput,
    TransactionOutpoint, TransactionOutput, TxInputMass, UtxoEntry, VerifiableTransaction,
};
use kaspa_consensus_core::Hash;
use kaspa_txscript::caches::Cache;
use kaspa_txscript::covenants::CovenantsContext;
use kaspa_txscript::script_builder::ScriptBuilder;
use kaspa_txscript::{pay_to_script_hash_script, EngineCtx, EngineFlags, TxScriptEngine};
use secp256k1::{Keypair, Message, Secp256k1, SecretKey};
use serde_json::json;
use silverscript_lang::ast::Expr;
use silverscript_lang::compiler::{compile_contract, CompileOptions};

fn bytes_expr(bytes: &[u8]) -> Expr<'static> {
    Expr::bytes(bytes.to_vec())
}

fn hex_to_bytes(value: &str) -> Vec<u8> {
    let normalized = value.strip_prefix("0x").unwrap_or(value);
    assert!(normalized.len() % 2 == 0, "hex value has odd length");
    (0..normalized.len()).step_by(2).map(|i| u8::from_str_radix(&normalized[i..i + 2], 16).unwrap()).collect()
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

fn spk_from_hex(value: &str) -> ScriptPublicKey {
    ScriptPublicKey::new(0, hex_to_bytes(value).into())
}

fn spk_script_hex(spk: &ScriptPublicKey) -> String {
    bytes_to_hex(spk.script().as_ref())
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

fn execute_input(tx: &Transaction, entries: Vec<UtxoEntry>, input_idx: usize) -> bool {
    let populated = PopulatedTransaction::new(tx, entries);
    let Ok(cov_ctx) = CovenantsContext::from_tx(&populated) else { return false; };
    let cache = Cache::new(10_000);
    let reused = SigHashReusedValuesUnsync::new();
    let ctx = EngineCtx::new(&cache).with_reused(&reused).with_covenants_ctx(&cov_ctx);
    let mut engine = TxScriptEngine::from_transaction_input(
        &populated,
        &tx.inputs[input_idx],
        input_idx,
        populated.utxo(input_idx).unwrap(),
        ctx,
        EngineFlags { covenants_enabled: true, ..Default::default() },
    );
    engine.execute().is_ok()
}

fn main() {
    let repo_root = std::env::var("TN12_REPO_ROOT").unwrap_or_else(|_| ".".to_string());
    let source = std::fs::read_to_string(format!("{repo_root}/contracts/CovenantOwnedAssetDuel.sil")).unwrap();
    let private_key = std::env::var("OWNER_PRIVATE_KEY").expect("OWNER_PRIVATE_KEY");

    let asset_txid = std::env::var("ASSET_TXID").expect("ASSET_TXID");
    let asset_index = std::env::var("ASSET_INDEX").unwrap_or_else(|_| "0".to_string()).parse::<u32>().unwrap();
    let asset_value = std::env::var("ASSET_VALUE_SOMPI").unwrap_or_else(|_| "1000000000".to_string()).parse::<u64>().unwrap();
    let asset_covenant_id_hex = std::env::var("ASSET_COVENANT_ID").expect("ASSET_COVENANT_ID");

    let owner_txid = std::env::var("OWNER_TXID").expect("OWNER_TXID");
    let owner_index = std::env::var("OWNER_INDEX").unwrap_or_else(|_| "0".to_string()).parse::<u32>().unwrap();
    let owner_value = std::env::var("OWNER_VALUE_SOMPI").unwrap_or_else(|_| "100000000".to_string()).parse::<u64>().unwrap();
    let owner_covenant_id_hex = std::env::var("OWNER_COVENANT_ID").expect("OWNER_COVENANT_ID");
    let owner_spk_hex = std::env::var("OWNER_SCRIPT_PUBLIC_KEY").expect("OWNER_SCRIPT_PUBLIC_KEY");

    let compute_budget = std::env::var("COMPUTE_BUDGET").unwrap_or_else(|_| "60".to_string()).parse::<u16>().unwrap();
    let owner_compute_budget = std::env::var("OWNER_COMPUTE_BUDGET").unwrap_or_else(|_| "10".to_string()).parse::<u16>().unwrap();
    let miner_fee = std::env::var("MINER_FEE_SOMPI").unwrap_or_else(|_| "20000".to_string()).parse::<u64>().unwrap();
    let initial_power = std::env::var("INITIAL_POWER").unwrap_or_else(|_| "600".to_string()).parse::<i64>().unwrap();
    let spend_power = std::env::var("SPEND_POWER").unwrap_or_else(|_| "150".to_string()).parse::<i64>().unwrap();
    let next_power = initial_power - spend_power;

    let secp = Secp256k1::new();
    let owner_key = Keypair::from_secret_key(&secp, &SecretKey::from_slice(&hex_to_array_32(&private_key)).unwrap());
    let asset_covenant_id = Hash::from_bytes(hex_to_array_32(&asset_covenant_id_hex));
    let owner_covenant_id = Hash::from_bytes(hex_to_array_32(&owner_covenant_id_hex));
    let owner_spk = spk_from_hex(&owner_spk_hex);

    let input_compiled = compile_contract(
        &source,
        &[bytes_expr(&hex_to_bytes(&owner_covenant_id_hex)), Expr::int(initial_power)],
        CompileOptions::default(),
    ).unwrap();
    let next_compiled = compile_contract(
        &source,
        &[bytes_expr(&hex_to_bytes(&owner_covenant_id_hex)), Expr::int(next_power)],
        CompileOptions::default(),
    ).unwrap();

    let asset_input = TransactionInput {
        previous_outpoint: TransactionOutpoint {
            transaction_id: TransactionId::from_bytes(hex_to_array_32(&asset_txid)),
            index: asset_index,
        },
        signature_script: vec![],
        sequence: 0,
        mass: TxInputMass::ComputeBudget(compute_budget.into()),
    };
    let owner_input = TransactionInput {
        previous_outpoint: TransactionOutpoint {
            transaction_id: TransactionId::from_bytes(hex_to_array_32(&owner_txid)),
            index: owner_index,
        },
        signature_script: vec![],
        sequence: 0,
        mass: TxInputMass::ComputeBudget(owner_compute_budget.into()),
    };
    let output = TransactionOutput {
        value: asset_value - miner_fee,
        script_public_key: pay_to_script_hash_script(&next_compiled.script),
        covenant: Some(CovenantBinding { authorizing_input: 0, covenant_id: asset_covenant_id }),
    };
    let mut tx = Transaction::new(1, vec![asset_input, owner_input], vec![output], 0, Default::default(), 0, vec![]);

    let asset_entry = UtxoEntry::new(
        asset_value,
        pay_to_script_hash_script(&input_compiled.script),
        0,
        tx.is_coinbase(),
        Some(asset_covenant_id),
    );
    let owner_entry = UtxoEntry::new(owner_value, owner_spk.clone(), 0, tx.is_coinbase(), Some(owner_covenant_id));

    let asset_sigscript = {
        let mut script = input_compiled
            .build_sig_script("strike", vec![Expr::int(1), bytes_expr(&hex_to_bytes(&owner_covenant_id_hex)), Expr::int(spend_power)])
            .unwrap();
        script.extend_from_slice(&ScriptBuilder::new().add_data(&input_compiled.script).unwrap().drain());
        script
    };
    tx.inputs[0].signature_script = asset_sigscript.clone();
    let owner_signature = sign(&tx, &[asset_entry.clone(), owner_entry.clone()], 1, &owner_key);
    let owner_sigscript = ScriptBuilder::new().add_data(&owner_signature).unwrap().drain().to_vec();
    tx.inputs[1].signature_script = owner_sigscript.clone();

    let asset_engine_ok = execute_input(&tx, vec![asset_entry.clone(), owner_entry.clone()], 0);
    let owner_engine_ok = execute_input(&tx, vec![asset_entry, owner_entry], 1);

    println!("{}", serde_json::to_string_pretty(&json!({
        "transactionId": tx.id().to_string(),
        "localEngineOk": asset_engine_ok && owner_engine_ok,
        "assetEngineOk": asset_engine_ok,
        "ownerMarkerEngineOk": owner_engine_ok,
        "inputs": [
            {
                "previousOutpoint": { "transactionId": asset_txid, "index": asset_index },
                "signatureScript": bytes_to_hex(&asset_sigscript),
                "sequence": 0,
                "sigOpCount": 0,
                "computeBudget": compute_budget
            },
            {
                "previousOutpoint": { "transactionId": owner_txid, "index": owner_index },
                "signatureScript": bytes_to_hex(&owner_sigscript),
                "sequence": 0,
                "sigOpCount": 1,
                "computeBudget": owner_compute_budget
            }
        ],
        "outputs": [{
            "amount": tx.outputs[0].value,
            "scriptPublicKey": {
                "version": tx.outputs[0].script_public_key.version(),
                "scriptPublicKey": spk_script_hex(&tx.outputs[0].script_public_key)
            },
            "covenant": { "authorizingInput": 0, "covenantId": asset_covenant_id_hex },
            "nextRedeemScriptHex": bytes_to_hex(&next_compiled.script)
        }],
        "state": {
            "ownerCovenantId": owner_covenant_id_hex,
            "powerBefore": initial_power,
            "spendPower": spend_power,
            "powerAfter": next_power,
            "minerFeeSompi": miner_fee,
            "witnessInput": 1
        },
        "scriptEvidence": {
            "inputRedeemScriptHex": bytes_to_hex(&input_compiled.script),
            "nextRedeemScriptHex": bytes_to_hex(&next_compiled.script),
            "ownerMarkerScriptPublicKey": owner_spk_hex
        }
    })).unwrap());
}
