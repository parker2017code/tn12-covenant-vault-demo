# TN12 Endpoints

Reviewed: 2026-05-10

This repo uses a verified public TN12 wRPC endpoint for live reads and submit work.

| Purpose | Endpoint | Encoding | Status | Notes |
|---|---|---|---|---|
| Live TN12 reads and submit | `ws://tn12-node.kaspa.com:17210` | Borsh | Verified | Use with `KASPA_WRPC_ENCODING=borsh`. The endpoint was probed successfully from this repo and reports TN12 / testnet-12. |

Current local environment hint:

```env
KASPA_WRPC_URL=ws://tn12-node.kaspa.com:17210
KASPA_WRPC_ENCODING=borsh
```

Do not reintroduce local `kaspad` or the old `/home/parker2017/kaspa-node` node path as the default workflow for this repo. That lane stays out of scope unless explicitly reopened.

