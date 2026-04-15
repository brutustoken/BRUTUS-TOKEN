import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import BigNumber from "bignumber.js";

// Minimal TRC-20 ABI – only the functions we need
const TRC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

// Well-known tokens on TRON mainnet
// energyPerTx: conservative estimate of energy consumed per TRC-20 transfer
const KNOWN_TOKENS = [
  { symbol: "TRX", address: "TRX", decimals: 6, energyPerTx: 0 },
  { symbol: "USDT", address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", decimals: 6, energyPerTx: 65000 },
  { symbol: "USDD", address: "TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz", decimals: 18, energyPerTx: 65000 },
  { symbol: "BRUT", address: "TLGhEHUevHsfExxm4miyMxfmT5xumNr4BU", decimals: 6, energyPerTx: 32000 },
  { symbol: "BRST", address: "TF8YgHqnJdWzCbUyouje3RYrdDKJYpGfB3", decimals: 6, energyPerTx: 32000 },
  { symbol: "APENFT", address: "TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq", decimals: 6, energyPerTx: 32000 },
  // BTT TRC-20
  { symbol: "BTT", address: "TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4", decimals: 18, energyPerTx: 65000 },
  // WBTC bridged on TRON (BitTorrent bridge / JustLend WBTC)
  { symbol: "BTC (WBTC)", address: "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9", decimals: 8, energyPerTx: 32000 },
  { symbol: "Custom…", address: "custom", decimals: 6, energyPerTx: 65000 },
];

import { config } from "../config/env";
import utils from "../services";

const imgLoading = (
  <img src="images/cargando.gif" height="20px" alt="loading..."></img>
);

const imgBotLoading = (
  <img
    src="images/loading-energy.gif"
    width="100%"
    alt="robot indicate loading energy"
  ></img>
);

const amountsE = [
  { amount: 65000, text: "65K" },
  { amount: 130000, text: "130K" },
  { amount: 200000, text: "200K" },
  { amount: 1000000, text: "1M" },
  { amount: 3000000, text: "3M" },
];

const amountB = [
  { amount: 1000, text: "1k" },
  { amount: 2000, text: "2k" },
  { amount: 5000, text: "5k" },
  { amount: 10000, text: "10k" },
  { amount: 50000, text: "50k" },
];

let intervalId;

// ── Local transaction history helpers ─────────────────────────────────────────
const TX_HISTORY_KEY = "brutus_bulk_tx_history";
const TX_HISTORY_MAX = 200;

function loadTxHistory() {
  try {
    return JSON.parse(localStorage.getItem(TX_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveTxHistory(entries) {
  try {
    // Keep newest first, cap at MAX
    localStorage.setItem(
      TX_HISTORY_KEY,
      JSON.stringify(entries.slice(0, TX_HISTORY_MAX)),
    );
  } catch { /* storage full — ignore */ }
}

function appendTxHistory(newEntries) {
  const existing = loadTxHistory();
  saveTxHistory([...newEntries, ...existing]);
}

// ── Constantes para tipos de mensajes ─────────────────────────────────────────
const MESSAGE_TYPES = {
  CONNECT_WALLET: 'connectWallet',
  ERANGE: 'eRange',
  ERANGE2: 'eRange2',
  ERESOURCE: 'eResource',
  SOLD_OUT_ENERGY: 'soldOutEnergy',
  SOLD_OUT: 'soldOut',
  ERROR_PRICE: 'errorPrice',
  NO_FUNDS: 'noFunds',
  ETRONLINK: 'eTronlink',
  INSUFFICIENT_RESOURCES: 'insufficientResources',
  CONFIRM_ORDER: 'confirmOrder',
  CONFIRM_TRANSACTION: 'confirmTransaction',
  TRANSACTION_FAILED: 'transactionFailed',
  PROCESSING_ORDER: 'processingOrder',
  COMPLETED_SUCCESS: 'completedSuccess',
  CONTACT_SUPPORT: 'contactSupport',
};

class EnergyRental extends Component {
  constructor(props) {
    super(props);

    this.state = {
      deposito: "Loading...",
      wallet: "Loading...",
      precio: "****",
      wallet_orden: "",
      recurso: "energy",
      cantidad: 32000,
      montoMin: 32000,
      minPrice: "2.56",
      periodo: 5,
      temporalidad: "min",
      duration: "5min",
      av_band: new BigNumber(0),
      av_energy: new BigNumber(0),
      available_bandwidth: [],
      available_energy: [],
      total_bandwidth_pool: 0,
      total_energy_pool: 0,
      titulo: "Titulo",
      body: "Cuerpo del mensaje",
      amounts: amountsE,
      energyOn: false,
      bandOn: false,
      fromUrl: true,

      unitEnergyPrice: new BigNumber(1),
      precios: { energy: [], bandwidth: [] },

      referral: false,

      // ── Bulk Token Send state ──────────────────────────────────────────────
      bulk_token: KNOWN_TOKENS[1], // default: USDT
      bulk_customAddress: "",
      bulk_customDecimals: "6",
      bulk_recipients: [{ address: "", amount: "" }],
      bulk_sending: false,
      bulk_results: [],   // { address, amount, status, txid }
      bulk_rentResources: false,  // whether to auto-rent via Brutus before sending
      bulk_rentDone: false,       // flag: rental already executed this session

      // Progress tracking during bulk send
      bulk_progress: null,        // null | { current, total, step, phase }
      // phase: 'renting' | 'signing' | 'broadcasting' | 'waiting' | 'done'

      // Persistent local transaction history (loaded from localStorage)
      bulk_txHistory: loadTxHistory(),
      bulk_historyFilter: "all",  // 'all' | 'ok' | 'error'
    };

    this.handleChangePeriodo = this.handleChangePeriodo.bind(this);
    this.handleChangeWallet = this.handleChangeWallet.bind(this);

    this.updateAmount = this.updateAmount.bind(this);

    this.estado = this.estado.bind(this);

    this.recursos = this.recursos.bind(this);
    this.calcularRecurso = this.calcularRecurso.bind(this);
    this.calcularPrecios = this.calcularPrecios.bind(this);

    this.preCompra = this.preCompra.bind(this);
    this.compra = this.compra.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.getMessageContent = this.getMessageContent.bind(this);

    // Bulk send bindings
    this.bulkAddRow = this.bulkAddRow.bind(this);
    this.bulkRemoveRow = this.bulkRemoveRow.bind(this);
    this.bulkUpdateRow = this.bulkUpdateRow.bind(this);
    this.bulkPasteCSV = this.bulkPasteCSV.bind(this);
    this.bulkSend = this.bulkSend.bind(this);
    this.bulkClearHistory = this.bulkClearHistory.bind(this);
  }

  // ── Bulk Token Send helpers ────────────────────────────────────────────────

  bulkAddRow() {
    this.setState((prev) => ({
      bulk_recipients: [...prev.bulk_recipients, { address: "", amount: "" }],
    }));
  }

  bulkRemoveRow(index) {
    this.setState((prev) => {
      const rows = [...prev.bulk_recipients];
      rows.splice(index, 1);
      return { bulk_recipients: rows.length > 0 ? rows : [{ address: "", amount: "" }] };
    });
  }

  bulkUpdateRow(index, field, value) {
    this.setState((prev) => {
      const rows = [...prev.bulk_recipients];
      rows[index] = { ...rows[index], [field]: value };
      return { bulk_recipients: rows };
    });
  }

  bulkClearHistory() {
    localStorage.removeItem(TX_HISTORY_KEY);
    this.setState({ bulk_txHistory: [] });
  }

  /** Parse a pasted CSV block: each line = "address,amount" */
  bulkPasteCSV(text) {
    const lines = text
      .split(/[\n\r]+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed = lines.map((line) => {
      const parts = line.split(/[,;\t]+/);
      return {
        address: (parts[0] || "").trim(),
        amount: (parts[1] || "").trim(),
      };
    });

    if (parsed.length > 0) {
      this.setState({ bulk_recipients: parsed });
    }
  }

  /**
   * Estimate energy & bandwidth needed for the current bulk send list.
   * Returns { energyNeeded, bandwidthNeeded, txCount }
   *
   * Typical TRON costs (conservative estimates):
   *   TRC-20 transfer  → ~32,000 energy  + ~268 bandwidth
   *   TRX transfer     → 0 energy        + ~268 bandwidth
   */
  bulkEstimateResources() {
    const { bulk_recipients, bulk_token } = this.state;
    const validRows = bulk_recipients.filter(
      (r) => r.address.trim() !== "" && parseFloat(r.amount) > 0,
    );

    const isTRX = bulk_token.address === "TRX";
    // Use the per-token energy estimate; fall back to 65 000 for unknown custom tokens
    const ENERGY_PER_TX = isTRX ? 0 : (bulk_token.energyPerTx ?? 65000);
    // Bandwidth per tx (signature + data)
    const BANDWIDTH_PER_TX = isTRX ? 268 : 350;

    return {
      energyNeeded: ENERGY_PER_TX * validRows.length,
      bandwidthNeeded: BANDWIDTH_PER_TX * validRows.length,
      txCount: validRows.length,
      isTRX,
    };
  }

  async bulkSend() {
    const { isViewerMode, tronWeb, accountAddress } = this.props;

    if (isViewerMode) {
      this.showMessage(MESSAGE_TYPES.CONNECT_WALLET);
      return;
    }

    const {
      bulk_token,
      bulk_customAddress,
      bulk_customDecimals,
      bulk_recipients,
      bulk_rentResources,
    } = this.state;

    // Resolve token info
    let tokenAddress = bulk_token.address;
    let decimals = bulk_token.decimals;

    if (bulk_token.address === "custom") {
      tokenAddress = bulk_customAddress.trim();
      decimals = parseInt(bulk_customDecimals) || 6;

      if (!tronWeb.isAddress(tokenAddress)) {
        this.setState({
          titulo: "Invalid token address",
          body: "Please enter a valid TRC-20 contract address for the custom token.",
        });
        window.$("#mensaje-ebot").modal("show");
        return;
      }
    }

    // Validate recipients
    const validRows = bulk_recipients.filter(
      (r) => r.address.trim() !== "" && parseFloat(r.amount) > 0,
    );

    if (validRows.length === 0) {
      this.setState({
        titulo: "No valid recipients",
        body: "Add at least one recipient with a valid address and amount.",
      });
      window.$("#mensaje-ebot").modal("show");
      return;
    }

    // Confirm before sending — include rental note if opted-in
    const totalAmount = validRows
      .reduce((s, r) => s.plus(new BigNumber(r.amount || 0)), new BigNumber(0))
      .toFixed(decimals > 6 ? 6 : decimals);

    const estimate = this.bulkEstimateResources();

    // Compute costs for confirmation dialog
    const { precios } = this.state;
    const brutusUnitPrice = (() => {
      const list = precios.energy || [];
      const found = list.find((p) => p.duration === "5min");
      return found ? new BigNumber(found.UE) : new BigNumber(0);
    })();
    const rentalCostTRX = brutusUnitPrice
      .times(estimate.energyNeeded)
      .shiftedBy(-6)
      .dp(4);

    this.setState({
      titulo: "Confirm Bulk Send",
      body: (
        <span>
          <b>Token:</b> {bulk_token.symbol}
          {bulk_token.address === "custom" ? ` (${tokenAddress})` : ""}
          <br />
          <b>Recipients:</b> {validRows.length}
          <br />
          <b>Total:</b> {totalAmount} {bulk_token.symbol}
          {bulk_rentResources && estimate.energyNeeded > 0 && (
            <>
              <br />
              <span style={{ color: "#5a2d82" }}>
                <i className="bi bi-lightning-charge-fill"></i>{" "}
                <b>Brutus rental:</b> {estimate.energyNeeded.toLocaleString()} energy
                (~{rentalCostTRX.toString()} TRX) will be rented first.
              </span>
            </>
          )}
          <br /><br />
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => window.$("#mensaje-ebot").modal("hide")}
          >
            Cancel <i className="bi bi-x-circle"></i>
          </button>{" "}
          <button
            type="button"
            className="btn btn-success"
            onClick={() => {
              window.$("#mensaje-ebot").modal("hide");
              if (bulk_rentResources && estimate.energyNeeded > 0) {
                this._rentThenBulkSend(estimate, tokenAddress, decimals, validRows);
              } else {
                this._executeBulkSend(tokenAddress, decimals, validRows);
              }
            }}
          >
            Confirm <i className="bi bi-bag-check"></i>
          </button>
        </span>
      ),
    });
    window.$("#mensaje-ebot").modal("show");
  }

  /**
   * Rent energy from Brutus for the connected wallet, then execute bulk send.
   */
  async _rentThenBulkSend(estimate, tokenAddress, decimals, validRows) {
    const { tronWeb, accountAddress } = this.props;

    // ── Phase: renting ────────────────────────────────────────────────────────
    this.setState({
      bulk_progress: {
        current: 0,
        total: validRows.length,
        phase: "renting",
        step: `Renting ${estimate.energyNeeded.toLocaleString()} energy — please confirm in TronLink`,
      },
    });

    // Calculate the price for this energy amount
    const { precios } = this.state;
    const brutusUnitPrice = (() => {
      const list = precios.energy || [];
      const found = list.find((p) => p.duration === "5min");
      return found ? new BigNumber(found.UE) : new BigNumber(0);
    })();
    const precioPagar = brutusUnitPrice
      .times(estimate.energyNeeded)
      .shiftedBy(-6)
      .dp(6);

    try {
      const unSignedTransaction = await tronWeb.transactionBuilder.sendTrx(
        config.WALLET_API,
        tronWeb.toSun(precioPagar.toNumber()),
        accountAddress,
      );
      const signedTransaction = await window.tronWeb.trx
        .sign(unSignedTransaction)
        .catch((e) => { throw e; });

      this.setState((prev) => ({
        bulk_progress: {
          ...prev.bulk_progress,
          phase: "renting",
          step: "Sending energy rental order to Brutus…",
        },
      }));

      const rentResult = await utils.rentResource(
        accountAddress,
        "energy",
        estimate.energyNeeded,
        5,
        "m",
        precioPagar,
        signedTransaction,
        false,
      );

      if (!rentResult.result) {
        // Rental failed — offer to continue anyway
        this.setState({
          bulk_progress: null,
          titulo: "Rental failed",
          body: (
            <>
              Could not rent energy: {rentResult.msg || "unknown error"}
              <br /><br />
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => {
                  window.$("#mensaje-ebot").modal("hide");
                  this._executeBulkSend(tokenAddress, decimals, validRows);
                }}
              >
                Continue without rental
              </button>{" "}
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
            </>
          ),
        });
        window.$("#mensaje-ebot").modal("show");
        return;
      }

      // Give a brief moment for energy to propagate on-chain
      this.setState((prev) => ({
        bulk_progress: {
          ...prev.bulk_progress,
          step: "Energy rented ✓ — waiting for on-chain propagation (3 s)…",
        },
      }));
      await new Promise((r) => setTimeout(r, 3000));
    } catch (e) {
      this.setState({
        bulk_progress: null,
        titulo: "Rental transaction cancelled",
        body: (
          <>
            {e?.message || e?.toString() || "Transaction was rejected."}
            <br /><br />
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => {
                window.$("#mensaje-ebot").modal("hide");
                this._executeBulkSend(tokenAddress, decimals, validRows);
              }}
            >
              Continue without rental
            </button>{" "}
            <button
              type="button"
              className="btn btn-danger"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
          </>
        ),
      });
      window.$("#mensaje-ebot").modal("show");
      return;
    }

    // Energy rented — proceed with bulk send
    this._executeBulkSend(tokenAddress, decimals, validRows);
  }

  async _executeBulkSend(tokenAddress, decimals, validRows) {
    const { tronWeb, accountAddress } = this.props;
    const isTRX = tokenAddress === "TRX";

    // Resolve token symbol for history
    const tokenSymbol = (() => {
      const found = KNOWN_TOKENS.find((t) => t.address === tokenAddress);
      return found ? found.symbol : tokenAddress.slice(0, 8) + "…";
    })();

    this.setState({
      bulk_sending: true,
      bulk_results: [],
      bulk_progress: {
        current: 0,
        total: validRows.length,
        phase: "signing",
        step: "Loading token contract…",
      },
    });

    let contract;
    if (!isTRX) {
      try {
        contract = await tronWeb.contract(TRC20_ABI, tokenAddress);
      } catch (e) {
        this.setState({
          bulk_sending: false,
          bulk_progress: null,
          titulo: "Contract error",
          body: "Could not load the token contract: " + e.toString(),
        });
        window.$("#mensaje-ebot").modal("show");
        return;
      }
    }

    const results = [];
    const historyEntries = [];
    const sessionId = Date.now();

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const toAddr = row.address.trim();
      const amountHuman = new BigNumber(row.amount);
      const amountSun = amountHuman.shiftedBy(decimals).dp(0).toFixed(0);

      let status = "pending";
      let txid = "";
      let errMsg = "";

      // ── Step: waiting for wallet signature ───────────────────────────────
      this.setState({
        bulk_progress: {
          current: i + 1,
          total: validRows.length,
          phase: "signing",
          step: `Tx ${i + 1}/${validRows.length} — confirm in TronLink: ${amountHuman.toFixed()} ${tokenSymbol} → ${toAddr.slice(0, 14)}…`,
        },
      });

      try {
        if (isTRX) {
          // ── TRX native transfer ─────────────────────────────────────────
          // Pattern: transactionBuilder → extendExpiration →
          //          window.tronLink.tronWeb.trx.sign → tronWeb.trx.sendRawTransaction
          const sunAmount = amountHuman.shiftedBy(6).dp(0).toFixed(0);

          const unsigned = await tronWeb.transactionBuilder.sendTrx(
            toAddr,
            sunAmount,
            accountAddress,
          );
          // Extend tx TTL so the user has time to confirm in TronLink
          const extended = await tronWeb.transactionBuilder.extendExpiration(
            unsigned,
            180,
          );

          // Sign via TronLink (window.tronLink.tronWeb.trx.sign)
          const signed = await window.tronLink.tronWeb.trx
            .sign(extended)
            .catch((e) => { throw e; });

          // ── Step: broadcasting ──────────────────────────────────────────
          this.setState((prev) => ({
            bulk_progress: {
              ...prev.bulk_progress,
              phase: "broadcasting",
              step: `Tx ${i + 1}/${validRows.length} — broadcasting TRX transfer…`,
            },
          }));

          const receipt = await tronWeb.trx.sendRawTransaction(signed);

          // receipt.result === true → node accepted
          txid = receipt.txid || receipt.transaction?.txID || "";
          status = receipt.result ? "ok" : "failed";
          if (status === "failed") {
            errMsg = receipt.message
              ? Buffer.from(receipt.message, "hex").toString("utf8")
              : "Node rejected the transaction";
          }
        } else {
          // ── TRC-20 transfer ─────────────────────────────────────────────
          // Pattern: transactionBuilder.triggerSmartContract → extendExpiration →
          //          window.tronLink.tronWeb.trx.sign → tronWeb.trx.sendRawTransaction
          //
          // This is the canonical signing flow used across all pages in this app.
          // Do NOT use contract.method().send() — it bypasses TronLink and can
          // silently fail or misreport status.

          const inputs = [
            { type: "address", value: tronWeb.address.toHex(toAddr) },
            { type: "uint256", value: amountSun },
          ];

          const trigger = await tronWeb.transactionBuilder.triggerSmartContract(
            tronWeb.address.toHex(tokenAddress),
            "transfer(address,uint256)",
            { feeLimit: 150_000_000 },  // 150 TRX — covers high-energy tokens (USDD, BTT)
            inputs,
            tronWeb.address.toHex(accountAddress),
          );

          // Extend TTL so the user has enough time to confirm in TronLink
          let transaction = await tronWeb.transactionBuilder.extendExpiration(
            trigger.transaction,
            180,
          );

          // Sign via TronLink — this opens the TronLink confirmation popup
          transaction = await window.tronLink.tronWeb.trx
            .sign(transaction)
            .catch((e) => { throw e; });

          // ── Step: broadcasting ──────────────────────────────────────────
          this.setState((prev) => ({
            bulk_progress: {
              ...prev.bulk_progress,
              phase: "broadcasting",
              step: `Tx ${i + 1}/${validRows.length} — broadcasting TRC-20 transfer…`,
            },
          }));

          const receipt = await tronWeb.trx.sendRawTransaction(transaction);

          console.log(receipt)

          // sendRawTransaction returns { result: true/false, txid: '...' }
          txid = receipt.txid || receipt.transaction?.txID || "";
          status = receipt.result ? "ok" : "failed";
          if (status === "failed") {
            errMsg = receipt.message
              ? Buffer.from(receipt.message, "hex").toString("utf8")
              : "Node rejected the transaction";
          }
        }

        // ── Step: result feedback ──────────────────────────────────────────
        this.setState((prev) => ({
          bulk_progress: {
            ...prev.bulk_progress,
            phase: status === "ok" ? "broadcasting" : "error",
            step: status === "ok"
              ? `Tx ${i + 1}/${validRows.length} ✓ sent — ${txid.slice(0, 20)}…`
              : `Tx ${i + 1}/${validRows.length} ✗ ${errMsg.slice(0, 60)}`,
          },
        }));
      } catch (e) {
        // ── Detect TronLink user rejection ────────────────────────────────
        // TronLink throws a plain string or an object whose message matches
        // well-known rejection phrases when the user clicks "Reject".
        const eStr = (e?.message || e?.toString() || "").toLowerCase();
        const isUserRejection =
          eStr.includes("declined") ||
          eStr.includes("rejected") ||
          eStr.includes("cancel") ||
          eStr.includes("user denied") ||
          eStr.includes("user rejected") ||
          eStr === "confirmation declined by user";

        if (isUserRejection) {
          // User deliberately cancelled — do not treat as a system error.
          status = "cancelled";
          errMsg = "Cancelled by user in TronLink";

          this.setState((prev) => ({
            bulk_progress: {
              ...prev.bulk_progress,
              phase: "cancelled",
              step: `Tx ${i + 1}/${validRows.length} — cancelled by user. Remaining transactions skipped.`,
            },
          }));

          // Record this entry then stop — no point asking the user to sign
          // the remaining transactions if they already declined.
          const cancelledEntry = {
            id: `${sessionId}-${i}`,
            timestamp: Date.now(),
            token: tokenSymbol,
            tokenAddress,
            from: accountAddress,
            to: toAddr,
            amount: amountHuman.toFixed(),
            status: "cancelled",
            txid: "",
            errMsg,
          };
          historyEntries.push(cancelledEntry);
          results.push({ address: toAddr, amount: row.amount, status: "cancelled", txid: "", errMsg });
          this.setState({ bulk_results: [...results] });

          // Mark all remaining rows as cancelled too
          for (let j = i + 1; j < validRows.length; j++) {
            const remaining = validRows[j];
            const skippedEntry = {
              id: `${sessionId}-${j}`,
              timestamp: Date.now(),
              token: tokenSymbol,
              tokenAddress,
              from: accountAddress,
              to: remaining.address.trim(),
              amount: new BigNumber(remaining.amount).toFixed(),
              status: "cancelled",
              txid: "",
              errMsg: "Skipped — previous transaction cancelled by user",
            };
            historyEntries.push(skippedEntry);
            results.push({
              address: remaining.address.trim(),
              amount: remaining.amount,
              status: "cancelled",
              txid: "",
              errMsg: "Skipped — previous transaction cancelled by user",
            });
          }
          this.setState({ bulk_results: [...results] });

          // Exit the loop early
          break;
        }

        // ── Not a user rejection — technical error ────────────────────────
        // TronWeb can throw on polling timeout even when the tx was broadcast.
        // Try to recover a txid from the error object before marking as error.
        const eTxid =
          e?.transaction?.txID ||
          e?.txid ||
          (typeof e?.message === "string" && /^[0-9a-f]{64}$/i.test(e.message.trim())
            ? e.message.trim()
            : "");

        if (eTxid) {
          // Tx was broadcast but polling timed out — mark as "sent" (unconfirmed)
          txid = eTxid;
          status = "sent";
          errMsg = "Broadcast OK but confirmation timed out — check TronScan";
        } else {
          status = "error";
          errMsg = e?.message || e?.toString() || "unknown error";
        }

        this.setState((prev) => ({
          bulk_progress: {
            ...prev.bulk_progress,
            phase: status === "sent" ? "broadcasting" : "error",
            step: status === "sent"
              ? `Tx ${i + 1}/${validRows.length} ~ sent (unconfirmed) — ${txid.slice(0, 20)}…`
              : `Tx ${i + 1}/${validRows.length} ✗ ${errMsg.slice(0, 60)}`,
          },
        }));
      }

      // Only push entry here for non-cancellation paths
      // (cancellation already pushed above and broke the loop)
      if (status !== "cancelled") {
        const entry = {
          id: `${sessionId}-${i}`,
          timestamp: Date.now(),
          token: tokenSymbol,
          tokenAddress,
          from: accountAddress,
          to: toAddr,
          amount: amountHuman.toFixed(),
          status,   // 'ok' | 'sent' | 'failed' | 'error'
          txid,
          errMsg,
        };
        historyEntries.push(entry);
        results.push({ address: toAddr, amount: row.amount, status, txid, errMsg });
        this.setState({ bulk_results: [...results] });
      }

      // Small delay between txs to avoid nonce issues
      if (status !== "cancelled" && i < validRows.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    // Persist history
    appendTxHistory(historyEntries);
    const freshHistory = loadTxHistory();

    const okCount         = results.filter((r) => r.status === "ok" || r.status === "sent").length;
    const failCount       = results.filter((r) => r.status === "failed" || r.status === "error").length;
    const cancelledCount  = results.filter((r) => r.status === "cancelled").length;

    const wasAborted = cancelledCount > 0;

    this.setState({
      bulk_sending: false,
      bulk_txHistory: freshHistory,
      bulk_progress: {
        current: results.length,
        total: validRows.length,
        phase: wasAborted ? "cancelled" : "done",
        step: wasAborted
          ? `Aborted: ${okCount} sent, ${cancelledCount} cancelled by user, ${failCount} failed.`
          : `Completed: ${okCount} sent, ${failCount} failed. Results saved to history.`,
      },
    });
  }

  /**
   * Función centralizada para obtener el contenido de los mensajes
   * @param {string} messageType - Tipo de mensaje de MESSAGE_TYPES
   * @param {object} params - Parámetros adicionales para el mensaje
   * @returns {object} - Objeto con titulo y body del mensaje
   */
  getMessageContent(messageType, params = {}) {
    const { t, i18n } = this.props;
    const { recurso, cantidad, periodo, temporalidad, wallet_orden, precio } = this.state;

    const messages = {
      [MESSAGE_TYPES.CONNECT_WALLET]: {
        titulo: "To continue",
        body: "Connect your wallet to perform this operation.",
      },
      [MESSAGE_TYPES.ERANGE]: {
        titulo: t("ebot.alert.eRange", { returnObjects: true })[0],
        body: t("ebot.alert.eRange", { returnObjects: true })[1],
      },
      [MESSAGE_TYPES.ERANGE2]: {
        titulo: t("ebot.alert.eRange", { returnObjects: true })[0],
        body: t("ebot.alert.eRange2"),
      },
      [MESSAGE_TYPES.ERESOURCE]: {
        titulo: i18n.t("ebot.alert.eResource", { returnObjects: true })[0],
        body: (
          <span>
            {i18n.t("ebot.alert.eResource", { returnObjects: true })[1]}
          </span>
        ),
      },
      [MESSAGE_TYPES.SOLD_OUT_ENERGY]: {
        titulo: <>{t("ebot.alert.soldOut", { returnObjects: true })[0]}</>,
        body: (
          <>
            {" "}
            <img
              src="/images/alerts/recarge_energy.jpeg"
              alt="Energy sold out"
              style={{ borderRadius: "15px", width: "100%" }}
            ></img>{" "}
            <br></br>
            <br></br>
            {t("ebot.alert.soldOut", { returnObjects: true })[1]}
          </>
        ),
      },
      [MESSAGE_TYPES.SOLD_OUT]: {
        titulo: t("ebot.alert.soldOut", { returnObjects: true })[0],
        body: t("ebot.alert.soldOut", { returnObjects: true })[1],
      },
      [MESSAGE_TYPES.ERROR_PRICE]: {
        titulo: "Error",
        body: "error to calculating price of resource",
      },
      [MESSAGE_TYPES.NO_FUNDS]: {
        titulo: i18n.t("ebot.alert.noFounds", { returnObjects: true })[0],
        body: (
          <span>
            {i18n.t("ebot.alert.noFounds", { returnObjects: true })[1]}
          </span>
        ),
      },
      [MESSAGE_TYPES.ETRONLINK]: {
        titulo: i18n.t("ebot.alert.eTronlink", { returnObjects: true })[0],
        body: (
          <span>
            {i18n.t("ebot.alert.eTronlink", { returnObjects: true })[1]}
            <br></br>
            <button className="btn btn-danger" data-bs-dismiss="modal">
              Ok
            </button>
          </span>
        ),
      },
      [MESSAGE_TYPES.INSUFFICIENT_RESOURCES]: {
        titulo: "Error",
        body: "insufficient resources to cover this order try a lower value or try again later.",
      },
      [MESSAGE_TYPES.CONFIRM_ORDER]: {
        titulo: <>Confirm order information</>,
        body: (
          <span>
            <b>Buy: </b> {cantidad + " " + recurso + " " + periodo + temporalidad}
            <br></br>
            <b>For: </b> {params.pagas} TRX<br></br>
            <b>To: </b> {wallet_orden}
            <br></br>
            <br></br>
            <br></br>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                window.$("#mensaje-ebot").modal("hide");
              }}
            >
              Cancel <i className="bi bi-x-circle"></i>
            </button>{" "}
            <button
              type="button"
              className="btn btn-success"
              onClick={() => {
                this.compra(
                  cantidad,
                  periodo,
                  temporalidad,
                  recurso,
                  wallet_orden,
                  params.pagas,
                );
              }}
            >
              Confirm <i className="bi bi-bag-check"></i>
            </button>
          </span>
        ),
      },
      [MESSAGE_TYPES.CONFIRM_TRANSACTION]: {
        titulo: <>Confirm transaction {imgLoading}</>,
        body: <>Please confirm the transaction from your wallet </>,
      },
      [MESSAGE_TYPES.TRANSACTION_FAILED]: {
        titulo: "Transaction failed",
        body: (
          <>
            {params.error?.toString()}
            <br></br>
            <br></br>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                window.$("#mensaje-ebot").modal("hide");
              }}
            >
              Close
            </button>
          </>
        ),
      },
      [MESSAGE_TYPES.PROCESSING_ORDER]: {
        titulo: <>Your order is being processed {imgLoading}</>,
        body: (
          <>
            {imgBotLoading}
            <br></br>Please wait while one of our robots processes your recharge. We try to be as fast as possible, but this may take up to 2 minutes for large orders.
          </>
        ),
      },
      [MESSAGE_TYPES.COMPLETED_SUCCESS]: {
        titulo: "Completed successfully",
        body: (
          <>
            Rental of {recurso} is completed successfully.<br></br>
            <br></br>{" "}
            <button
              type="button"
              data-bs-dismiss="modal"
              className="btn btn-success"
            >
              Thank you!
            </button>
          </>
        ),
      },
      [MESSAGE_TYPES.CONTACT_SUPPORT]: {
        titulo: "Contact support",
        body: "Support hash: " + params.hash + " | " + params.msg,
      },
    };

    return messages[messageType] || {
      titulo: "Information",
      body: "An action has been performed.",
    };
  }

  /**
   * Función centralizada para mostrar mensajes al usuario
   * @param {string} messageType - Tipo de mensaje de MESSAGE_TYPES
   * @param {object} params - Parámetros adicionales para el mensaje
   * @param {boolean} showModal - Si se debe mostrar el modal automáticamente (default: true)
   */
  showMessage(messageType, params = {}, showModal = true) {
    const { titulo, body } = this.getMessageContent(messageType, params);

    this.setState({
      titulo,
      body,
    });

    if (showModal) {
      window.$("#mensaje-ebot").modal("show");
    }
  }

  async componentDidMount() {
    const { t } = this.props;

    document.getElementById("tittle").innerText = t("ebot.tittle");

    setTimeout(() => {
      this.estado();
    }, 2 * 1000);

    intervalId = setInterval(() => {
      this.estado();
    }, 15 * 1000);
  }

  componentWillUnmount() {
    clearInterval(intervalId);
  }

  handleChangeWallet(event) {
    let dato = event.target.value;
    this.setState({
      wallet_orden: dato,
    });
  }

  async handleChangePeriodo(event) {
    let dato = event.target.value.toLowerCase();
    let tmp = "d";

    document.getElementById("periodo").value = dato;

    if (dato.split("h").length > 1 || dato.split("hora").length > 1) {
      tmp = "h";
    }

    if (dato.split("m").length > 1 || dato.split("min").length > 1) {
      tmp = "m";
    }

    await this.setState({
      periodo: parseInt(dato),
      temporalidad: tmp,
      duration: parseInt(dato) + tmp,
    });

    this.calcularRecurso();
  }

  updateAmount(amount) {
    let { recurso } = this.state;

    let montoMin = 32000;
    if (recurso === "bandwidth") {
      montoMin = 1000;
    }

    this.setState({ montoMin });

    let cantidad = 0;
    if (amount) {
      cantidad = amount;
      try {
        let elAmount = document.getElementById("amount");

        if (elAmount) {
          elAmount.value = amount;
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        let elAmount = document.getElementById("amount");

        if (elAmount) {
          cantidad = elAmount.value;
        }
      } catch (e) {
        console.log(e);
      }
    }

    cantidad = parseInt(cantidad);

    if (parseInt(cantidad) < montoMin || isNaN(cantidad)) {
      cantidad = montoMin;
    }

    this.setState({ cantidad });

    return cantidad;
  }

  async estado() {
    let { fromUrl } = this.state;

    await this.calcularPrecios();

    let loc = document.location.href;
    if ((loc.indexOf("amount") > 0 || loc.indexOf("amb") > 0) && fromUrl) {
      let getString = loc.split("?")[1];
      let GET = getString.split("&");
      let get = {};
      let tmp;

      for (var i = 0, l = GET.length; i < l; i++) {
        tmp = GET[i].split("=");
        get[tmp[0]] = unescape(decodeURI(tmp[1]));
      }

      if (parseInt(get["amount"]) >= 32000) {
        let cantidad = parseInt(get["amount"]);
        let recurso = "energy";
        let duration = "5min";
        if (get["resource"] !== undefined) {
          recurso = get["resource"];
        }

        if (recurso === "band" || recurso === "bandwidth") {
          recurso = "bandwidth";
        } else {
          recurso = "energy";
        }

        if (get["duration"] !== undefined) {
          duration = get["duration"];
        }

        await this.setState({
          cantidad,
          recurso,
          temporalidad: "m",
          periodo: "5",
          duration,
          fromUrl: false,
        });

        this.updateAmount(cantidad);

        this.preCompra();
      }

      if (get["amb"] !== undefined) {
        await this.setState({ referral: get["amb"] });
      }
    }

    this.calcularRecurso();
  }

  async recursos() {
    let { energyOn, bandOn } = this.state;

    let consulta = false;
    const URL = config.BOT_URL;

    consulta = await fetch(URL)
      .then((r) => r.json())
      .catch((e) => {
        console.log(e);
        return false;
      });

    energyOn = consulta.available;
    bandOn = consulta.available;

    consulta = await fetch(URL + "available")
      .then((r) => r.json())
      .catch((e) => {
        console.log(e);
        return false;
      });

    if (!consulta) return false;

    let available_energy = [
      {
        duration: "5min",
        available: consulta.av_energy[0].available,
      },
      {
        duration: "1h",
        available: consulta.av_energy[0].available,
      },
      {
        duration: "1d",
        available: consulta.av_energy[1].available,
      },
      {
        duration: "3d",
        available: consulta.av_energy[2].available,
      },
      {
        duration: "7d",
        available: consulta.av_energy[3].available,
      },
      {
        duration: "14d",
        available: consulta.av_energy[3].available,
      },
      {
        duration: "30d",
        available: consulta.av_energy[3].available,
      },
    ];

    let available_bandwidth = [
      {
        duration: "5min",
        available: consulta.av_band[0].available,
      },
      {
        duration: "1h",
        available: consulta.av_band[0].available,
      },
      {
        duration: "1d",
        available: consulta.av_band[1].available,
      },
      {
        duration: "3d",
        available: consulta.av_band[2].available,
      },
      {
        duration: "7d",
        available: consulta.av_band[3].available,
      },
      {
        duration: "14d",
        available: consulta.av_band[3].available,
      },
      {
        duration: "30d",
        available: consulta.av_band[3].available,
      },
    ];

    let elPeriodo = document.getElementById("periodo");
    let duration = "5min";
    if (elPeriodo) {
      duration = elPeriodo.value;
    }

    this.setState({ duration });

    let av_energy = available_energy.find((obj) => obj.duration === duration);
    av_energy = new BigNumber(av_energy.available);
    this.setState({ av_energy });

    let av_band = available_bandwidth.find((obj) => obj.duration === duration);
    av_band = new BigNumber(av_band.available);
    this.setState({ av_band });

    this.setState({
      available_bandwidth,
      available_energy,
      total_bandwidth_pool: consulta.total_bandwidth_pool,
      total_energy_pool: consulta.total_energy_pool,
      energyOn,
      bandOn,
    });

    return energyOn;
  }

  async calcularPrecios() {
    await this.recursos();

    let { precios, duration, recurso } = this.state;

    let url = config.BOT_URL + "/prices/all";

    let consulta = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (r) => await r.json())
      .catch((e) => {
        console.log(e);
        return false;
      });

    if (consulta) {
      precios["energy"] = [
        {
          duration: "5min",
          UE: new BigNumber(consulta.energy_minutes_100K)
            .shiftedBy(1)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "1h",
          UE: new BigNumber(consulta.energy_hour_100K)
            .shiftedBy(1)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "1",
          UE: new BigNumber(consulta.energy_one_day_100K)
            .shiftedBy(1)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "2",
          UE: new BigNumber(consulta.energy_over_one_day_100K)
            .shiftedBy(1)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "3",
          UE: new BigNumber(consulta.energy_over_one_day_100K)
            .shiftedBy(1)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "4",
          UE: new BigNumber(consulta.energy_over_one_day_100K)
            .shiftedBy(1)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "7",
          UE: new BigNumber(consulta.energy_over_one_day_100K)
            .shiftedBy(1)
            .times(7 / 3)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "14",
          UE: new BigNumber(consulta.energy_over_one_day_100K)
            .shiftedBy(1)
            .times(14 / 3)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "30",
          UE: new BigNumber(consulta.energy_over_one_day_100K)
            .shiftedBy(1)
            .times(30 / 3)
            .dp(6)
            .toNumber(),
        },
      ];

      precios["bandwidth"] = [
        {
          duration: "5min",
          UE: new BigNumber(consulta.band_minutes_1000)
            .times(1000)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "1h",
          UE: new BigNumber(consulta.band_hour_1000)
            .times(1000)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "1",
          UE: new BigNumber(consulta.band_one_day_1000)
            .times(1000)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "2",
          UE: new BigNumber(consulta.band_one_day_1000)
            .times(1000)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "3",
          UE: new BigNumber(consulta.band_over_one_day_1000)
            .times(1000)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "4",
          UE: new BigNumber(consulta.band_over_one_day_1000)
            .times(1000)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "7",
          UE: new BigNumber(consulta.band_over_one_day_1000)
            .times(1000)
            .times(7 / 3)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "14",
          UE: new BigNumber(consulta.band_over_one_day_1000)
            .times(1000)
            .times(14 / 3)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "30",
          UE: new BigNumber(consulta.band_over_one_day_1000)
            .times(1000)
            .times(30 / 3)
            .dp(6)
            .toNumber(),
        },
      ];

      this.setState({ precios });
    }

    let priceList = precios[recurso];

    if (priceList.length > 0) {
      const foundPrice = priceList.find((price) => price.duration === duration);
      if (foundPrice !== undefined) {
        this.setState({ unitEnergyPrice: foundPrice.UE });
      }
    }

    return precios;
  }

  async calcularRecurso() {
    this.calcularPrecios();

    let { recurso, montoMin, precio, duration } = this.state;

    let cantidad = this.updateAmount();

    let ok = true;

    if (duration.indexOf("d") >= 0) {
      if (parseInt(duration[0]) < 1 || parseInt(duration[0]) > 14) {
        this.showMessage(MESSAGE_TYPES.ERANGE);
        ok = false;
      }

      duration = duration.split("d")[0];
    }

    if (duration.indexOf("h") >= 0) {
      if (parseInt(duration[0]) !== 1) {
        this.showMessage(MESSAGE_TYPES.ERANGE2);
        this.setState({ periodo: "1" });
        ok = false;
      }

      duration = "1h";
    }

    if (duration.indexOf("m") >= 0) {
      if (parseInt(duration[0]) !== 5) {
        this.showMessage(MESSAGE_TYPES.ERANGE2);
        this.setState({ periodo: "5" });
        ok = false;
      }

      duration = "5min";
    }

    let priceList = this.state.precios[recurso];

    if (ok && priceList.length > 0) {
      const foundPrice = priceList.find((price) => price.duration === duration);

      precio = new BigNumber(foundPrice.UE).times(cantidad);
      // cobro adicional para aumentar la reserva de trx === 10_000 SUN
      precio = precio.plus(0);

      precio = precio.shiftedBy(-6).dp(6);

      this.setState({ unitEnergyPrice: foundPrice.UE });

      if (parseInt(cantidad) <= montoMin) {
        this.setState({ minPrice: precio });
      }
    } else {
      precio = "**.**";
    }

    this.setState({
      precio: precio,
    });

    return precio;
  }

  async preCompra() {
    const { isViewerMode } = this.props;

    if (isViewerMode) {
      this.showMessage(MESSAGE_TYPES.CONNECT_WALLET);
      return;
    }

    await this.recursos();

    let {
      wallet_orden,
      cantidad,
      recurso,
      energyOn,
      bandOn,
      av_energy,
      av_band,
      total_energy_pool,
      total_bandwidth_pool,
    } = this.state;
    let { accountAddress, tronWeb } = this.props;

    if (!energyOn || !bandOn) {
      this.showMessage(MESSAGE_TYPES.ERESOURCE);
      return;
    }

    if (av_energy.toNumber() < total_energy_pool * 0.005) {
      energyOn = false;

      if (recurso === "energy") {
        this.showMessage(MESSAGE_TYPES.SOLD_OUT_ENERGY);
      }
    }

    if (av_band.toNumber() < total_bandwidth_pool * 0.005) {
      bandOn = false;
      if (recurso !== "energy") {
        this.showMessage(MESSAGE_TYPES.SOLD_OUT);
      }
    }

    let pagas = (await this.calcularRecurso()).toNumber();

    if (isNaN(pagas)) {
      this.showMessage(MESSAGE_TYPES.ERROR_PRICE);
      return;
    }

    if (wallet_orden === "" || !tronWeb.isAddress(wallet_orden)) {
      this.setState({
        wallet_orden: accountAddress,
      });
    }

    if (
      parseFloat(pagas) >
      new BigNumber(await tronWeb.trx.getBalance(accountAddress))
        .shiftedBy(-6)
        .toNumber()
    ) {
      this.showMessage(MESSAGE_TYPES.NO_FUNDS);
      return;
    }

    if (wallet_orden === "" || !tronWeb.isAddress(wallet_orden)) {
      this.setState({
        wallet_orden: accountAddress,
      });
    }

    if (wallet_orden === "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
      this.showMessage(MESSAGE_TYPES.ETRONLINK);
      return;
    }

    if (recurso === "energy") {
      if (cantidad > av_energy.toNumber()) {
        this.showMessage(MESSAGE_TYPES.INSUFFICIENT_RESOURCES);
        return;
      }
    } else {
      if (cantidad > av_band.toNumber()) {
        this.showMessage(MESSAGE_TYPES.INSUFFICIENT_RESOURCES);
        return;
      }
    }

    this.showMessage(MESSAGE_TYPES.CONFIRM_ORDER, { pagas });
  }

  async compra() {
    let {
      cantidad,
      periodo,
      temporalidad,
      recurso,
      wallet_orden,
      precio,
      referral,
    } = this.state;

    this.showMessage(MESSAGE_TYPES.CONFIRM_TRANSACTION);

    const unSignedTransaction =
      await this.props.tronWeb.transactionBuilder.sendTrx(
        config.WALLET_API,
        this.props.tronWeb.toSun(precio),
        this.props.accountAddress,
      );
    // using adapter to sign the transaction
    const signedTransaction = await window.tronWeb.trx
      .sign(unSignedTransaction)
      .catch((e) => {
        this.showMessage(MESSAGE_TYPES.TRANSACTION_FAILED, { error: e });
        return false;
      });

    if (!signedTransaction) {
      return false;
    }

    this.showMessage(MESSAGE_TYPES.PROCESSING_ORDER);

    let consulta2 = await utils.rentResource(
      wallet_orden,
      recurso,
      cantidad,
      periodo,
      temporalidad,
      precio,
      signedTransaction,
      referral,
    );

    if (consulta2.result) {
      this.showMessage(MESSAGE_TYPES.COMPLETED_SUCCESS);
    } else {
      console.log(consulta2);
      this.showMessage(MESSAGE_TYPES.CONTACT_SUPPORT, {
        hash: consulta2.hash,
        msg: consulta2.msg
      });
    }
  }

  render() {
    const { t } = this.props;
    let { unitEnergyPrice, amounts, recurso, av_energy, av_band } = this.state;

    const amountButtons = amounts.map((amounts) => (
      <button
        key={"Amb-" + amounts.text}
        id="ra1"
        type="button"
        className="btn btn-primary"
        style={{ margin: "auto" }}
        onClick={() => {
          this.updateAmount(amounts.amount);
          this.estado();
        }}
      >
        {amounts.text}
      </button>
    ));

    let texto = (
      <>
        Bandwidth Pool:{" "}
        {av_band.toString(10).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      </>
    );
    let porcentaje =
      (av_band.toNumber() * 100) / this.state.total_bandwidth_pool;

    if (recurso === "energy") {
      texto = (
        <>
          Energy Pool:{" "}
          {av_energy.toString(10).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </>
      );
      porcentaje = (av_energy.toNumber() * 100) / this.state.total_energy_pool;
    }

    if (isNaN(porcentaje)) porcentaje = 0;

    let medidor = (
      <>
        <p className="font-14">
          {texto} ({new BigNumber(porcentaje).dp(2).toString(10)}%)
        </p>
        <div
          className="progress"
          style={{ margin: "5px", backgroundColor: "lightgray" }}
        >
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: porcentaje + "%" }}
            aria-valuenow={porcentaje}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </>
    );

    function capitalizarPrimeraLetra(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
      <>
        <div className="row ">
          <div className="col-md-12 text-center">
            <h1>{t("ebot.subTittle")}</h1>
          </div>

          <div className="col-lg-6 col-sm-12">
            <div className="contact-box">
              <div className="card">
                <div className="card-body">
                  <div className="mb-4">
                    <div className="row">
                      <div className="col-6">
                        <h4>Rental {this.state.recurso}</h4>
                      </div>
                      <div className="col-6">
                        <div className="d-flex justify-content-sm-end">
                          <div className="btn-group" role="group">
                            <button
                              id="btnGroupDrop1"
                              type="button"
                              className="btn btn-primary dropdown-toggle"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              Resource
                            </button>
                            <ul
                              className="dropdown-menu"
                              aria-labelledby="btnGroupDrop1"
                            >
                              <li
                                onClick={async () => {
                                  await this.setState({
                                    cantidad: 32000,
                                    recurso: "energy",
                                    amounts: amountsE,
                                  });

                                  this.updateAmount(32000);

                                  await this.estado();
                                }}
                              >
                                <button className="dropdown-item">
                                  Energy
                                </button>
                              </li>

                              <li
                                onClick={async () => {
                                  await this.setState({
                                    cantidad: 1000,
                                    recurso: "bandwidth",
                                    amounts: amountB,
                                  });
                                  this.updateAmount(1000);
                                  await this.estado();
                                }}
                              >
                                <button className="dropdown-item">
                                  Bandwidth
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <form className="dzForm" method="" action="">
                        <div className="dzFormMsg"></div>
                        <input
                          type="hidden"
                          className="form-control"
                          name="dzToDo"
                          value="Contact"
                        ></input>
                        {medidor}

                        <div className="col-12 mt-2 mb-2 d-flex justify-content-center align-items-center">
                          <p
                            style={{ marginTop: "auto", marginRight: "10px" }}
                            className="font-14"
                          >
                            Amount
                          </p>
                          <input
                            style={{
                              textAlign: "end",
                              border: "lightgray  solid",
                            }}
                            id="amount"
                            name="dzLastName"
                            type="text"
                            onInput={() => this.calcularRecurso()}
                            className="form-control mb-1"
                            placeholder={this.state.montoMin}
                          ></input>
                        </div>
                        <div className="col-xl-12 mt-2 mb-2">
                          <div className="d-flex justify-content-xl-center">
                            {amountButtons}
                          </div>
                        </div>

                        <div className="col-12 mt-2 mb-2 d-flex justify-content-center align-items-center">
                          <p
                            style={{ marginTop: "auto", marginRight: "10px" }}
                            className="font-14"
                          >
                            Duration
                          </p>
                          <input
                            style={{
                              textAlign: "end",
                              border: "lightgray  solid",
                              cursor: "not-allowed",
                            }}
                            id="periodo"
                            required
                            type="text"
                            className="form-control mb-1"
                            onChange={this.handleChangePeriodo}
                            placeholder={"Default: 5m (five minutes)"}
                            defaultValue="5min"
                            readOnly
                          ></input>
                        </div>
                        <div className="col-12 mt-2 mb-2 ">
                          <div className="d-flex justify-content-xl-center">
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ margin: "auto" }}
                              onClick={() => {
                                this.handleChangePeriodo({
                                  target: { value: "5min" },
                                });
                              }}
                            >
                              5m
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ margin: "auto" }}
                              onClick={() => {
                                this.handleChangePeriodo({
                                  target: { value: "1h" },
                                });
                              }}
                            >
                              1h
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ margin: "auto" }}
                              onClick={() => {
                                this.handleChangePeriodo({
                                  target: { value: "1d" },
                                });
                              }}
                            >
                              1d
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ margin: "auto" }}
                              onClick={() => {
                                this.handleChangePeriodo({
                                  target: { value: "3d" },
                                });
                              }}
                            >
                              3d
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ margin: "auto" }}
                              onClick={() => {
                                this.handleChangePeriodo({
                                  target: { value: "14d" },
                                });
                              }}
                            >
                              14d
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ margin: "auto" }}
                              onClick={() => {
                                this.handleChangePeriodo({
                                  target: { value: "30d" },
                                });
                              }}
                            >
                              30d
                            </button>
                          </div>
                        </div>

                        <div className="col-12 mt-2 mb-2 justify-content-center align-items-center">
                          {capitalizarPrimeraLetra(this.state.recurso)} Unit:{" "}
                          {unitEnergyPrice.toString(10)} SUN<br></br>
                          <button
                            name="submit"
                            type="button"
                            value="Submit"
                            className="btn btn-secondary"
                            style={{
                              width: "100%",
                              height: "40px",
                              marginTop: "5px",
                            }}
                            onClick={() => this.preCompra()}
                          >
                            {" "}
                            Complete Purchase - Total:{" "}
                            {this.state.precio.toString(10)} TRX
                          </button>
                        </div>

                        <div className="col-xl-12 mb-3 mb-md-4">
                          <p className="font-14">
                            Send resources to this wallet {"⬇️"}
                          </p>

                          <input
                            name="dzFirstName"
                            required
                            type="text"
                            className="form-control"
                            placeholder={this.props.accountAddress}
                            onChange={this.handleChangeWallet}
                          ></input>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 pt-4 mt-5 col-sm-12 m-b30">
            <div className="info-box text-center">
              <img
                src="images/ebot.png"
                width="170px"
                className="figure-img img-fluid rounded"
                alt="resource rental energy"
              ></img>

              <div className="info">
                <p className="font-20 p-5">
                  In Brutus Energy Bot, we've developed an app for a faster and
                  secure resource rental experience on the Tron network.{" "}
                  <br></br>
                  <br></br>
                  Innovatively simplifying the process, we ensure efficient
                  management at competitive prices. Explore further through our{" "}
                  <a
                    style={{ color: "purple", textDecoration: "underline" }}
                    href="https://t.me/BRUTUS_energy_bot"
                  >
                    Telegram bot
                  </a>{" "}
                  or API for added accessibility. <br></br>
                  <br></br>
                  For additional information, contact us via our{" "}
                  <a
                    style={{ color: "purple", textDecoration: "underline" }}
                    href="https://t.me/brutus_comunidad_sr"
                  >
                    Telegram group
                  </a>{" "}
                  or reach out to us at{" "}
                  <a
                    style={{ color: "purple", textDecoration: "underline" }}
                    href="mailto:support@brutus.finance"
                  >
                    support@brutus.finance
                  </a>
                  <br></br>
                  <br></br>
                  Do you want to sell your energy/bandwidth and earn daily
                  income?{" "}
                  <a
                    style={{ color: "purple", textDecoration: "underline" }}
                    href="https://brutus.finance/provider/"
                  >
                    Join us as a provider now!
                  </a>
                </p>
              </div>

              <div className="widget widget_about">
                <div className="widget widget_getintuch"></div>
              </div>
              <div className="social-box dz-social-icon style-3"></div>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Smart Contracts </h4>
              </div>
              <div className="card-body">
                <p>
                  <b>Rental operator:</b>{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={
                      "https://tronscan.org/#/contract/" +
                      config.WALLET_API +
                      "/code"
                    }
                  >
                    {config.WALLET_API}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
             BULK TOKEN SEND
             ══════════════════════════════════════════════════════════ */}
        <div className="row mt-5">
          <div className="col-md-12 text-center mb-3">
            <h1>Bulk Token Send</h1>
            <p className="font-14" style={{ color: "#888" }}>
              Send tokens to multiple addresses in one session — no smart-contract required.
            </p>
          </div>

          <div className="col-lg-8 col-sm-12">
            <div className="card">
              <div className="card-body">

                {/* ── Token selector ── */}
                <div className="row mb-3 align-items-end">
                  <div className="col-md-5">
                    <label className="form-label font-14">Token</label>
                    <select
                      className="form-select"
                      value={this.state.bulk_token.address}
                      onChange={(e) => {
                        const found = KNOWN_TOKENS.find(
                          (t) => t.address === e.target.value,
                        );
                        this.setState({ bulk_token: found });
                      }}
                    >
                      {KNOWN_TOKENS.map((tk) => (
                        <option key={tk.address} value={tk.address}>
                          {tk.symbol}
                        </option>
                      ))}
                    </select>
                  </div>

                  {this.state.bulk_token.address === "custom" && (
                    <>
                      <div className="col-md-5">
                        <label className="form-label font-14">
                          Contract address (TRC-20)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="T…"
                          value={this.state.bulk_customAddress}
                          onChange={(e) =>
                            this.setState({ bulk_customAddress: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label font-14">Decimals</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="18"
                          value={this.state.bulk_customDecimals}
                          onChange={(e) =>
                            this.setState({ bulk_customDecimals: e.target.value })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* ── CSV paste helper ── */}
                <div className="mb-3">
                  <label className="form-label font-14">
                    Paste CSV{" "}
                    <span style={{ color: "#888" }}>
                      (one line per recipient: address,amount)
                    </span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder={"TGj1Ej1qRzL9feLTLhjwgxXF4Ct6GTWg2U,100\nTAnotherAddr,50"}
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        this.bulkPasteCSV(e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>

                {/* ── Recipients table ── */}
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Recipient address</th>
                      <th>
                        Amount ({this.state.bulk_token.symbol === "Custom…"
                          ? "tokens"
                          : this.state.bulk_token.symbol})
                      </th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.bulk_recipients.map((row, idx) => {
                      const result = this.state.bulk_results[idx];
                      return (
                        <tr key={idx}>
                          <td style={{ verticalAlign: "middle" }}>{idx + 1}</td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="T…"
                              value={row.address}
                              onChange={(e) =>
                                this.bulkUpdateRow(idx, "address", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              min="0"
                              placeholder="0"
                              value={row.amount}
                              onChange={(e) =>
                                this.bulkUpdateRow(idx, "amount", e.target.value)
                              }
                            />
                          </td>
                          <td style={{ verticalAlign: "middle", minWidth: "120px" }}>
                            {result ? (
                              result.status === "ok" ? (
                                <a
                                  href={`https://tronscan.org/#/transaction/${result.txid}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#27ae60", fontWeight: "bold" }}
                                  title={result.txid}
                                >
                                  <i className="bi bi-check-circle-fill"></i> OK
                                </a>
                              ) : result.status === "sent" ? (
                                <a
                                  href={`https://tronscan.org/#/transaction/${result.txid}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#e67e22", fontWeight: "bold" }}
                                  title={result.errMsg || result.txid}
                                >
                                  <i className="bi bi-broadcast"></i> Sent~
                                </a>
                              ) : result.status === "cancelled" ? (
                                <span
                                  style={{ color: "#7f8c8d", fontStyle: "italic" }}
                                  title={result.errMsg}
                                >
                                  <i className="bi bi-slash-circle"></i> Cancelled
                                </span>
                              ) : (
                                <span style={{ color: "#c0392b" }} title={result.errMsg}>
                                  <i className="bi bi-x-circle-fill"></i>{" "}
                                  {result.status === "failed" ? "Failed" : "Error"}
                                </span>
                              )
                            ) : (
                              <span style={{ color: "#bbb" }}>—</span>
                            )}
                          </td>
                          <td style={{ verticalAlign: "middle" }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => this.bulkRemoveRow(idx)}
                              disabled={this.state.bulk_sending}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* ── Rent resources option ── */}
                {(() => {
                  const est = this.bulkEstimateResources();
                  const { precios, bulk_rentResources } = this.state;

                  // Brutus 5-min unit price (SUN per energy unit)
                  const brutusUnitSun = (() => {
                    const list = precios.energy || [];
                    const found = list.find((p) => p.duration === "5min");
                    return found ? new BigNumber(found.UE) : new BigNumber(0);
                  })();

                  // Cost to rent from Brutus (TRX)
                  const brutusCostTRX = brutusUnitSun
                    .times(est.energyNeeded)
                    .shiftedBy(-6)
                    .dp(4);

                  // TRON network burn cost without rental:
                  // TRON burns ~280 SUN per energy unit when no staked energy available.
                  // Reference: https://developers.tron.network/docs/resource-model
                  const TRON_BURN_SUN_PER_ENERGY = new BigNumber(280);
                  const burnCostTRX = TRON_BURN_SUN_PER_ENERGY
                    .times(est.energyNeeded)
                    .shiftedBy(-6)
                    .dp(4);

                  const savings = burnCostTRX.minus(brutusCostTRX);
                  const savingsPct = burnCostTRX.gt(0)
                    ? savings.div(burnCostTRX).times(100).dp(1)
                    : new BigNumber(0);

                  return est.energyNeeded > 0 ? (
                    <div
                      className="mt-3 p-3 rounded"
                      style={{ background: "#f8f4ff", border: "1px solid #c9a0e0" }}
                    >
                      {/* Savings comparison */}
                      <h6 style={{ color: "#5a2d82" }}>
                        <i className="bi bi-lightning-charge-fill"></i> Resource
                        Cost Comparison — {est.txCount} tx
                      </h6>
                      <table className="table table-sm mb-2" style={{ fontSize: "0.88em" }}>
                        <thead>
                          <tr style={{ background: "#ede0f7" }}>
                            <th>Method</th>
                            <th>Energy needed</th>
                            <th>Bandwidth</th>
                            <th>Cost (TRX)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <span style={{ color: "#c0392b" }}>
                                <i className="bi bi-x-circle-fill"></i>
                              </span>{" "}
                              TRX burn (no rental)
                            </td>
                            <td>{est.energyNeeded.toLocaleString()}</td>
                            <td>{est.bandwidthNeeded.toLocaleString()}</td>
                            <td style={{ color: "#c0392b", fontWeight: "bold" }}>
                              ~{burnCostTRX.toString()} TRX
                            </td>
                          </tr>
                          <tr style={{ background: "#edfaf1" }}>
                            <td>
                              <span style={{ color: "#27ae60" }}>
                                <i className="bi bi-check-circle-fill"></i>
                              </span>{" "}
                              Brutus rental (5 min)
                            </td>
                            <td>{est.energyNeeded.toLocaleString()}</td>
                            <td>{est.bandwidthNeeded.toLocaleString()}</td>
                            <td style={{ color: "#27ae60", fontWeight: "bold" }}>
                              ~{brutusCostTRX.toString()} TRX
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      {savings.gt(0) && (
                        <p className="mb-2" style={{ fontSize: "0.9em", color: "#5a2d82" }}>
                          <strong>
                            Save ~{savings.toString()} TRX ({savingsPct.toString()}%)
                          </strong>{" "}
                          by renting energy with Brutus instead of burning TRX.
                        </p>
                      )}

                      {/* Checkbox opt-in */}
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="bulk_rent_check"
                          checked={bulk_rentResources}
                          onChange={(e) =>
                            this.setState({ bulk_rentResources: e.target.checked })
                          }
                          disabled={this.state.bulk_sending}
                        />
                        <label
                          className="form-check-label font-14"
                          htmlFor="bulk_rent_check"
                          style={{ cursor: "pointer" }}
                        >
                          <strong>Rent {est.energyNeeded.toLocaleString()} energy</strong> with Brutus before sending
                          {brutusCostTRX.gt(0) && (
                            <span style={{ color: "#888" }}>
                              {" "}(~{brutusCostTRX.toString()} TRX)
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* ── Actions ── */}
                <div className="d-flex gap-2 flex-wrap mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={this.bulkAddRow}
                    disabled={this.state.bulk_sending}
                  >
                    <i className="bi bi-plus-circle"></i> Add row
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    disabled={this.state.bulk_sending}
                    onClick={() =>
                      this.setState({
                        bulk_recipients: [{ address: "", amount: "" }],
                        bulk_results: [],
                        bulk_progress: null,
                      })
                    }
                  >
                    <i className="bi bi-arrow-counterclockwise"></i> Clear
                  </button>

                  <button
                    type="button"
                    className={`btn ms-auto ${this.state.bulk_rentResources ? "btn-warning" : "btn-success"}`}
                    disabled={this.state.bulk_sending}
                    onClick={this.bulkSend}
                  >
                    {this.state.bulk_sending ? (
                      <>{imgLoading} Sending…</>
                    ) : this.state.bulk_rentResources ? (
                      <>
                        <i className="bi bi-lightning-charge-fill"></i> Rent &amp; Send (
                        {this.state.bulk_recipients.filter(
                          (r) => r.address && parseFloat(r.amount) > 0,
                        ).length}{" "}
                        recipients)
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill"></i> Send all (
                        {this.state.bulk_recipients.filter(
                          (r) => r.address && parseFloat(r.amount) > 0,
                        ).length}{" "}
                        recipients)
                      </>
                    )}
                  </button>
                </div>

                {/* ── Inline progress panel ── */}
                {(() => {
                  const prog = this.state.bulk_progress;
                  if (!prog) return null;

                  const phaseColors = {
                    renting:      { bg: "#fff8e1", border: "#f9a825", icon: "bi-lightning-charge-fill", color: "#f57f17" },
                    signing:      { bg: "#e8f4fd", border: "#1976d2", icon: "bi-pen-fill",              color: "#1565c0" },
                    broadcasting: { bg: "#e8f5e9", border: "#388e3c", icon: "bi-broadcast",             color: "#2e7d32" },
                    waiting:      { bg: "#f3e5f5", border: "#7b1fa2", icon: "bi-hourglass-split",       color: "#6a1b9a" },
                    error:        { bg: "#fdecea", border: "#c62828", icon: "bi-exclamation-triangle-fill", color: "#b71c1c" },
                    cancelled:    { bg: "#f5f5f5", border: "#95a5a6", icon: "bi-slash-circle",          color: "#7f8c8d" },
                    done:         { bg: "#e8f5e9", border: "#2e7d32", icon: "bi-check2-all",            color: "#1b5e20" },
                  };

                  const theme = phaseColors[prog.phase] || phaseColors.signing;
                  const pct = prog.total > 0
                    ? Math.round((prog.current / prog.total) * 100)
                    : 0;

                  const okCount = this.state.bulk_results.filter((r) => r.status === "ok").length;
                  const failCount = this.state.bulk_results.filter((r) => r.status === "error" || r.status === "failed").length;
                  const pendCount = prog.total - this.state.bulk_results.length;

                  return (
                    <div
                      className="mt-3 p-3 rounded"
                      style={{
                        background: theme.bg,
                        border: `1.5px solid ${theme.border}`,
                        position: "relative",
                      }}
                    >
                      {/* Header row */}
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i
                          className={`bi ${theme.icon}`}
                          style={{ color: theme.color, fontSize: "1.2rem" }}
                        ></i>
                        <strong style={{ color: theme.color }}>
                          {prog.phase === "renting"      && "Renting energy…"}
                          {prog.phase === "signing"      && "Waiting for wallet signature…"}
                          {prog.phase === "broadcasting" && "Broadcasting to TRON network…"}
                          {prog.phase === "waiting"      && "Waiting for confirmation…"}
                          {prog.phase === "error"        && "Transaction error"}
                          {prog.phase === "cancelled"    && "Cancelled by user"}
                          {prog.phase === "done"         && "Completed"}
                        </strong>
                        <span className="ms-auto" style={{ fontSize: "0.85em", color: "#555" }}>
                          {prog.current} / {prog.total} tx
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div
                        className="progress mb-2"
                        style={{ height: "10px", backgroundColor: "#ddd" }}
                      >
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated"
                          role="progressbar"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: theme.color,
                            transition: "width 0.4s ease",
                          }}
                          aria-valuenow={pct}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>

                      {/* Current step text */}
                      <p
                        className="mb-2"
                        style={{
                          fontSize: "0.85em",
                          color: "#333",
                          wordBreak: "break-all",
                          fontFamily: "monospace",
                        }}
                      >
                        {prog.step}
                      </p>

                      {/* Mini counters */}
                      {prog.total > 1 && (
                        <div className="d-flex gap-3 flex-wrap" style={{ fontSize: "0.82em" }}>
                          <span style={{ color: "#27ae60" }}>
                            <i className="bi bi-check-circle-fill"></i>{" "}
                            {this.state.bulk_results.filter((r) => r.status === "ok" || r.status === "sent").length} sent
                          </span>
                          <span style={{ color: "#c0392b" }}>
                            <i className="bi bi-x-circle-fill"></i>{" "}
                            {this.state.bulk_results.filter((r) => r.status === "failed" || r.status === "error").length} failed
                          </span>
                          <span style={{ color: "#7f8c8d" }}>
                            <i className="bi bi-slash-circle"></i>{" "}
                            {this.state.bulk_results.filter((r) => r.status === "cancelled").length} cancelled
                          </span>
                          <span style={{ color: "#888" }}>
                            <i className="bi bi-hourglass"></i>{" "}
                            {Math.max(0, prog.total - this.state.bulk_results.length)} pending
                          </span>
                        </div>
                      )}

                      {/* Dismiss button when done or cancelled */}
                      {(prog.phase === "done" || prog.phase === "cancelled") && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary mt-2"
                          onClick={() => this.setState({ bulk_progress: null })}
                        >
                          <i className="bi bi-x"></i> Dismiss
                        </button>
                      )}

                      {/* Warning: do not close tab (only while actively running) */}
                      {prog.phase !== "done" && prog.phase !== "cancelled" && (
                        <p
                          className="mb-0 mt-2"
                          style={{
                            fontSize: "0.78em",
                            color: "#c0392b",
                            fontWeight: "bold",
                          }}
                        >
                          <i className="bi bi-exclamation-triangle-fill"></i>{" "}
                          Do not close or refresh this tab — transactions are in progress.
                        </p>
                      )}
                    </div>
                  );
                })()}

              </div>
            </div>
          </div>

          {/* ── Info panel ── */}
          <div className="col-lg-4 pt-2 col-sm-12">
            <div className="card h-100">
              <div className="card-body">
                <h5>How it works</h5>
                <ol className="font-14" style={{ paddingLeft: "1.2rem" }}>
                  <li>Choose a token (USDT, BRUT, BTT… or paste a custom TRC-20 address).</li>
                  <li>Add recipients manually or paste a CSV block.</li>
                  <li>
                    Optionally enable <b>Rent with Brutus</b> to pre-rent energy
                    and pay much less in fees.
                  </li>
                  <li>
                    Click <b>Send all</b> — each transfer is signed individually
                    by your connected TronLink wallet.
                  </li>
                  <li>Track results inline; click a green checkmark to view the tx on TronScan.</li>
                </ol>
                <hr />
                <p className="font-14" style={{ color: "#888" }}>
                  <i className="bi bi-info-circle"></i> USDT / TRC-20 transfers
                  consume ~32 000 energy each. Without staked/rented energy TRON
                  burns ~280 SUN per energy unit from your TRX balance.
                </p>
                <hr />
                <p className="font-14">
                  <b>Supported tokens:</b>
                </p>
                <ul className="font-14" style={{ paddingLeft: "1.2rem" }}>
                  {KNOWN_TOKENS.filter((t) => t.address !== "custom").map((t) => (
                    <li key={t.address}>
                      <b>{t.symbol}</b>
                      {t.address !== "TRX" && (
                        <>{" — "}<a
                          href={`https://tronscan.org/#/token20/${t.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: "0.8em", color: "purple" }}
                        >
                          {t.address.slice(0, 8)}…
                        </a></>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
             TRANSACTION HISTORY
             ══════════════════════════════════════════════════════════ */}
        {this.state.bulk_txHistory.length > 0 && (() => {
          const { bulk_txHistory, bulk_historyFilter } = this.state;

          const filtered = bulk_txHistory.filter((tx) => {
            if (bulk_historyFilter === "ok")        return tx.status === "ok" || tx.status === "sent";
            if (bulk_historyFilter === "error")     return tx.status === "failed" || tx.status === "error";
            if (bulk_historyFilter === "cancelled") return tx.status === "cancelled";
            return true;
          });

          const statusBadge = (tx) => {
            if (tx.status === "ok") {
              return (
                <span className="badge" style={{ background: "#27ae60" }}>
                  <i className="bi bi-check-circle-fill"></i> OK
                </span>
              );
            }
            if (tx.status === "sent") {
              return (
                <span className="badge" style={{ background: "#e67e22" }}>
                  <i className="bi bi-broadcast"></i> Sent~
                </span>
              );
            }
            if (tx.status === "cancelled") {
              return (
                <span className="badge" style={{ background: "#95a5a6" }} title={tx.errMsg}>
                  <i className="bi bi-slash-circle"></i> Cancelled
                </span>
              );
            }
            return (
              <span className="badge bg-danger" title={tx.errMsg}>
                <i className="bi bi-x-circle-fill"></i>{" "}
                {tx.status === "failed" ? "Failed" : "Error"}
              </span>
            );
          };

          return (
            <div className="row mt-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header d-flex align-items-center gap-2 flex-wrap">
                    <h5 className="mb-0">
                      <i className="bi bi-clock-history"></i> Transaction History
                    </h5>
                    <span className="badge bg-secondary ms-1">{bulk_txHistory.length}</span>

                    {/* Filter tabs */}
                    <div className="ms-auto d-flex gap-1 flex-wrap">
                      {[
                        { key: "all",       label: "All" },
                        { key: "ok",        label: "✓ Sent" },
                        { key: "error",     label: "✗ Failed" },
                        { key: "cancelled", label: "⊘ Cancelled" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          className={`btn btn-sm ${bulk_historyFilter === key ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => this.setState({ bulk_historyFilter: key })}
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={this.bulkClearHistory}
                        title="Clear all history (local only)"
                      >
                        <i className="bi bi-trash"></i> Clear
                      </button>
                    </div>
                  </div>

                  <div className="card-body p-0">
                    <div style={{ overflowX: "auto" }}>
                      <table className="table table-sm table-hover mb-0" style={{ fontSize: "0.82em" }}>
                        <thead style={{ background: "#f4f4f4" }}>
                          <tr>
                            <th style={{ whiteSpace: "nowrap" }}>Date / Time</th>
                            <th>Token</th>
                            <th>Amount</th>
                            <th>Recipient</th>
                            <th>Status</th>
                            <th>Tx Hash</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center text-muted py-3">
                                No transactions match the selected filter.
                              </td>
                            </tr>
                          ) : (
                            filtered.map((tx) => {
                              const dt = new Date(tx.timestamp);
                              const dateStr = dt.toLocaleDateString();
                              const timeStr = dt.toLocaleTimeString();
                              return (
                                <tr key={tx.id}>
                                  <td style={{ whiteSpace: "nowrap", color: "#555" }}>
                                    {dateStr}<br />
                                    <span style={{ color: "#999" }}>{timeStr}</span>
                                  </td>
                                  <td>
                                    <strong>{tx.token}</strong>
                                  </td>
                                  <td style={{ fontFamily: "monospace" }}>
                                    {tx.amount}
                                  </td>
                                  <td style={{ fontFamily: "monospace" }}>
                                    <a
                                      href={`https://tronscan.org/#/address/${tx.to}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: "#555" }}
                                      title={tx.to}
                                    >
                                      {tx.to.slice(0, 8)}…{tx.to.slice(-6)}
                                    </a>
                                  </td>
                                  <td>{statusBadge(tx)}</td>
                                  <td style={{ fontFamily: "monospace" }}>
                                    {tx.txid ? (
                                      <a
                                        href={`https://tronscan.org/#/transaction/${tx.txid}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "purple" }}
                                        title={tx.txid}
                                      >
                                        {tx.txid.slice(0, 10)}…{tx.txid.slice(-6)}
                                        {" "}<i className="bi bi-box-arrow-up-right" style={{ fontSize: "0.75em" }}></i>
                                      </a>
                                    ) : (
                                      <span style={{ color: "#bbb" }} title={tx.errMsg}>
                                        — <small>{tx.errMsg?.slice(0, 30)}</small>
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                    <p
                      className="text-muted px-3 py-2 mb-0"
                      style={{ fontSize: "0.75em", borderTop: "1px solid #eee" }}
                    >
                      <i className="bi bi-info-circle"></i>{" "}
                      History is stored locally in your browser. Clearing browser data will erase it.
                      Max {TX_HISTORY_MAX} entries kept (newest first).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* data-bs-backdrop/keyboard are disabled while a bulk op is running */}
        <div
          className="modal fade"
          id="mensaje-ebot"
          data-bs-backdrop={this.state.bulk_sending ? "static" : "true"}
          data-bs-keyboard={this.state.bulk_sending ? "false" : "true"}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{this.state.titulo}</h5>
                {/* Hide close button while sending to prevent accidental dismissal */}
                {!this.state.bulk_sending && (
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                  ></button>
                )}
              </div>
              <div className="modal-body">
                <p>{this.state.body}</p>
                {/* Inline mini-progress inside modal when sending */}
                {this.state.bulk_sending && this.state.bulk_progress && (
                  <div className="mt-2">
                    <div
                      className="progress"
                      style={{ height: "8px", backgroundColor: "#ddd" }}
                    >
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                        role="progressbar"
                        style={{
                          width: `${this.state.bulk_progress.total > 0
                            ? Math.round((this.state.bulk_progress.current / this.state.bulk_progress.total) * 100)
                            : 0}%`,
                        }}
                      ></div>
                    </div>
                    <p
                      className="mt-1 mb-0"
                      style={{ fontSize: "0.78em", color: "#555", fontFamily: "monospace" }}
                    >
                      {this.state.bulk_progress.step}
                    </p>
                    <p
                      className="mt-1 mb-0"
                      style={{ fontSize: "0.75em", color: "#c0392b", fontWeight: "bold" }}
                    >
                      <i className="bi bi-exclamation-triangle-fill"></i>{" "}
                      Do not close this window.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const EnergyRentalWithTranslation = withTranslation()(EnergyRental);

export default EnergyRentalWithTranslation;
