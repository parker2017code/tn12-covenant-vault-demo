use kaspa_consensus_core::hashing::sighash::{calc_schnorr_signature_hash, SigHashReusedValuesUnsync};
use kaspa_consensus_core::hashing::sighash_type::SIG_HASH_ALL;
use kaspa_consensus_core::tx::{
    PopulatedTransaction, ScriptPublicKey, Transaction, TransactionId, TransactionInput,
    TransactionOutpoint, TransactionOutput, TxInputMass, UtxoEntry, VerifiableTransaction,
};
use kaspa_consensus_core::Hash;
use kaspa_txscript::caches::Cache;
use kaspa_txscript::covenants::CovenantsContext;
use kaspa_txscript::opcodes::codes::OpCheckSig;
use kaspa_txscript::script_builder::ScriptBuilder;
use kaspa_txscript::{pay_to_script_hash_script, EngineCtx, EngineFlags, TxScriptEngine};
use secp256k1::{Keypair, Secp256k1, SecretKey};
use serde_json::json;
use silverscript_lang::ast::{Expr, ExprKind};
use silverscript_lang::compiler::{compile_contract, CompileOptions};

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
    let sig = keypair.sign_schnorr(sig_hash.as_bytes().as_slice());
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

struct Case {
    id: &'static str,
    output_amount: u64,
    input_value: u64,
    recipient: Vec<u8>,
    expected: bool,
}

fn execute_case(
    source: &str,
    operator_keypair: &Keypair,
    operator_pk: &[u8],
    expected_recipient_pk: &[u8],
    payout: i64,
    miner_fee: i64,
    covenant_id: Hash,
    covenant_id_hex: &str,
    input_txid: &str,
    input_index: u32,
    case: &Case,
) -> serde_json::Value {
    let compiled = compile_contract(
        source,
        &[
            bytes_expr(operator_pk),
            bytes_expr(expected_recipient_pk),
            Expr::int(payout),
            Expr::int(miner_fee),
        ],
        CompileOptions::default(),
    )
    .unwrap();

    let input = TransactionInput {
        previous_outpoint: TransactionOutpoint {
            transaction_id: TransactionId::from_bytes(hex_to_array_32(input_txid)),
            index: input_index,
        },
        signature_script: vec![],
        sequence: u64::MAX,
        mass: TxInputMass::SigopCount(1.into()),
    };
    let output = TransactionOutput {
        value: case.output_amount,
        script_public_key: p2pk_script(&case.recipient),
        covenant: None,
    };
    let mut tx = Transaction::new(0, vec![input], vec![output], 0, Default::default(), 0, vec![]);
    let utxo = UtxoEntry::new(
        case.input_value,
        pay_to_script_hash_script(&compiled.script),
        0,
        tx.is_coinbase(),
        Some(covenant_id),
    );

    let sig = sign(&tx, &[utxo.clone()], 0, operator_keypair);
    let mut sigscript = compiled.build_sig_script("release", vec![bytes_expr(&sig)]).unwrap();
    sigscript.extend_from_slice(&ScriptBuilder::new().add_data(&compiled.script).unwrap().drain());
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
    let got = engine.execute().is_ok();

    json!({
        "id": case.id,
        "status": if got == case.expected { "passed" } else { "failed" },
        "got": got,
        "expected": case.expected,
        "transactionId": tx.id().to_string(),
        "outputAmountSompi": case.output_amount.to_string(),
        "inputValueSompi": case.input_value.to_string(),
        "recipientScriptPublicKey": spk_script_hex(&tx.outputs[0].script_public_key),
        "covenantId": covenant_id_hex,
        "signatureScriptHex": bytes_to_hex(&sigscript),
    })
}

fn main() {
    let repo_root = std::env::var("TN12_REPO_ROOT").unwrap_or_else(|_| ".".to_string());
    let source = std::fs::read_to_string(format!("{repo_root}/contracts/SchedulerCovenantPayout.sil")).unwrap();

    let operator_private_key = std::env::var("OPERATOR_PRIVATE_KEY").expect("OPERATOR_PRIVATE_KEY");
    let operator_pk = hex_to_bytes(&std::env::var("OPERATOR_XONLY").expect("OPERATOR_XONLY"));
    let recipient_pk = hex_to_bytes(&std::env::var("RECIPIENT_XONLY").expect("RECIPIENT_XONLY"));
    let wrong_recipient_pk = hex_to_bytes(
        &std::env::var("WRONG_RECIPIENT_XONLY")
            .unwrap_or_else(|_| "1111111111111111111111111111111111111111111111111111111111111111".to_string()),
    );
    let input_txid = std::env::var("INPUT_TXID").expect("INPUT_TXID");
    let input_index = std::env::var("INPUT_INDEX").unwrap_or_else(|_| "0".to_string()).parse::<u32>().unwrap();
    let covenant_id_hex = std::env::var("COVENANT_ID").expect("COVENANT_ID");
    let payout = std::env::var("PAYOUT_SOMPI").unwrap_or_else(|_| "400000000".to_string()).parse::<i64>().unwrap();
    let miner_fee = std::env::var("MINER_FEE_SOMPI").unwrap_or_else(|_| "5000".to_string()).parse::<i64>().unwrap();
    let input_value = (payout + miner_fee) as u64;

    let secp = Secp256k1::new();
    let operator_keypair = Keypair::from_secret_key(&secp, &SecretKey::from_slice(&hex_to_array_32(&operator_private_key)).unwrap());
    let covenant_id = Hash::from_bytes(hex_to_array_32(&covenant_id_hex));
    let wrong_amount = (payout - 1) as u64;
    let wrong_input_value = (payout + miner_fee + 1) as u64;

    let cases = [
        Case { id: "valid_scheduler_payout_passes", output_amount: payout as u64, input_value, recipient: recipient_pk.clone(), expected: true },
        Case { id: "wrong_recipient_rejects", output_amount: payout as u64, input_value, recipient: wrong_recipient_pk, expected: false },
        Case { id: "wrong_payout_amount_rejects", output_amount: wrong_amount, input_value, recipient: recipient_pk.clone(), expected: false },
        Case { id: "wrong_input_value_rejects", output_amount: payout as u64, input_value: wrong_input_value, recipient: recipient_pk, expected: false },
    ];

    let rows: Vec<_> = cases
        .iter()
        .map(|case| {
            execute_case(
                &source,
                &operator_keypair,
                &operator_pk,
                &hex_to_bytes(&std::env::var("RECIPIENT_XONLY").expect("RECIPIENT_XONLY")),
                payout,
                miner_fee,
                covenant_id,
                &covenant_id_hex,
                &input_txid,
                input_index,
                case,
            )
        })
        .collect();

    println!("{}", serde_json::to_string_pretty(&json!({ "cases": rows })).unwrap());
}
