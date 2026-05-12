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

const ASSET_COVENANT_ID: kaspa_consensus_core::Hash =
    kaspa_consensus_core::Hash::from_bytes(*b"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
const OWNER_COVENANT_ID: kaspa_consensus_core::Hash =
    kaspa_consensus_core::Hash::from_bytes(*b"CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC");
const WRONG_COVENANT_ID: kaspa_consensus_core::Hash =
    kaspa_consensus_core::Hash::from_bytes(*b"DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");

fn bytes_expr(bytes: &[u8]) -> Expr<'static> {
    Expr::bytes(bytes.to_vec())
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

fn run_case(witness_input: i64, include_sibling: bool, sibling_covenant_id: kaspa_consensus_core::Hash) -> bool {
    let repo_root = std::env::var("TN12_REPO_ROOT").unwrap_or_else(|_| ".".to_string());
    let source = std::fs::read_to_string(format!("{repo_root}/contracts/CovenantOwnedAssetDuel.sil")).unwrap();
    let opts = CompileOptions { record_debug_infos: true, ..Default::default() };
    let current = compile_contract(&source, &[bytes_expr(&OWNER_COVENANT_ID.as_bytes()), Expr::int(600)], opts).unwrap();
    let next = compile_contract(&source, &[bytes_expr(&OWNER_COVENANT_ID.as_bytes()), Expr::int(450)], opts).unwrap();

    let output = TransactionOutput {
        value: 1_000,
        script_public_key: pay_to_script_hash_script(&next.script),
        covenant: Some(CovenantBinding { authorizing_input: 0, covenant_id: ASSET_COVENANT_ID }),
    };
    let args = vec![Expr::int(witness_input), bytes_expr(&OWNER_COVENANT_ID.as_bytes()), Expr::int(150)];
    let mut sigscript = current.build_sig_script("strike", args).unwrap();
    sigscript.extend_from_slice(&ScriptBuilder::new().add_data(&current.script).unwrap().drain());

    let mut inputs = vec![tx_input(0x11, 0, sigscript)];
    let mut entries = vec![UtxoEntry::new(
        1_000,
        pay_to_script_hash_script(&current.script),
        0,
        false,
        Some(ASSET_COVENANT_ID),
    )];
    if include_sibling {
        inputs.push(tx_input(0x22, 0, vec![]));
        entries.push(UtxoEntry::new(500, op_true_spk(), 0, false, Some(sibling_covenant_id)));
    }

    let tx = Transaction::new(1, inputs, vec![output], 0, Default::default(), 0, vec![]);
    execute(tx, entries)
}

fn main() {
    let cases = [
        ("sibling_covenant_authorizes_asset_move", run_case(1, true, OWNER_COVENANT_ID), true),
        ("wrong_witness_rejects_asset_move", run_case(0, true, OWNER_COVENANT_ID), false),
        ("missing_sibling_rejects_asset_move", run_case(1, false, OWNER_COVENANT_ID), false),
        ("wrong_sibling_covenant_rejects_asset_move", run_case(1, true, WRONG_COVENANT_ID), false),
    ];

    for (name, got, expected) in cases {
        println!("{name} got={got} expected={expected}");
        assert_eq!(got, expected, "{name}");
    }
}
