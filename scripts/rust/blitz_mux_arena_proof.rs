use blake2b_simd::Params as Blake2bParams;
use kaspa_consensus_core::hashing::sighash::SigHashReusedValuesUnsync;
use kaspa_consensus_core::tx::{
    CovenantBinding, PopulatedTransaction, Transaction, TransactionId, TransactionInput, TransactionOutpoint, TransactionOutput,
    TxInputMass, UtxoEntry, VerifiableTransaction,
};
use kaspa_consensus_core::Hash;
use kaspa_txscript::caches::Cache;
use kaspa_txscript::covenants::CovenantsContext;
use kaspa_txscript::script_builder::ScriptBuilder;
use kaspa_txscript::{pay_to_script_hash_script, EngineCtx, EngineFlags, TxScriptEngine};
use silverscript_lang::ast::Expr;
use silverscript_lang::compiler::{compile_contract, CompileOptions, CompiledContract};

const FAMILY_COVENANT_ID: Hash = Hash::from_bytes(*b"MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM");

fn bytes_expr(bytes: &[u8]) -> Expr<'static> {
    Expr::bytes(bytes.to_vec())
}

fn load_source(name: &str) -> String {
    let repo_root = std::env::var("TN12_REPO_ROOT").unwrap_or_else(|_| ".".to_string());
    std::fs::read_to_string(format!("{repo_root}/contracts/{name}.sil")).unwrap()
}

fn template_parts_and_hash(source: &str, state: &[Expr<'_>]) -> (Vec<u8>, Vec<u8>, Vec<u8>) {
    let compiled = compile_contract(source, state, CompileOptions::default()).unwrap();
    let layout = compiled.state_layout;
    let prefix = compiled.script[..layout.start].to_vec();
    let suffix = compiled.script[layout.start + layout.len..].to_vec();
    let template = Blake2bParams::new().hash_length(32).to_state().update(&prefix).update(&suffix).finalize().as_bytes().to_vec();
    (prefix, suffix, template)
}

fn tx_input(byte: u8, signature_script: Vec<u8>, sequence: u64) -> TransactionInput {
    TransactionInput {
        previous_outpoint: TransactionOutpoint { transaction_id: TransactionId::from_bytes([byte; 32]), index: 0 },
        signature_script,
        sequence,
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

fn p2sh_sigscript(contract: &CompiledContract<'_>, function: &str, args: Vec<Expr<'_>>) -> Vec<u8> {
    let mut sigscript = contract.build_sig_script(function, args).unwrap();
    sigscript.extend_from_slice(&ScriptBuilder::new().add_data(&contract.script).unwrap().drain());
    sigscript
}

fn transition(
    input_contract: &CompiledContract<'_>,
    function: &str,
    args: Vec<Expr<'_>>,
    output_contract: &CompiledContract<'_>,
    sequence: u64,
) -> bool {
    let input = tx_input(0x44, p2sh_sigscript(input_contract, function, args), sequence);
    let output = TransactionOutput {
        value: 1_000,
        script_public_key: pay_to_script_hash_script(&output_contract.script),
        covenant: Some(CovenantBinding { authorizing_input: 0, covenant_id: FAMILY_COVENANT_ID }),
    };
    let tx = Transaction::new(1, vec![input], vec![output], 0, Default::default(), 0, vec![]);
    let entry = UtxoEntry::new(
        1_500,
        pay_to_script_hash_script(&input_contract.script),
        0,
        false,
        Some(FAMILY_COVENANT_ID),
    );
    execute(tx, vec![entry])
}

struct Fixture {
    mux_source: String,
    a_source: String,
    b_source: String,
    mux_prefix: Vec<u8>,
    mux_suffix: Vec<u8>,
    mux_template: Vec<u8>,
    a_prefix: Vec<u8>,
    a_suffix: Vec<u8>,
    a_template: Vec<u8>,
    b_prefix: Vec<u8>,
    b_suffix: Vec<u8>,
    b_template: Vec<u8>,
}

fn initial_dummy_state(pending: i64) -> Vec<Expr<'static>> {
    vec![
        bytes_expr(&[0x11; 32]),
        bytes_expr(&[0x21; 32]),
        bytes_expr(&[0x31; 32]),
        Expr::int(5),
        Expr::int(10),
        Expr::int(pending),
    ]
}

fn build_fixture() -> Fixture {
    let mux_source = load_source("BlitzMux");
    let a_source = load_source("BlitzWorkerA");
    let b_source = load_source("BlitzWorkerB");
    let (mux_prefix, mux_suffix, mux_template) = template_parts_and_hash(&mux_source, &initial_dummy_state(0));
    let (a_prefix, a_suffix, a_template) = template_parts_and_hash(&a_source, &initial_dummy_state(1));
    let (b_prefix, b_suffix, b_template) = template_parts_and_hash(&b_source, &initial_dummy_state(2));

    Fixture {
        mux_source,
        a_source,
        b_source,
        mux_prefix,
        mux_suffix,
        mux_template,
        a_prefix,
        a_suffix,
        a_template,
        b_prefix,
        b_suffix,
        b_template,
    }
}

fn state(fix: &Fixture, value: i64, timeout: i64, pending: i64) -> Vec<Expr<'static>> {
    vec![
        bytes_expr(&fix.mux_template),
        bytes_expr(&fix.a_template),
        bytes_expr(&fix.b_template),
        Expr::int(value),
        Expr::int(timeout),
        Expr::int(pending),
    ]
}

fn compile_family_member<'a>(source: &'a str, fix: &Fixture, value: i64, timeout: i64, pending: i64) -> CompiledContract<'a> {
    compile_contract(source, &state(fix, value, timeout, pending), CompileOptions::default()).unwrap()
}

fn main() {
    let fix = build_fixture();
    let mux_idle = compile_family_member(&fix.mux_source, &fix, 5, 10, 0);
    let worker_a_pending = compile_family_member(&fix.a_source, &fix, 5, 10, 1);
    let worker_b_pending = compile_family_member(&fix.b_source, &fix, 5, 10, 2);
    let mux_after_a = compile_family_member(&fix.mux_source, &fix, 8, 10, 0);
    let mux_after_b = compile_family_member(&fix.mux_source, &fix, 9, 10, 0);
    let mux_after_timeout = compile_family_member(&fix.mux_source, &fix, 4, 10, 0);

    let cases = [
        (
            "mux_routes_to_worker_a",
            transition(&mux_idle, "route", vec![Expr::int(0), bytes_expr(&fix.a_prefix), bytes_expr(&fix.a_suffix)], &worker_a_pending, 0),
            true,
        ),
        (
            "mux_routes_to_worker_b",
            transition(&mux_idle, "route", vec![Expr::int(1), bytes_expr(&fix.b_prefix), bytes_expr(&fix.b_suffix)], &worker_b_pending, 0),
            true,
        ),
        (
            "mux_bad_selector_rejects",
            transition(&mux_idle, "route", vec![Expr::int(2), bytes_expr(&fix.b_prefix), bytes_expr(&fix.b_suffix)], &worker_b_pending, 0),
            false,
        ),
        (
            "worker_a_returns_to_mux",
            transition(
                &worker_a_pending,
                "apply",
                vec![Expr::int(3), bytes_expr(&fix.mux_prefix), bytes_expr(&fix.mux_suffix)],
                &mux_after_a,
                0,
            ),
            true,
        ),
        (
            "worker_b_returns_to_mux",
            transition(
                &worker_b_pending,
                "apply",
                vec![Expr::int(5), Expr::int(1), bytes_expr(&fix.mux_prefix), bytes_expr(&fix.mux_suffix)],
                &mux_after_b,
                0,
            ),
            true,
        ),
        (
            "worker_a_timeout_returns_to_mux",
            transition(
                &worker_a_pending,
                "timeout",
                vec![bytes_expr(&fix.mux_prefix), bytes_expr(&fix.mux_suffix)],
                &mux_after_timeout,
                10,
            ),
            true,
        ),
        (
            "worker_a_timeout_too_early_rejects",
            transition(
                &worker_a_pending,
                "timeout",
                vec![bytes_expr(&fix.mux_prefix), bytes_expr(&fix.mux_suffix)],
                &mux_after_timeout,
                9,
            ),
            false,
        ),
    ];

    for (name, got, expected) in cases {
        println!("{name} got={got} expected={expected}");
        assert_eq!(got, expected, "{name}");
    }
}
