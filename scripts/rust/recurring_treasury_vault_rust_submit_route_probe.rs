use kaspa_consensus_core::hashing::sighash_type::SIG_HASH_ALL;
use kaspa_consensus_core::subnets::SUBNETWORK_ID_NATIVE;
use kaspa_consensus_core::tx::{
    CovenantBinding, ScriptPublicKey, Transaction, TransactionId, TransactionInput, TransactionOutpoint, TransactionOutput,
    TxInputMass,
};
use kaspa_rpc_core::{
    RpcCovenantBinding, RpcTransaction, RpcTransactionInput, RpcTransactionOutput,
    SubmitTransactionRequest,
};
use kaspa_txscript::opcodes::codes::OpTrue;
use workflow_serializer::prelude::Serializer;

fn main() {
    let covenant_id = kaspa_consensus_core::Hash::from_bytes([0x11u8; 32]);
    let input = TransactionInput {
        previous_outpoint: TransactionOutpoint {
            transaction_id: TransactionId::from_bytes([0x44u8; 32]),
            index: 0,
        },
        signature_script: vec![SIG_HASH_ALL.to_u8()],
        sequence: 0,
        mass: TxInputMass::ComputeBudget(30.into()),
    };
    let continuation = TransactionOutput {
        value: 12_499_990_000,
        script_public_key: ScriptPublicKey::new(0, vec![OpTrue].into()),
        covenant: Some(CovenantBinding { authorizing_input: 0, covenant_id }),
    };
    let tx = Transaction::new(
        1,
        vec![input],
        vec![continuation],
        0,
        SUBNETWORK_ID_NATIVE,
        0,
        vec![],
    );

    let rpc_outputs = RpcTransactionOutput::from_transaction_outputs(tx.outputs.clone());
    let observed = rpc_outputs[0].covenant;
    assert!(observed.is_some(), "RpcTransactionOutput lost covenant binding");
    let RpcCovenantBinding(binding) = observed.unwrap();
    assert_eq!(binding.authorizing_input, 0);
    assert_eq!(binding.covenant_id, covenant_id);

    let rpc_tx = RpcTransaction {
        version: tx.version,
        inputs: RpcTransactionInput::from_transaction_inputs(tx.inputs.clone()),
        outputs: rpc_outputs,
        lock_time: tx.lock_time,
        subnetwork_id: tx.subnetwork_id,
        gas: tx.gas,
        payload: tx.payload.clone(),
        mass: tx.mass(),
        verbose_data: None,
    };
    assert_eq!(rpc_tx.inputs[0].compute_budget, 30);
    assert_eq!(rpc_tx.outputs[0].covenant.unwrap().0.covenant_id, covenant_id);

    let request = SubmitTransactionRequest::new(rpc_tx, false);
    let mut serialized = Vec::new();
    request.serialize(&mut serialized).expect("serialize submit request");
    assert!(!serialized.is_empty());

    println!("rust_submit_route_preserves_output_covenant=true");
    println!("request_serialized_bytes={}", serialized.len());
    println!("input_compute_budget={}", request.transaction.inputs[0].compute_budget);
    println!("output_covenant_authorizing_input={}", request.transaction.outputs[0].covenant.unwrap().0.authorizing_input);
    println!("output_covenant_id={}", request.transaction.outputs[0].covenant.unwrap().0.covenant_id);
}
