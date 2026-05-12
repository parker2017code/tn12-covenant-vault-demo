use kaspa_consensus_core::hashing::sighash::{calc_schnorr_signature_hash, SigHashReusedValuesUnsync};
use kaspa_consensus_core::hashing::sighash_type::SIG_HASH_ALL;
use kaspa_consensus_core::tx::{
    CovenantBinding, PopulatedTransaction, ScriptPublicKey, Transaction, TransactionId, TransactionInput, TransactionOutpoint,
    TransactionOutput, TxInputMass, UtxoEntry, VerifiableTransaction,
};
use kaspa_txscript::caches::Cache;
use kaspa_txscript::covenants::CovenantsContext;
use kaspa_txscript::opcodes::codes::OpCheckSig;
use kaspa_txscript::script_builder::ScriptBuilder;
use kaspa_txscript::{pay_to_script_hash_script, EngineCtx, EngineFlags, TxScriptEngine};
use secp256k1::{Keypair, Message, Secp256k1, SecretKey};
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

fn run_case(amount: i64, prev_spent: i64, next_spent: i64, dest_ok: bool, continuation: bool) -> bool {
    let repo_root = std::env::var("TN12_REPO_ROOT").unwrap_or_else(|_| ".".to_string());
    let source = std::fs::read_to_string(format!("{repo_root}/contracts/RecurringTreasuryVault.sil")).unwrap();

    let secp = Secp256k1::new();
    let owner = Keypair::from_secret_key(&secp, &SecretKey::from_slice(&[1u8; 32]).unwrap());
    let dest = Keypair::from_secret_key(&secp, &SecretKey::from_slice(&[2u8; 32]).unwrap());
    let wrong_dest = Keypair::from_secret_key(&secp, &SecretKey::from_slice(&[3u8; 32]).unwrap());

    let owner_pk = owner.x_only_public_key().0.serialize().to_vec();
    let dest_pk = dest.x_only_public_key().0.serialize().to_vec();
    let wrong_dest_pk = wrong_dest.x_only_public_key().0.serialize().to_vec();

    let cap = 7_500_000_000i64;
    let window = 9_899_000i64;
    let fee = 10_000i64;
    let input_value = 15_000_000_000u64;
    let change_value = (input_value as i64 - amount - fee) as u64;
    let compile_opts = CompileOptions { record_debug_infos: true, ..Default::default() };

    let input_compiled = compile_contract(
        &source,
        &[bytes_expr(&owner_pk), bytes_expr(&dest_pk), Expr::int(cap), Expr::int(window), Expr::int(prev_spent), Expr::int(fee)],
        compile_opts,
    )
    .unwrap();
    let next_compiled = compile_contract(
        &source,
        &[bytes_expr(&owner_pk), bytes_expr(&dest_pk), Expr::int(cap), Expr::int(window), Expr::int(next_spent), Expr::int(fee)],
        compile_opts,
    )
    .unwrap();

    let covenant_id = kaspa_consensus_core::Hash::from_bytes([0x11u8; 32]);
    let input = TransactionInput {
        previous_outpoint: TransactionOutpoint { transaction_id: TransactionId::from_bytes([0x44u8; 32]), index: 0 },
        signature_script: vec![],
        sequence: 0,
        mass: TxInputMass::SigopCount(0.into()),
    };
    let mut outputs = vec![TransactionOutput {
        value: amount as u64,
        script_public_key: p2pk_script(if dest_ok { &dest_pk } else { &wrong_dest_pk }),
        covenant: None,
    }];
    if continuation {
        outputs.push(TransactionOutput {
            value: change_value,
            script_public_key: pay_to_script_hash_script(&next_compiled.script),
            covenant: Some(CovenantBinding { authorizing_input: 0, covenant_id }),
        });
    }

    let mut tx = Transaction::new(1, vec![input], outputs, 0, Default::default(), 0, vec![]);
    let utxo = UtxoEntry::new(input_value, pay_to_script_hash_script(&input_compiled.script), 0, tx.is_coinbase(), Some(covenant_id));
    let sig = sign(&tx, &[utxo.clone()], 0, &owner);
    let args = vec![
        struct_object(vec![("spent", Expr::int(next_spent)), ("window", Expr::int(window))]),
        bytes_expr(&sig),
        Expr::int(amount),
    ];
    let action = input_compiled.build_sig_script("__spend", args).unwrap();
    let redeem = ScriptBuilder::new().add_data(&input_compiled.script).unwrap().drain();
    let mut sigscript = action;
    sigscript.extend_from_slice(&redeem);
    tx.inputs[0].signature_script = sigscript;

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
    engine.execute().is_ok()
}

fn main() {
    let cases = [
        ("under_cap_owner_sig_continuation_pass", run_case(2_500_000_000, 0, 2_500_000_000, true, true), true),
        ("over_cap_owner_sig_fails", run_case(2_500_000_000, 6_000_000_000, 8_500_000_000, true, true), false),
        ("wrong_destination_owner_sig_fails", run_case(2_500_000_000, 0, 2_500_000_000, false, true), false),
        ("missing_continuation_owner_sig_fails", run_case(2_500_000_000, 0, 2_500_000_000, true, false), false),
    ];

    for (name, got, expected) in cases {
        println!("{name} got={got} expected={expected}");
        assert_eq!(got, expected, "{name}");
    }
}
