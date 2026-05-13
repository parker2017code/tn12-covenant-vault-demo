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
use serde_json::json;
use silverscript_lang::ast::Expr;
use silverscript_lang::compiler::{compile_contract, CompileOptions, CompiledContract};

fn bytes_expr(bytes: &[u8]) -> Expr<'static> { Expr::bytes(bytes.to_vec()) }
fn hex_to_bytes(value: &str) -> Vec<u8> {
    let normalized = value.strip_prefix("0x").unwrap_or(value);
    (0..normalized.len()).step_by(2).map(|i| u8::from_str_radix(&normalized[i..i + 2], 16).unwrap()).collect()
}
fn hex_to_array_32(value: &str) -> [u8; 32] {
    let bytes = hex_to_bytes(value);
    let mut out = [0u8; 32];
    out.copy_from_slice(&bytes);
    out
}
fn bytes_to_hex(bytes: &[u8]) -> String { bytes.iter().map(|byte| format!("{byte:02x}")).collect() }
fn spk_script_hex(spk: &kaspa_consensus_core::tx::ScriptPublicKey) -> String { bytes_to_hex(spk.script().as_ref()) }
fn load_source(repo_root: &str, name: &str) -> String { std::fs::read_to_string(format!("{repo_root}/contracts/{name}.sil")).unwrap() }

fn template_parts_and_hash(source: &str, state: &[Expr<'_>]) -> (Vec<u8>, Vec<u8>, Vec<u8>) {
    let compiled = compile_contract(source, state, CompileOptions::default()).unwrap();
    let layout = compiled.state_layout;
    let prefix = compiled.script[..layout.start].to_vec();
    let suffix = compiled.script[layout.start + layout.len..].to_vec();
    let template = Blake2bParams::new().hash_length(32).to_state().update(&prefix).update(&suffix).finalize().as_bytes().to_vec();
    (prefix, suffix, template)
}
fn initial_dummy_state(pending: i64) -> Vec<Expr<'static>> {
    vec![bytes_expr(&[0x11; 32]), bytes_expr(&[0x21; 32]), bytes_expr(&[0x31; 32]), Expr::int(5), Expr::int(10), Expr::int(pending)]
}
fn state(mux_template: &[u8], a_template: &[u8], b_template: &[u8], value: i64, timeout: i64, pending: i64) -> Vec<Expr<'static>> {
    vec![bytes_expr(mux_template), bytes_expr(a_template), bytes_expr(b_template), Expr::int(value), Expr::int(timeout), Expr::int(pending)]
}
fn compile_member<'a>(source: &'a str, mux_template: &[u8], a_template: &[u8], b_template: &[u8], value: i64, timeout: i64, pending: i64) -> CompiledContract<'a> {
    compile_contract(source, &state(mux_template, a_template, b_template, value, timeout, pending), CompileOptions::default()).unwrap()
}
fn p2sh_sigscript(contract: &CompiledContract<'_>, function: &str, args: Vec<Expr<'_>>) -> Vec<u8> {
    let mut sigscript = contract.build_sig_script(function, args).unwrap();
    sigscript.extend_from_slice(&ScriptBuilder::new().add_data(&contract.script).unwrap().drain());
    sigscript
}
fn execute(tx: &Transaction, entry: UtxoEntry) -> bool {
    let populated = PopulatedTransaction::new(tx, vec![entry]);
    let Ok(cov_ctx) = CovenantsContext::from_tx(&populated) else { return false; };
    let cache = Cache::new(10_000);
    let reused = SigHashReusedValuesUnsync::new();
    let ctx = EngineCtx::new(&cache).with_reused(&reused).with_covenants_ctx(&cov_ctx);
    let mut engine = TxScriptEngine::from_transaction_input(
        &populated,
        &tx.inputs[0],
        0,
        populated.utxo(0).unwrap(),
        ctx,
        EngineFlags { covenants_enabled: true, sigop_script_units: 0.into() },
    );
    engine.execute().is_ok()
}

fn main() {
    let repo_root = std::env::var("TN12_REPO_ROOT").unwrap_or_else(|_| ".".to_string());
    let mux_source = load_source(&repo_root, "BlitzMux");
    let a_source = load_source(&repo_root, "BlitzWorkerA");
    let b_source = load_source(&repo_root, "BlitzWorkerB");
    let (mux_prefix, mux_suffix, mux_template) = template_parts_and_hash(&mux_source, &initial_dummy_state(0));
    let (_a_prefix, _a_suffix, a_template) = template_parts_and_hash(&a_source, &initial_dummy_state(1));
    let (_b_prefix, _b_suffix, b_template) = template_parts_and_hash(&b_source, &initial_dummy_state(2));

    let input_txid = std::env::var("INPUT_TXID").expect("INPUT_TXID");
    let input_index = std::env::var("INPUT_INDEX").unwrap_or_else(|_| "0".to_string()).parse::<u32>().unwrap();
    let input_value = std::env::var("INPUT_VALUE_SOMPI").unwrap_or_else(|_| "999980000".to_string()).parse::<u64>().unwrap();
    let fee = std::env::var("MINER_FEE_SOMPI").unwrap_or_else(|_| "20000".to_string()).parse::<u64>().unwrap();
    let covenant_id_hex = std::env::var("COVENANT_ID").expect("COVENANT_ID");
    let compute_budget = std::env::var("COMPUTE_BUDGET").unwrap_or_else(|_| "30".to_string()).parse::<u16>().unwrap();
    let gain = std::env::var("GAIN").unwrap_or_else(|_| "3".to_string()).parse::<i64>().unwrap();
    let value_before = std::env::var("VALUE").unwrap_or_else(|_| "5".to_string()).parse::<i64>().unwrap();
    let worker = std::env::var("WORKER").unwrap_or_else(|_| "A".to_string()).to_uppercase();
    let worker_fee = std::env::var("WORKER_FEE").unwrap_or_else(|_| "1".to_string()).parse::<i64>().unwrap();

    let (input_source, pending, args, value_after) = match worker.as_str() {
        "A" => (
            &a_source,
            1,
            vec![Expr::int(gain), bytes_expr(&mux_prefix), bytes_expr(&mux_suffix)],
            value_before + gain,
        ),
        "B" => (
            &b_source,
            2,
            vec![Expr::int(gain), Expr::int(worker_fee), bytes_expr(&mux_prefix), bytes_expr(&mux_suffix)],
            value_before + gain - worker_fee,
        ),
        _ => panic!("WORKER must be A or B"),
    };
    let input_contract = compile_member(input_source, &mux_template, &a_template, &b_template, value_before, 10, pending);
    let output_contract = compile_member(&mux_source, &mux_template, &a_template, &b_template, value_after, 10, 0);
    let covenant_id = Hash::from_bytes(hex_to_array_32(&covenant_id_hex));
    let sigscript = p2sh_sigscript(&input_contract, "apply", args);
    let input = TransactionInput {
        previous_outpoint: TransactionOutpoint { transaction_id: TransactionId::from_bytes(hex_to_array_32(&input_txid)), index: input_index },
        signature_script: sigscript.clone(),
        sequence: 0,
        mass: TxInputMass::ComputeBudget(compute_budget.into()),
    };
    let output = TransactionOutput {
        value: input_value - fee,
        script_public_key: pay_to_script_hash_script(&output_contract.script),
        covenant: Some(CovenantBinding { authorizing_input: 0, covenant_id }),
    };
    let tx = Transaction::new(1, vec![input], vec![output], 0, Default::default(), 0, vec![]);
    let entry = UtxoEntry::new(input_value, pay_to_script_hash_script(&input_contract.script), 0, false, Some(covenant_id));
    let local_engine_ok = execute(&tx, entry);
    println!("{}", serde_json::to_string_pretty(&json!({
        "transactionId": tx.id().to_string(),
        "localEngineOk": local_engine_ok,
        "input": {
            "previousOutpoint": { "transactionId": input_txid, "index": input_index },
            "signatureScript": bytes_to_hex(&sigscript),
            "sequence": 0,
            "sigOpCount": 0,
            "computeBudget": compute_budget
        },
        "outputs": [{
            "amount": tx.outputs[0].value,
            "scriptPublicKey": { "version": tx.outputs[0].script_public_key.version(), "scriptPublicKey": spk_script_hex(&tx.outputs[0].script_public_key) },
            "covenant": { "authorizingInput": 0, "covenantId": covenant_id_hex },
            "nextRedeemScriptHex": bytes_to_hex(&output_contract.script)
        }],
        "state": { "worker": worker, "valueBefore": value_before, "gain": gain, "workerFee": worker_fee, "valueAfter": value_after, "timeout": 10, "prevPending": pending, "nextPending": 0, "minerFeeSompi": fee },
        "inputRedeemScriptHex": bytes_to_hex(&input_contract.script)
    })).unwrap());
}
