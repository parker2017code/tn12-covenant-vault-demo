/**
 * Virtual-chain replay indexer
 * Reads accepted transactions from TN12 and derives app state
 * Works around SDK getVirtualChainFromBlockV2 limitation by querying REST API
 */

const TN12_REST = "https://api-tn12.kaspa.org";
const POLL_INTERVAL_MS = 5000; // Poll every 5 seconds for new blocks

export class VirtualChainReplayer {
  constructor(options = {}) {
    this.restEndpoint = options.restEndpoint || TN12_REST;
    this.pollInterval = options.pollInterval || POLL_INTERVAL_MS;
    this.acceptedTransactions = new Map(); // txid -> txData
    this.lastPolledBlueScore = 0;
    this.listeners = [];
  }

  /**
   * Start listening for accepted transactions
   */
  async startReplay() {
    console.log("Starting virtual-chain replay from TN12...");

    // Initial poll to establish baseline
    await this.poll();

    // Set up recurring polls
    this.pollTimer = setInterval(() => this.poll(), this.pollInterval);
  }

  /**
   * Stop polling
   */
  stopReplay() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Poll TN12 for new accepted transactions since last poll
   */
  async poll() {
    try {
      // Query recent transactions
      // Note: This is a workaround since getVirtualChainFromBlockV2 isn't exposed in standard SDK
      // In production, would use proper DAGSync or indexed state from TN12 node

      const response = await fetch(`${this.restEndpoint}/txs?limit=100`);
      const data = await response.json();

      if (!data || !data.transactions) {
        return;
      }

      for (const tx of data.transactions) {
        if (tx.is_accepted && !this.acceptedTransactions.has(tx.transaction_id)) {
          this.acceptedTransactions.set(tx.transaction_id, {
            txid: tx.transaction_id,
            acceptingBlockBlueScore: tx.accepting_block_blue_score,
            acceptingBlockTime: tx.block_time,
            inputs: tx.inputs,
            outputs: tx.outputs
          });

          // Notify listeners of new accepted transaction
          this.notifyListeners({
            type: "accepted",
            txid: tx.transaction_id,
            blueScore: tx.accepting_block_blue_score
          });
        }
      }

      this.lastPolledBlueScore = Math.max(
        this.lastPolledBlueScore,
        ...data.transactions.filter(t => t.is_accepted).map(t => t.accepting_block_blue_score || 0)
      );
    } catch (err) {
      console.error("Virtual-chain replay poll error:", err.message);
    }
  }

  /**
   * Get all accepted transactions matching a filter
   */
  getAcceptedTransactions(filter = {}) {
    const results = [];

    for (const [txid, txData] of this.acceptedTransactions) {
      if (filter.minBlueScore && txData.acceptingBlockBlueScore < filter.minBlueScore) {
        continue;
      }
      if (filter.maxBlueScore && txData.acceptingBlockBlueScore > filter.maxBlueScore) {
        continue;
      }
      if (filter.outputAddress) {
        const hasOutput = txData.outputs.some(out =>
          out.address === filter.outputAddress
        );
        if (!hasOutput) continue;
      }

      results.push(txData);
    }

    return results;
  }

  /**
   * Query a specific transaction
   */
  async getTransaction(txid) {
    if (this.acceptedTransactions.has(txid)) {
      return this.acceptedTransactions.get(txid);
    }

    try {
      const response = await fetch(`${this.restEndpoint}/transactions/${txid}`);
      const data = await response.json();

      if (data.is_accepted) {
        const txData = {
          txid: data.transaction_id,
          acceptingBlockBlueScore: data.accepting_block_blue_score,
          acceptingBlockTime: data.block_time,
          inputs: data.inputs,
          outputs: data.outputs
        };

        this.acceptedTransactions.set(txid, txData);
        return txData;
      }

      return null;
    } catch (err) {
      console.error(`Failed to fetch transaction ${txid}:`, err.message);
      return null;
    }
  }

  /**
   * Register a listener for accepted transactions
   */
  onAccepted(callback) {
    this.listeners.push(callback);
  }

  /**
   * Internal: notify listeners
   */
  notifyListeners(event) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Listener error:", err.message);
      }
    }
  }

  /**
   * Derive app state from accepted transactions
   */
  deriveAppState(options = {}) {
    const state = {
      timestamp: new Date().toISOString(),
      lastPolledBlueScore: this.lastPolledBlueScore,
      lanes: {
        vault: { accepted: 0, rejected: 0 },
        escrow: { accepted: 0, rejected: 0 },
        batch: { accepted: 0, rejected: 0 },
        auction: { accepted: 0, rejected: 0 }
      },
      transactions: []
    };

    for (const txData of this.acceptedTransactions.values()) {
      // Classify transactions by lane
      // In production, would parse script details to classify
      state.transactions.push({
        txid: txData.txid,
        blueScore: txData.acceptingBlockBlueScore,
        outputCount: txData.outputs.length
      });
    }

    return state;
  }
}

/**
 * Singleton instance for global replay
 */
let globalReplayer = null;

export function getGlobalReplayer() {
  if (!globalReplayer) {
    globalReplayer = new VirtualChainReplayer();
  }
  return globalReplayer;
}
