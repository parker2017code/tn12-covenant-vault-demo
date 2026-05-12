use kaspa_consensus_core::hashing::sighash::SigHashReusedValuesUnsync;
use kaspa_consensus_core::tx::{
    CovenantBinding, PopulatedTransaction, ScriptPublicKey, Transaction, TransactionId, TransactionInput, TransactionOutpoint,
    TransactionOutput, TxInputMass, UtxoEntry, VerifiableTransaction,
};
use kaspa_txscript::caches::Cache;
use kaspa_txscript::covenants::CovenantsContext;
use kaspa_txscript::opcodes::codes::OpTrue;
use kaspa_txscript::script_builder::ScriptBuilder;
use kaspa_txscript::{pay_to_script_hash_script, EngineCtx, EngineFlags, TxScriptEngine};
use silverscript_lang::ast::Expr;
use silverscript_lang::compiler::{compile_contract, CompileOptions};

fn bytes_expr(bytes: &[u8]) -> Expr<'static> {
    Expr::bytes(bytes.to_vec())
}

fn hex_to_bytes(value: &str) -> Vec<u8> {
    let normalized = value.strip_prefix("0x").unwrap_or(value);
    assert!(normalized.len() % 2 == 0, "hex value has odd length");
    (0..normalized.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&normalized[i..i + 2], 16).unwrap())
        .collect()
}

fn hash_from_env(name: &str, fallback: [u8; 32]) -> kaspa_consensus_core::Hash {
    if let Ok(value) = std::env::var(name) {
        let bytes = hex_to_bytes(&value);
        assert_eq!(bytes.len(), 32, "{name} must be 32 bytes");
        let mut out = [0u8; 32];
        out.copy_from_slice(&bytes);
        return kaspa_consensus_core::Hash::from_bytes(out);
    }
    kaspa_consensus_core::Hash::from_bytes(fallback)
}

fn op_true_spk() -> ScriptPublicKey {
    ScriptPublicKey::new(0, vec![OpTrue].into())
}

fn tx_input(byte: u8, index: u32, signature_script: Vec<u8>) -> TransactionInput {
    TransactionInput {
        previous_outpoint: TransactionOutpoint { transaction_id: TransactionId::from_bytes([byte; 32]), index },
        signature_script,
        sequence: 0,
        mass: TxInputMass::ComputeBudget(30.into()),
    }
}

fn execute(tx: Transaction, entries: Vec<UtxoEntry>) -> bool {
    let input = tx.inputs[0].clone();
    let populated = PopulatedTransaction::new(&tx, entries);
    let cov_ctx = match CovenantsContext::from_tx(&populated) {
        Ok(ctx) => ctx,
        Err(_) => return false,
    };
    let cache = Cache::new(10_000);
    let reused = SigHashReusedValuesUnsync::new();
    let ctx = EngineCtx::new(&cache).with_reused(&reused).with_covenants_ctx(&cov_ctx);
    let Some(utxo) = populated.utxo(0) else {
        return false;
    };
    let mut engine = TxScriptEngine::from_transaction_input(
        &populated,
        &input,
        0,
        utxo,
        ctx,
        EngineFlags { covenants_enabled: true, sigop_script_units: 0.into() },
    );
    engine.execute().is_ok()
}

fn run_case(
    asset_covenant_id: kaspa_consensus_core::Hash,
    owner_covenant_id: kaspa_consensus_core::Hash,
    witness_input: i64,
    include_sibling: bool,
    sibling_covenant_id: kaspa_consensus_core::Hash,
) -> bool {
    let repo_root = std::env::var("TN12_REPO_ROOT").unwrap_or_else(|_| ".".to_string());
    let source = std::fs::read_to_string(format!("{repo_root}/contracts/CovenantOwnedAssetDuel.sil")).unwrap();
    let opts = CompileOptions { record_debug_infos: true, ..Default::default() };
    let current = compile_contract(&source, &[bytes_expr(&owner_covenant_id.as_bytes()), Expr::int(600)], opts).unwrap();
    let next = compile_contract(&source, &[bytes_expr(&owner_covenant_id.as_bytes()), Expr::int(450)], opts).unwrap();

    let output = TransactionOutput {
        value: 1_000,
        script_public_key: pay_to_script_hash_script(&next.script),
        covenant: Some(CovenantBinding { authorizing_input: 0, covenant_id: asset_covenant_id }),
    };
    let args = vec![Expr::int(witness_input), bytes_expr(&owner_covenant_id.as_bytes()), Expr::int(150)];
    let mut sigscript = current.build_sig_script("strike", args).unwrap();
    sigscript.extend_from_slice(&ScriptBuilder::new().add_data(&current.script).unwrap().drain());

    let mut inputs = vec![tx_input(0x11, 0, sigscript)];
    let mut entries = vec![UtxoEntry::new(
        1_000,
        pay_to_script_hash_script(&current.script),
        0,
        false,
        Some(asset_covenant_id),
    )];
    if include_sibling {
        inputs.push(tx_input(0x22, 0, vec![]));
        entries.push(UtxoEntry::new(500, op_true_spk(), 0, false, Some(sibling_covenant_id)));
    }

    let tx = Transaction::new(1, inputs, vec![output], 0, Default::default(), 0, vec![]);
    execute(tx, entries)
}

fn main() {
    let asset_covenant_id = hash_from_env("ASSET_COVENANT_ID", *b"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    let owner_covenant_id = hash_from_env("OWNER_COVENANT_ID", *b"CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC");
    let wrong_covenant_id = hash_from_env("WRONG_COVENANT_ID", *b"DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
    let cases = [
        ("sibling_covenant_authorizes_asset_move", run_case(asset_covenant_id, owner_covenant_id, 1, true, owner_covenant_id), true),
        ("wrong_witness_rejects_asset_move", run_case(asset_covenant_id, owner_covenant_id, 0, true, owner_covenant_id), false),
        ("missing_sibling_rejects_asset_move", run_case(asset_covenant_id, owner_covenant_id, 1, false, owner_covenant_id), false),
        ("wrong_sibling_covenant_rejects_asset_move", run_case(asset_covenant_id, owner_covenant_id, 1, true, wrong_covenant_id), false),
    ];

    for (name, got, expected) in cases {
        println!("{name} got={got} expected={expected}");
        assert_eq!(got, expected, "{name}");
    }
}
