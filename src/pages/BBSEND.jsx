/**
 * BBSEND — Bulk Token Send page
 *
 * Handles multi-recipient TRC-20 / TRX transfers with:
 *   - Per-row triggerConstantContract energy simulation
 *   - Balance validation before sending
 *   - Optional Brutus energy rental pre-step
 *   - Post-broadcast on-chain confirmation polling
 *   - Persistent local transaction history
 *
 * This page is intentionally focused on bulk sending only.
 * Energy rental (EBOT), staking (BRST), etc. live in their own pages.
 *
 * Brutus rental prices are fetched via the shared hook useBrutusRentalPrices,
 * so both EBOT and BBSEND always show consistent pricing without duplicating
 * the fetch logic.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { withTranslation } from "react-i18next";
import BigNumber from "bignumber.js";

import { config } from "../config/env";
import utils from "../services";
import { useBrutusRentalPrices } from "../hooks/useBrutusRentalPrices";

// ── Minimal TRC-20 ABI ─────────────────────────────────────────────────────────
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

// ── Well-known tokens ──────────────────────────────────────────────────────────
// energyPerTx: static fallback used before simulation fires
const KNOWN_TOKENS = [
    { symbol: "TRX",         address: "TRX",                                      decimals: 6,  energyPerTx: 0 },
    { symbol: "USDT",        address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",      decimals: 6,  energyPerTx: 65000 },
    { symbol: "USDD",        address: "TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz",      decimals: 18, energyPerTx: 65000 },
    { symbol: "BRUT",        address: "TLGhEHUevHsfExxm4miyMxfmT5xumNr4BU",      decimals: 6,  energyPerTx: 32000 },
    { symbol: "BRST",        address: "TF8YgHqnJdWzCbUyouje3RYrdDKJYpGfB3",      decimals: 6,  energyPerTx: 32000 },
    { symbol: "APENFT",      address: "TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq",      decimals: 6,  energyPerTx: 32000 },
    { symbol: "BTT",         address: "TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4",      decimals: 18, energyPerTx: 65000 },
    { symbol: "BTC (WBTC)",  address: "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",      decimals: 8,  energyPerTx: 32000 },
    { symbol: "Custom…",     address: "custom",                                    decimals: 6,  energyPerTx: 65000 },
];

// ── Local transaction history ──────────────────────────────────────────────────
const TX_HISTORY_KEY = "brutus_bulk_tx_history";
const TX_HISTORY_MAX = 200;

function loadTxHistory() {
    try { return JSON.parse(localStorage.getItem(TX_HISTORY_KEY) || "[]"); }
    catch { return []; }
}

function saveTxHistory(entries) {
    try { localStorage.setItem(TX_HISTORY_KEY, JSON.stringify(entries.slice(0, TX_HISTORY_MAX))); }
    catch { /* storage full */ }
}

function appendTxHistory(newEntries) {
    saveTxHistory([...newEntries, ...loadTxHistory()]);
}

// ── On-chain confirmation polling ──────────────────────────────────────────────
async function verifyTx(txid, tronWeb, maxWaitMs = 60000) {
    const POLL = 3000;
    const deadline = Date.now() + maxWaitMs;
    while (Date.now() < deadline) {
        try {
            const info = await tronWeb.trx.getTransactionInfo(txid);
            if (info && info.id && info.receipt && info.receipt.result) {
                return info.receipt.result === "SUCCESS" ? "confirmed" : "reverted";
            }
        } catch (_) { /* not yet */ }
        await new Promise((r) => setTimeout(r, POLL));
    }
    return "timeout";
}

// ── Static energy estimate (synchronous, for immediate UI feedback) ────────────
function staticEstimateResources(recipients, token) {
    const validRows = recipients.filter(
        (r) => r.address.trim() !== "" && parseFloat(r.amount) > 0,
    );
    const isTRX = token.address === "TRX";
    const ENERGY_PER_TX = isTRX ? 0 : (token.energyPerTx ?? 65000);
    const BANDWIDTH_PER_TX = isTRX ? 268 : 350;
    return {
        energyNeeded:    ENERGY_PER_TX * validRows.length,
        bandwidthNeeded: BANDWIDTH_PER_TX * validRows.length,
        txCount:         validRows.length,
        isTRX,
    };
}

// ── Main component ─────────────────────────────────────────────────────────────
function BulkSendPage({ tronWeb, accountAddress, isViewerMode, t }) {
    // ── Brutus rental prices (shared hook) ──────────────────────────────────
    const { precios } = useBrutusRentalPrices();

    // ── Modal state ──────────────────────────────────────────────────────────
    const [modalTitle, setModalTitle] = useState("");
    const [modalBody, setModalBody] = useState(null);

    const showModal = useCallback((title, body) => {
        setModalTitle(title);
        setModalBody(body);
        window.$("#mensaje-bbsend").modal("show");
    }, []);

    // ── Token & recipients ───────────────────────────────────────────────────
    const [token, setToken] = useState(KNOWN_TOKENS[1]); // USDT default
    const [customAddress, setCustomAddress] = useState("");
    const [customDecimals, setCustomDecimals] = useState("6");
    const [recipients, setRecipients] = useState([{ address: "", amount: "" }]);

    // ── Send state ───────────────────────────────────────────────────────────
    const [sending, setSending] = useState(false);
    const [results, setResults] = useState([]);     // per-row send results
    const [progress, setProgress] = useState(null); // { current, total, phase, step }
    const [rentResources, setRentResources] = useState(true);

    // ── Energy & balance estimates ───────────────────────────────────────────
    const [exactEstimate, setExactEstimate] = useState(null);
    const [estimating, setEstimating] = useState(false);
    const [burnSunPerEnergy, setBurnSunPerEnergy] = useState(new BigNumber(420));
    const [userEnergy, setUserEnergy] = useState(null);
    const [tokenBalance, setTokenBalance] = useState(null);

    // ── Transaction history ──────────────────────────────────────────────────
    const [txHistory, setTxHistory] = useState(loadTxHistory);
    const [historyFilter, setHistoryFilter] = useState("all");

    // ── Debounce timer ref ───────────────────────────────────────────────────
    const debounceRef = useRef(null);

    // ── Page title ───────────────────────────────────────────────────────────
    useEffect(() => {
        document.getElementById("tittle").innerText = t("ebot.tittle") + " — Bulk Send";
    }, [t]);

    // ── Resolve token address & decimals ─────────────────────────────────────
    const resolvedToken = useCallback(() => {
        if (token.address !== "custom") {
            return { address: token.address, decimals: token.decimals, valid: true };
        }
        const addr = customAddress.trim();
        const dec = parseInt(customDecimals) || 6;
        const valid = tronWeb ? tronWeb.isAddress(addr) : false;
        return { address: addr, decimals: dec, valid };
    }, [token, customAddress, customDecimals, tronWeb]);

    const validRows = recipients.filter(
        (r) => r.address.trim() !== "" && parseFloat(r.amount) > 0,
    );

    // ── Schedule exact energy simulation ────────────────────────────────────
    const scheduleEstimate = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            debounceRef.current = null;
            if (isViewerMode || !tronWeb || !accountAddress) return;

            const { address: tokenAddress, decimals, valid } = resolvedToken();
            if (!valid || tokenAddress === "custom") return;

            const rows = recipients.filter(
                (r) => r.address.trim() !== "" && parseFloat(r.amount) > 0,
            );
            if (rows.length === 0) {
                setExactEstimate(null);
                return;
            }

            setEstimating(true);

            const isTRX = tokenAddress === "TRX";

            // Run simulation + chain params + energy balance + token balance in parallel
            const [simResult, chainParams, accountResources, rawBalance] = await Promise.all([
                // 1. Per-row energy simulation via triggerConstantContract
                isTRX
                    ? Promise.resolve({ perRow: [], totalEnergy: 0, energyMin: 0, energyMax: 0, energyAvg: 0, source: "simulation" })
                    : simulateEnergyPerRow(tronWeb, accountAddress, tokenAddress, decimals, rows, token.energyPerTx ?? 65000),

                // 2. Real on-chain energy burn rate
                tronWeb.trx.getChainParameters().catch(() => []),

                // 3. User's available energy
                tronWeb.trx.getAccountResources(accountAddress).catch(() => ({})),

                // 4. Sender's token balance
                isTRX
                    ? tronWeb.trx.getUnconfirmedBalance(accountAddress).catch(() => 0)
                    : (() => {
                        const c = tronWeb.contract(TRC20_ABI, tokenAddress);
                        return c.balanceOf(accountAddress).call().catch(() => null);
                    })(),
            ]);

            // Parse burn rate
            let burnRate = new BigNumber(420);
            if (Array.isArray(chainParams)) {
                const p = chainParams.find((x) => x.key === "getEnergyFee");
                if (p && p.value) burnRate = new BigNumber(p.value);
            }
            setBurnSunPerEnergy(burnRate);

            // Parse user energy
            const eLimit = accountResources.EnergyLimit || 0;
            const eUsed  = accountResources.EnergyUsed  || 0;
            setUserEnergy(Math.max(0, eLimit - eUsed));

            // Parse token balance
            let bal = null;
            if (rawBalance !== null && rawBalance !== undefined) {
                if (isTRX) {
                    bal = new BigNumber(rawBalance).shiftedBy(-6);
                } else {
                    const raw = rawBalance?.remaining ?? rawBalance;
                    bal = new BigNumber(raw.toString()).shiftedBy(-decimals);
                }
                if (bal.isNaN() || bal.lt(0)) bal = new BigNumber(0);
            }
            setTokenBalance(bal);

            setExactEstimate({
                ...simResult,
                txCount: rows.length,
            });
            setEstimating(false);
        }, 600);
    }, [isViewerMode, tronWeb, accountAddress, resolvedToken, recipients, token.energyPerTx]);

    // Re-simulate whenever recipients or token changes
    useEffect(() => {
        scheduleEstimate();
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [scheduleEstimate]);

    // Invalidate estimates when token changes
    const handleTokenChange = useCallback((e) => {
        const found = KNOWN_TOKENS.find((tk) => tk.address === e.target.value);
        setToken(found);
        setExactEstimate(null);
        setTokenBalance(null);
    }, []);

    // ── Recipients helpers ───────────────────────────────────────────────────
    const addRow = () => setRecipients((prev) => [...prev, { address: "", amount: "" }]);

    const removeRow = (idx) =>
        setRecipients((prev) => {
            const next = [...prev];
            next.splice(idx, 1);
            return next.length > 0 ? next : [{ address: "", amount: "" }];
        });

    const updateRow = (idx, field, value) =>
        setRecipients((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });

    const pasteCSV = useCallback((text) => {
        const parsed = text
            .split(/[\n\r]+/)
            .map((l) => l.trim())
            .filter(Boolean)
            .map((line) => {
                const parts = line.split(/[,;\t]+/);
                return { address: (parts[0] || "").trim(), amount: (parts[1] || "").trim() };
            });
        if (parsed.length > 0) setRecipients(parsed);
    }, []);

    // ── Send flow ────────────────────────────────────────────────────────────
    const handleSend = async () => {
        if (isViewerMode) {
            showModal("To continue", "Connect your wallet to perform this operation.");
            return;
        }

        const { address: tokenAddress, decimals, valid } = resolvedToken();
        if (!valid) {
            showModal("Invalid token address", "Please enter a valid TRC-20 contract address.");
            return;
        }

        const rows = recipients.filter(
            (r) => r.address.trim() !== "" && parseFloat(r.amount) > 0,
        );

        if (rows.length === 0) {
            showModal("No valid recipients", "Add at least one recipient with a valid address and amount.");
            return;
        }

        const isTRX = tokenAddress === "TRX";
        const totalAmount = rows.reduce((s, r) => s.plus(new BigNumber(r.amount || 0)), new BigNumber(0));

        // ── Balance check (fresh fetch) ──────────────────────────────────────
        let senderBal = tokenBalance;
        if (!isTRX) {
            try {
                const c = tronWeb.contract(TRC20_ABI, tokenAddress);
                const raw = await c.balanceOf(accountAddress).call().catch(() => null);
                if (raw !== null) {
                    const v = raw?.remaining ?? raw;
                    senderBal = new BigNumber(v.toString()).shiftedBy(-decimals);
                    if (senderBal.isNaN() || senderBal.lt(0)) senderBal = new BigNumber(0);
                    setTokenBalance(senderBal);
                }
            } catch (_) { /* use last known */ }
        }

        if (senderBal !== null && totalAmount.gt(senderBal)) {
            showModal(
                "Insufficient balance",
                <span>
                    <i className="bi bi-exclamation-triangle-fill" style={{ color: "#b91c1c", fontSize: "1.3em" }}></i>
                    {" "}
                    <strong style={{ color: "#b91c1c" }}>You don&apos;t have enough {token.symbol}.</strong>
                    <br /><br />
                    <table style={{ width: "100%", fontSize: "0.92em" }}>
                        <tbody>
                            <tr>
                                <td style={{ color: "#555" }}>Your balance:</td>
                                <td style={{ fontFamily: "monospace", fontWeight: "bold", color: "#b91c1c" }}>
                                    {senderBal.dp(6).toString()} {token.symbol}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ color: "#555" }}>Total to send:</td>
                                <td style={{ fontFamily: "monospace", fontWeight: "bold" }}>
                                    {totalAmount.toString()} {token.symbol}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ color: "#555" }}>Deficit:</td>
                                <td style={{ fontFamily: "monospace", fontWeight: "bold", color: "#b91c1c" }}>
                                    {totalAmount.minus(senderBal).dp(6).toString()} {token.symbol}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                    Please reduce the amounts or top up your wallet before sending.
                    <br /><br />
                    <button type="button" className="btn btn-danger btn-sm"
                        onClick={() => window.$("#mensaje-bbsend").modal("hide")}>
                        <i className="bi bi-x-circle"></i> Close
                    </button>
                </span>,
            );
            return;
        }

        // ── Energy simulation ─────────────────────────────────────────────────
        showModal(
            "Estimating energy…",
            <span>
                <img src="images/cargando.gif" height="20px" alt="loading..." />{" "}
                Simulating transactions to calculate exact energy needed…
            </span>,
        );

        const simResult = isTRX
            ? { perRow: [], totalEnergy: 0, energyMin: 0, energyMax: 0, energyAvg: 0, source: "simulation" }
            : await simulateEnergyPerRow(tronWeb, accountAddress, tokenAddress, decimals, rows, token.energyPerTx ?? 65000);

        const staticEst = staticEstimateResources(rows, token);
        const estimate = {
            ...staticEst,
            energyNeeded:  simResult.totalEnergy,
            energyAvg:     simResult.energyAvg,
            energyMin:     simResult.energyMin,
            energyMax:     simResult.energyMax,
            hasVariance:   simResult.energyMin !== simResult.energyMax,
            energySource:  simResult.source,
        };

        // Brutus unit price (SUN/energy, 5-min slot)
        const brutusUnitSun = (() => {
            const found = (precios.energy || []).find((p) => p.duration === "5min");
            return found ? new BigNumber(found.UE) : new BigNumber(0);
        })();
        const rentalCostTRX = brutusUnitSun.times(estimate.energyNeeded).shiftedBy(-6).dp(4);

        // ── Confirmation dialog ───────────────────────────────────────────────
        showModal(
            "Confirm Bulk Send",
            <span>
                <b>Token:</b> {token.symbol}
                {token.address === "custom" ? ` (${tokenAddress})` : ""}
                <br />
                <b>Recipients:</b> {rows.length}
                <br />
                <b>Total:</b> {totalAmount.toFixed(decimals > 6 ? 6 : decimals)} {token.symbol}
                <br />
                <span style={{ color: "#555", fontSize: "0.9em" }}>
                    <i className="bi bi-lightning-charge-fill"></i>{" "}
                    <b>Energy:</b>{" "}
                    {estimate.hasVariance
                        ? <>{estimate.energyMin.toLocaleString()}–{estimate.energyMax.toLocaleString()} / tx</>
                        : <>{estimate.energyAvg.toLocaleString()} / tx</>
                    }
                    {" "}({estimate.energySource === "simulation" ? "✓ simulated" : "⚠ estimated"})
                    {" — "}total: <b>{estimate.energyNeeded.toLocaleString()}</b>
                </span>
                {rentResources && estimate.energyNeeded > 0 && (
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
                <button type="button" className="btn btn-danger"
                    onClick={() => window.$("#mensaje-bbsend").modal("hide")}>
                    Cancel <i className="bi bi-x-circle"></i>
                </button>{" "}
                <button type="button" className="btn btn-success"
                    onClick={() => {
                        window.$("#mensaje-bbsend").modal("hide");
                        if (rentResources && estimate.energyNeeded > 0) {
                            _rentThenSend(estimate, tokenAddress, decimals, rows, brutusUnitSun);
                        } else {
                            _executeSend(tokenAddress, decimals, rows);
                        }
                    }}>
                    Confirm <i className="bi bi-bag-check"></i>
                </button>
            </span>,
        );
    };

    // ── Rent energy, then send ────────────────────────────────────────────────
    const _rentThenSend = async (estimate, tokenAddress, decimals, rows, brutusUnitSun) => {
        // Query current energy again to only rent the deficit
        let available = 0;
        try {
            const res = await tronWeb.trx.getAccountResources(accountAddress);
            available = Math.max(0, (res.EnergyLimit || 0) - (res.EnergyUsed || 0));
        } catch (_) { /* use 0 */ }

        let deficit = estimate.energyNeeded - available;
        if (deficit <= 0) {
            setProgress({ current: 0, total: rows.length, phase: "signing", step: "Sufficient energy — skipping rental." });
            await new Promise((r) => setTimeout(r, 800));
            _executeSend(tokenAddress, decimals, rows);
            return;
        }

        deficit = deficit < 32000 ? 32000 : Math.ceil(deficit * 1.05);

        setProgress({
            current: 0, total: rows.length, phase: "renting",
            step: `Wallet has ${available.toLocaleString()} energy — renting ${deficit.toLocaleString()} more — confirm in TronLink`,
        });

        const precioPagar = brutusUnitSun.times(deficit).shiftedBy(-6).dp(6);

        try {
            const unsigned = await tronWeb.transactionBuilder.sendTrx(
                config.WALLET_API,
                tronWeb.toSun(precioPagar.toNumber()),
                accountAddress,
            );
            const signed = await window.tronWeb.trx.sign(unsigned).catch((e) => { throw e; });

            setProgress((p) => ({ ...p, step: "Sending energy rental order to Brutus…" }));

            const rentResult = await utils.rentResource(
                accountAddress, "energy", deficit, 5, "m", precioPagar, signed, false,
            );

            if (!rentResult.result) {
                setProgress(null);
                showModal("Rental failed",
                    <>
                        Could not rent energy: {rentResult.msg || "unknown error"}
                        <br /><br />
                        <button type="button" className="btn btn-warning"
                            onClick={() => { window.$("#mensaje-bbsend").modal("hide"); _executeSend(tokenAddress, decimals, rows); }}>
                            Continue without rental
                        </button>{" "}
                        <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cancel</button>
                    </>,
                );
                return;
            }

            setProgress((p) => ({ ...p, step: "Energy rented ✓ — waiting for on-chain propagation (3 s)…" }));
            await new Promise((r) => setTimeout(r, 3000));
        } catch (e) {
            setProgress(null);
            showModal("Rental cancelled",
                <>
                    {e?.message || e?.toString() || "Transaction was rejected."}
                    <br /><br />
                    <button type="button" className="btn btn-warning"
                        onClick={() => { window.$("#mensaje-bbsend").modal("hide"); _executeSend(tokenAddress, decimals, rows); }}>
                        Continue without rental
                    </button>{" "}
                    <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cancel</button>
                </>,
            );
            return;
        }

        _executeSend(tokenAddress, decimals, rows);
    };

    // ── Execute all transfers ─────────────────────────────────────────────────
    const _executeSend = async (tokenAddress, decimals, rows) => {
        const isTRX = tokenAddress === "TRX";
        const tokenSymbol = (() => {
            const f = KNOWN_TOKENS.find((tk) => tk.address === tokenAddress);
            return f ? f.symbol : tokenAddress.slice(0, 8) + "…";
        })();

        setSending(true);
        setResults([]);
        setProgress({ current: 0, total: rows.length, phase: "signing", step: "Loading token contract…" });

        let contract;
        if (!isTRX) {
            try {
                contract = await tronWeb.contract(TRC20_ABI, tokenAddress);
            } catch (e) {
                setSending(false);
                setProgress(null);
                showModal("Contract error", "Could not load the token contract: " + e.toString());
                return;
            }
        }

        const txResults = [];
        const historyEntries = [];
        const sessionId = Date.now();

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const toAddr = row.address.trim();
            const amountHuman = new BigNumber(row.amount);
            const amountSun = amountHuman.shiftedBy(decimals).dp(0).toFixed(0);

            let status = "pending";
            let txid = "";
            let errMsg = "";
            let confirmedStatus = "pending";

            setProgress({
                current: i + 1, total: rows.length, phase: "signing",
                step: `Tx ${i + 1}/${rows.length} — confirm in TronLink: ${amountHuman.toFixed()} ${tokenSymbol} → ${toAddr.slice(0, 14)}…`,
            });

            try {
                if (isTRX) {
                    const unsigned = await tronWeb.transactionBuilder.sendTrx(
                        toAddr, amountHuman.shiftedBy(6).dp(0).toFixed(0), accountAddress,
                    );
                    const extended = await tronWeb.transactionBuilder.extendExpiration(unsigned, 180);
                    const signed = await window.tronLink.tronWeb.trx.sign(extended).catch((e) => { throw e; });

                    setProgress((p) => ({ ...p, phase: "broadcasting", step: `Tx ${i + 1}/${rows.length} — broadcasting TRX transfer…` }));
                    const receipt = await tronWeb.trx.sendRawTransaction(signed);
                    txid = receipt.txid || receipt.transaction?.txID || "";
                    status = receipt.result ? "ok" : "failed";
                    if (status === "failed") errMsg = receipt.message ? Buffer.from(receipt.message, "hex").toString("utf8") : "Node rejected";
                } else {
                    const inputs = [
                        { type: "address", value: tronWeb.address.toHex(toAddr) },
                        { type: "uint256", value: amountSun },
                    ];
                    const trigger = await tronWeb.transactionBuilder.triggerSmartContract(
                        tronWeb.address.toHex(tokenAddress), "transfer(address,uint256)",
                        { feeLimit: 150_000_000 }, inputs, tronWeb.address.toHex(accountAddress),
                    );
                    let tx = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
                    tx = await window.tronLink.tronWeb.trx.sign(tx).catch((e) => { throw e; });

                    setProgress((p) => ({ ...p, phase: "broadcasting", step: `Tx ${i + 1}/${rows.length} — broadcasting TRC-20 transfer…` }));
                    const receipt = await tronWeb.trx.sendRawTransaction(tx);
                    txid = receipt.txid || receipt.transaction?.txID || "";
                    status = receipt.result ? "ok" : "failed";
                    if (status === "failed") errMsg = receipt.message ? Buffer.from(receipt.message, "hex").toString("utf8") : "Node rejected";
                }

                // On-chain confirmation poll
                setProgress((p) => ({
                    ...p, phase: "waiting",
                    step: `Tx ${i + 1}/${rows.length} ✓ broadcast — waiting for on-chain confirmation… ${txid.slice(0, 20)}…`,
                }));

                if (status === "ok" && txid) {
                    confirmedStatus = await verifyTx(txid, tronWeb, 60000);
                    if (confirmedStatus === "reverted") {
                        status = "reverted";
                        errMsg = "Broadcast OK but reverted on-chain (check energy/allowance)";
                    } else if (confirmedStatus === "confirmed") {
                        status = "confirmed";
                    }
                    setProgress((p) => ({
                        ...p,
                        phase: confirmedStatus === "reverted" ? "error" : "broadcasting",
                        step: confirmedStatus === "confirmed"
                            ? `Tx ${i + 1}/${rows.length} ✓ confirmed — ${txid.slice(0, 20)}…`
                            : confirmedStatus === "reverted"
                            ? `Tx ${i + 1}/${rows.length} ✗ REVERTED — ${txid.slice(0, 20)}…`
                            : `Tx ${i + 1}/${rows.length} ~ broadcast, confirmation timed out — ${txid.slice(0, 20)}…`,
                    }));
                }
            } catch (e) {
                const eStr = (e?.message || e?.toString() || "").toLowerCase();
                const isUserRejection =
                    eStr.includes("declined") || eStr.includes("rejected") ||
                    eStr.includes("cancel") || eStr.includes("user denied") ||
                    eStr === "confirmation declined by user";

                if (isUserRejection) {
                    status = "cancelled";
                    errMsg = "Cancelled by user in TronLink";
                    setProgress((p) => ({ ...p, phase: "cancelled", step: `Tx ${i + 1}/${rows.length} — cancelled. Remaining transactions skipped.` }));

                    historyEntries.push({ id: `${sessionId}-${i}`, timestamp: Date.now(), token: tokenSymbol, tokenAddress, from: accountAddress, to: toAddr, amount: amountHuman.toFixed(), status: "cancelled", txid: "", errMsg });
                    const updatedResults = [...txResults, { address: toAddr, amount: row.amount, status: "cancelled", txid: "", errMsg }];
                    txResults.push(...updatedResults.slice(txResults.length));
                    setResults([...txResults]);

                    for (let j = i + 1; j < rows.length; j++) {
                        const msg = "Skipped — previous transaction cancelled by user";
                        historyEntries.push({ id: `${sessionId}-${j}`, timestamp: Date.now(), token: tokenSymbol, tokenAddress, from: accountAddress, to: rows[j].address.trim(), amount: new BigNumber(rows[j].amount).toFixed(), status: "cancelled", txid: "", errMsg: msg });
                        txResults.push({ address: rows[j].address.trim(), amount: rows[j].amount, status: "cancelled", txid: "", errMsg: msg });
                    }
                    setResults([...txResults]);
                    break;
                }

                const eTxid = e?.transaction?.txID || e?.txid || "";
                if (eTxid) {
                    txid = eTxid; status = "sent";
                    errMsg = "Broadcast OK but confirmation timed out — check TronScan";
                } else {
                    status = "error";
                    errMsg = e?.message || e?.toString() || "unknown error";
                }
                setProgress((p) => ({
                    ...p,
                    phase: status === "sent" ? "broadcasting" : "error",
                    step: status === "sent"
                        ? `Tx ${i + 1}/${rows.length} ~ sent (unconfirmed) — ${txid.slice(0, 20)}…`
                        : `Tx ${i + 1}/${rows.length} ✗ ${errMsg.slice(0, 60)}`,
                }));
            }

            if (status !== "cancelled") {
                historyEntries.push({ id: `${sessionId}-${i}`, timestamp: Date.now(), token: tokenSymbol, tokenAddress, from: accountAddress, to: toAddr, amount: amountHuman.toFixed(), status, confirmedStatus, txid, errMsg });
                txResults.push({ address: toAddr, amount: row.amount, status, confirmedStatus, txid, errMsg });
                setResults([...txResults]);
            }

            if (status !== "cancelled" && i < rows.length - 1) {
                await new Promise((r) => setTimeout(r, 1500));
            }
        }

        appendTxHistory(historyEntries);
        setTxHistory(loadTxHistory());

        const confirmed  = txResults.filter((r) => r.status === "confirmed").length;
        const reverted   = txResults.filter((r) => r.status === "reverted").length;
        const broadcast  = txResults.filter((r) => r.status === "ok" || r.status === "sent").length;
        const failed     = txResults.filter((r) => r.status === "failed" || r.status === "error").length;
        const cancelled  = txResults.filter((r) => r.status === "cancelled").length;

        const parts = [];
        if (confirmed)  parts.push(`${confirmed} confirmed`);
        if (broadcast)  parts.push(`${broadcast} broadcast`);
        if (reverted)   parts.push(`${reverted} reverted`);
        if (failed)     parts.push(`${failed} failed`);
        if (cancelled)  parts.push(`${cancelled} cancelled`);

        setSending(false);
        setProgress({
            current: txResults.length,
            total: rows.length,
            phase: cancelled > 0 ? "cancelled" : reverted > 0 || failed > 0 ? "error" : "done",
            step: (cancelled > 0 ? "Aborted: " : "Completed: ") + parts.join(", ") + ". Results saved to history.",
        });
    };

    // ── UI helpers ────────────────────────────────────────────────────────────
    const staticEst = staticEstimateResources(recipients, token);

    // Cumulative balance check per row
    const rowBalanceState = (() => {
        let running = new BigNumber(0);
        return recipients.map((row) => {
            const amt = parseFloat(row.amount);
            if (!row.address.trim() && (isNaN(amt) || amt <= 0)) return { state: "empty", running: 0 };
            if (isNaN(amt) || amt <= 0) return { state: "empty", running: running.toNumber() };
            running = running.plus(new BigNumber(amt));
            if (tokenBalance === null) return { state: "loading", running: running.toNumber() };
            return {
                state: running.gt(tokenBalance) ? "insufficient" : "ok",
                running: running.toNumber(),
            };
        });
    })();

    const anyInsufficient = rowBalanceState.some((r) => r.state === "insufficient");
    const tokenSymbolDisplay = token.symbol === "Custom…" ? "tokens" : token.symbol;

    // Energy panel derived values
    const totalEnergy = exactEstimate
        ? exactEstimate.totalEnergy
        : Math.round((staticEst.txCount > 0 ? staticEst.energyNeeded / staticEst.txCount : token.energyPerTx ?? 65000)) * staticEst.txCount;
    const energyAvg = exactEstimate ? exactEstimate.energyAvg : Math.round(staticEst.energyNeeded / Math.max(staticEst.txCount, 1));
    const energyMin = exactEstimate ? exactEstimate.energyMin : energyAvg;
    const energyMax = exactEstimate ? exactEstimate.energyMax : energyAvg;
    const hasVariance = exactEstimate ? exactEstimate.energyMin !== exactEstimate.energyMax : false;
    const energySource = exactEstimate ? exactEstimate.source : "static";

    const userAvailable = userEnergy !== null ? userEnergy : 0;
    const userEnergyKnown = userEnergy !== null;
    const deficit = Math.max(0, totalEnergy - userAvailable);
    const needsRental = deficit > 0;

    const brutusUnitSun = (() => {
        const f = (precios.energy || []).find((p) => p.duration === "5min");
        return f ? new BigNumber(f.UE) : new BigNumber(0);
    })();
    const brutusCostTRX = brutusUnitSun.times(deficit).shiftedBy(-6).dp(6);
    const burnCostTRX = burnSunPerEnergy.times(deficit).shiftedBy(-6).dp(6);
    const savings = burnCostTRX.minus(brutusCostTRX);
    const savingsPct = burnCostTRX.gt(0) ? savings.div(burnCostTRX).times(100).dp(1) : new BigNumber(0);

    const tokenBalanceBg = tokenBalance === null ? "#f0f4ff" : (tokenBalance.gte(recipients.reduce((a, r) => a.plus(new BigNumber(parseFloat(r.amount) || 0)), new BigNumber(0))) ? "#dcfce7" : "#fdecea");

    // Phase colours for progress panel
    const phaseColors = {
        renting:      { bg: "#fff8e1", border: "#f9a825", icon: "bi-lightning-charge-fill", color: "#f57f17" },
        signing:      { bg: "#e8f4fd", border: "#1976d2", icon: "bi-pen-fill",              color: "#1565c0" },
        broadcasting: { bg: "#e8f5e9", border: "#388e3c", icon: "bi-broadcast",             color: "#2e7d32" },
        waiting:      { bg: "#f3e5f5", border: "#7b1fa2", icon: "bi-hourglass-split",       color: "#6a1b9a" },
        error:        { bg: "#fdecea", border: "#c62828", icon: "bi-exclamation-triangle-fill", color: "#b71c1c" },
        cancelled:    { bg: "#f5f5f5", border: "#95a5a6", icon: "bi-slash-circle",          color: "#7f8c8d" },
        done:         { bg: "#e8f5e9", border: "#2e7d32", icon: "bi-check2-all",            color: "#1b5e20" },
    };

    // Status badge for history
    const statusBadge = (tx) => {
        const map = {
            confirmed: ["#1a7a3c", "bi-check2-circle", "Confirmed"],
            ok:        ["#27ae60", "bi-check-circle-fill", "Broadcast"],
            sent:      ["#e67e22", "bi-broadcast", "Sent~"],
            reverted:  ["#c0392b", "bi-arrow-counterclockwise", "Reverted"],
            failed:    ["#c0392b", "bi-x-circle-fill", "Failed"],
            error:     ["#c0392b", "bi-x-circle-fill", "Error"],
            cancelled: ["#95a5a6", "bi-slash-circle", "Cancelled"],
        };
        const [color, icon, label] = map[tx.status] || ["#aaa", "bi-question-circle", tx.status];
        return <span className="badge" style={{ background: color }}><i className={`bi ${icon}`}></i> {label}</span>;
    };

    // Inline tx status cell for recipients table
    const txStatusCell = (result) => {
        if (!result) return <span style={{ color: "#bbb" }}>—</span>;
        const hrefs = ["confirmed", "ok", "sent", "reverted"];
        if (hrefs.includes(result.status) && result.txid) {
            const colorMap = { confirmed: "#1a7a3c", ok: "#27ae60", sent: "#e67e22", reverted: "#c0392b" };
            const iconMap = { confirmed: "bi-check2-circle", ok: "bi-check-circle-fill", sent: "bi-broadcast", reverted: "bi-arrow-counterclockwise" };
            const labelMap = { confirmed: "Confirmed", ok: "Broadcast", sent: "Sent~", reverted: "Reverted" };
            return (
                <a href={`https://tronscan.org/#/transaction/${result.txid}`} target="_blank" rel="noopener noreferrer"
                    style={{ color: colorMap[result.status], fontWeight: "bold" }} title={result.errMsg || result.txid}>
                    <i className={`bi ${iconMap[result.status]}`}></i> {labelMap[result.status]}
                </a>
            );
        }
        if (result.status === "cancelled") return <span style={{ color: "#7f8c8d", fontStyle: "italic" }} title={result.errMsg}><i className="bi bi-slash-circle"></i> Cancelled</span>;
        return <span style={{ color: "#c0392b" }} title={result.errMsg}><i className="bi bi-x-circle-fill"></i> {result.status === "failed" ? "Failed" : "Error"}</span>;
    };

    const filteredHistory = txHistory.filter((tx) => {
        if (historyFilter === "ok")        return ["confirmed", "ok", "sent"].includes(tx.status);
        if (historyFilter === "error")     return ["failed", "error", "reverted"].includes(tx.status);
        if (historyFilter === "cancelled") return tx.status === "cancelled";
        return true;
    });

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <div className="row mt-3">
                <div className="col-md-12 text-center mb-3">
                    <h1>Bulk Token Send</h1>
                    <p className="font-14" style={{ color: "#888" }}>
                        Send tokens to multiple addresses in one session — no smart-contract required.
                    </p>
                </div>

                {/* ── Left panel: send form ── */}
                <div className="col-lg-8 col-sm-12">
                    <div className="card">
                        <div className="card-body">

                            {/* Token selector */}
                            <div className="row mb-3 align-items-end">
                                <div className="col-md-5">
                                    <label className="form-label font-14">Token</label>
                                    <select className="form-select" value={token.address} onChange={handleTokenChange}>
                                        {KNOWN_TOKENS.map((tk) => (
                                            <option key={tk.address} value={tk.address}>{tk.symbol}</option>
                                        ))}
                                    </select>
                                </div>
                                {token.address === "custom" && (
                                    <>
                                        <div className="col-md-5">
                                            <label className="form-label font-14">Contract address (TRC-20)</label>
                                            <input type="text" className="form-control" placeholder="T…"
                                                value={customAddress}
                                                onChange={(e) => { setCustomAddress(e.target.value); setExactEstimate(null); setTokenBalance(null); }} />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label font-14">Decimals</label>
                                            <input type="number" className="form-control" min="0" max="18"
                                                value={customDecimals}
                                                onChange={(e) => setCustomDecimals(e.target.value)} />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* CSV paste */}
                            <div className="mb-3">
                                <label className="form-label font-14">
                                    Paste CSV <span style={{ color: "#888" }}>(one line per recipient: address,amount)</span>
                                </label>
                                <textarea className="form-control" rows={3}
                                    placeholder="TGj1Ej1qRzL9feLTLhjwgxXF4Ct6GTWg2U,100&#10;TAnotherAddr,50"
                                    onBlur={(e) => { if (e.target.value.trim()) { pasteCSV(e.target.value); e.target.value = ""; } }} />
                            </div>

                            {/* Recipients table */}
                            {anyInsufficient && tokenBalance !== null && (
                                <div className="d-flex align-items-center gap-2 p-2 rounded mb-2"
                                    style={{ background: "#fdecea", border: "1px solid #f5c6cb", fontSize: "0.88em" }}>
                                    <i className="bi bi-exclamation-triangle-fill" style={{ color: "#b91c1c", fontSize: "1.1em" }}></i>
                                    <span>
                                        <strong style={{ color: "#b91c1c" }}>Insufficient balance.</strong>{" "}
                                        Wallet has <strong>{tokenBalance.dp(6).toString()} {tokenSymbolDisplay}</strong>
                                        {" "}but total is{" "}
                                        <strong>{recipients.reduce((a, r) => a.plus(new BigNumber(parseFloat(r.amount) || 0)), new BigNumber(0)).dp(6).toString()} {tokenSymbolDisplay}</strong>.
                                    </span>
                                </div>
                            )}

                            <table className="table table-sm table-bordered">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Recipient address</th>
                                        <th>
                                            Amount ({tokenSymbolDisplay})
                                            {tokenBalance !== null && (
                                                <span style={{ color: "#555", fontWeight: "normal", fontSize: "0.82em" }}>
                                                    {" "}— balance:{" "}
                                                    <strong style={{ color: anyInsufficient ? "#b91c1c" : "#16a34a" }}>
                                                        {tokenBalance.dp(6).toString()}
                                                    </strong>
                                                </span>
                                            )}
                                        </th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recipients.map((row, idx) => {
                                        const rb = rowBalanceState[idx];
                                        const isInsuff = rb?.state === "insufficient";
                                        const result = results[idx];
                                        return (
                                            <tr key={idx} style={isInsuff ? { background: "#fdecea" } : undefined}>
                                                <td style={{ verticalAlign: "middle" }}>{idx + 1}</td>
                                                <td>
                                                    <input type="text"
                                                        className={`form-control form-control-sm${isInsuff ? " is-invalid" : ""}`}
                                                        placeholder="T…" value={row.address}
                                                        onChange={(e) => updateRow(idx, "address", e.target.value)} />
                                                </td>
                                                <td>
                                                    <input type="number"
                                                        className={`form-control form-control-sm${isInsuff ? " is-invalid" : ""}`}
                                                        min="0" placeholder="0" value={row.amount}
                                                        onChange={(e) => updateRow(idx, "amount", e.target.value)} />
                                                    {isInsuff && (
                                                        <div style={{ fontSize: "0.75em", color: "#b91c1c", marginTop: "2px" }}>
                                                            <i className="bi bi-exclamation-circle"></i>{" "}
                                                            cumulative {rb.running.toLocaleString()} &gt; balance {tokenBalance.dp(6).toString()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ verticalAlign: "middle", minWidth: "120px" }}>
                                                    {!result && isInsuff
                                                        ? <span style={{ color: "#b91c1c", fontWeight: "bold" }}><i className="bi bi-x-circle-fill"></i> Insufficient</span>
                                                        : txStatusCell(result)
                                                    }
                                                </td>
                                                <td style={{ verticalAlign: "middle" }}>
                                                    <button type="button" className="btn btn-sm btn-outline-danger"
                                                        onClick={() => removeRow(idx)} disabled={sending}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Energy & cost analysis panel */}
                            {!staticEst.isTRX && (totalEnergy > 0 || estimating) && (
                                <div className="mt-3 p-3 rounded"
                                    style={{ background: needsRental && savings.gt(0) ? "#f8f4ff" : "#f0fdf4", border: `1px solid ${needsRental && savings.gt(0) ? "#c9a0e0" : "#86efac"}` }}>
                                    <h6 className="d-flex align-items-center gap-2 mb-3" style={{ color: "#5a2d82" }}>
                                        <i className="bi bi-lightning-charge-fill"></i>
                                        Energy Analysis — {staticEst.txCount} tx
                                        {estimating && <span style={{ fontSize: "0.8em", color: "#888", fontWeight: "normal" }}><img src="images/cargando.gif" height="14px" alt="" /> simulating…</span>}
                                        {!estimating && exactEstimate && (
                                            <span style={{ fontSize: "0.75em", fontWeight: "normal", color: energySource === "simulation" ? "#16a34a" : "#d97706" }}>
                                                {energySource === "simulation" ? <><i className="bi bi-check-circle-fill"></i> exact simulation</> : <><i className="bi bi-exclamation-triangle-fill"></i> estimated</>}
                                            </span>
                                        )}
                                    </h6>

                                    {/* 5-card breakdown */}
                                    <div className="row g-2 mb-3" style={{ fontSize: "0.88em" }}>
                                        <div className="col-6 col-md">
                                            <div className="p-2 rounded text-center" style={{ background: "#ede0f7" }}>
                                                <div style={{ fontSize: "0.78em", color: "#7c3aed", textTransform: "uppercase" }}>Required</div>
                                                <div style={{ fontSize: "1.15em", fontWeight: "bold", fontFamily: "monospace", color: "#5a2d82" }}>{totalEnergy.toLocaleString()}</div>
                                                <div style={{ fontSize: "0.75em", color: "#888" }}>{hasVariance ? <>{energyMin.toLocaleString()}–{energyMax.toLocaleString()} / tx</> : <>{energyAvg.toLocaleString()} / tx</>}</div>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md">
                                            <div className="p-2 rounded text-center" style={{ background: userAvailable >= totalEnergy ? "#dcfce7" : "#fef9c3" }}>
                                                <div style={{ fontSize: "0.78em", color: "#555", textTransform: "uppercase" }}>Your wallet</div>
                                                <div style={{ fontSize: "1.15em", fontWeight: "bold", fontFamily: "monospace", color: userAvailable >= totalEnergy ? "#16a34a" : "#b45309" }}>{userEnergyKnown ? userAvailable.toLocaleString() : <span style={{ color: "#aaa" }}>—</span>}</div>
                                                <div style={{ fontSize: "0.75em", color: "#888" }}>{userEnergyKnown ? (userAvailable >= totalEnergy ? "✓ sufficient" : "insufficient") : "connect wallet"}</div>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md">
                                            <div className="p-2 rounded text-center" style={{ background: deficit === 0 ? "#dcfce7" : "#fdecea" }}>
                                                <div style={{ fontSize: "0.78em", color: "#555", textTransform: "uppercase" }}>To cover</div>
                                                <div style={{ fontSize: "1.15em", fontWeight: "bold", fontFamily: "monospace", color: deficit === 0 ? "#16a34a" : "#b91c1c" }}>{deficit === 0 ? <><i className="bi bi-check2"></i> none</> : deficit.toLocaleString()}</div>
                                                <div style={{ fontSize: "0.75em", color: "#888" }}>{deficit === 0 ? "no rental needed" : "energy deficit"}</div>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md">
                                            <div className="p-2 rounded text-center" style={{ background: "#f0f4ff" }}>
                                                <div style={{ fontSize: "0.78em", color: "#555", textTransform: "uppercase" }}>Bandwidth</div>
                                                <div style={{ fontSize: "1.15em", fontWeight: "bold", fontFamily: "monospace", color: "#1d4ed8" }}>{staticEst.bandwidthNeeded.toLocaleString()}</div>
                                                <div style={{ fontSize: "0.75em", color: "#888" }}>~{Math.round(staticEst.bandwidthNeeded / Math.max(staticEst.txCount, 1))} / tx</div>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md">
                                            <div className="p-2 rounded text-center" style={{ background: tokenBalanceBg }}>
                                                <div style={{ fontSize: "0.78em", color: "#555", textTransform: "uppercase" }}>{token.symbol} balance</div>
                                                <div style={{ fontSize: "1.15em", fontWeight: "bold", fontFamily: "monospace", color: tokenBalance === null ? "#888" : anyInsufficient ? "#b91c1c" : "#16a34a" }}>{tokenBalance !== null ? tokenBalance.dp(6).toString() : <span style={{ color: "#aaa" }}>—</span>}</div>
                                                <div style={{ fontSize: "0.75em", color: "#888" }}>{tokenBalance === null ? "loading…" : anyInsufficient ? "✗ insufficient" : "✓ ok"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cost comparison */}
                                    {needsRental && (
                                        <>
                                            <p style={{ fontSize: "0.82em", color: "#555", marginBottom: "6px" }}>
                                                Cost to cover <strong>{deficit.toLocaleString()} energy</strong> deficit
                                                {hasVariance && <span style={{ color: "#d97706", fontSize: "0.9em" }}> — <i className="bi bi-info-circle"></i> varies {energyMin.toLocaleString()}–{energyMax.toLocaleString()} / tx</span>}:
                                            </p>
                                            <table className="table table-sm mb-2" style={{ fontSize: "0.88em" }}>
                                                <thead><tr style={{ background: "#ede0f7" }}><th>Option</th><th>Rate</th><th>Avg / tx</th><th>Total (TRX)</th><th></th></tr></thead>
                                                <tbody>
                                                    <tr style={{ background: "#edfaf1" }}>
                                                        <td><span style={{ color: "#16a34a" }}><i className="bi bi-check-circle-fill"></i></span> <strong>Brutus rental</strong> <span style={{ color: "#888", fontSize: "0.85em" }}>(5 min)</span></td>
                                                        <td style={{ fontFamily: "monospace", color: "#555" }}>{brutusUnitSun.gt(0) ? brutusUnitSun.dp(2).toString() : "?"} SUN/energy</td>
                                                        <td style={{ fontFamily: "monospace", color: "#555" }}>{brutusUnitSun.gt(0) && staticEst.txCount > 0 ? brutusCostTRX.div(staticEst.txCount).dp(6).toString() : "—"} TRX</td>
                                                        <td style={{ color: "#16a34a", fontWeight: "bold", fontFamily: "monospace" }}>{brutusCostTRX.gt(0) ? brutusCostTRX.toString() : "—"} TRX</td>
                                                        <td>{savings.gt(0) && <span className="badge" style={{ background: "#16a34a", fontSize: "0.78em" }}>-{savingsPct.toString()}%</span>}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><span style={{ color: "#b91c1c" }}><i className="bi bi-fire"></i></span> TRX burn <span style={{ color: "#888", fontSize: "0.85em" }}>(no rental)</span></td>
                                                        <td style={{ fontFamily: "monospace", color: "#555" }}>{burnSunPerEnergy.toString()} SUN/energy</td>
                                                        <td style={{ fontFamily: "monospace", color: "#555" }}>{staticEst.txCount > 0 ? burnCostTRX.div(staticEst.txCount).dp(6).toString() : "—"} TRX</td>
                                                        <td style={{ color: "#b91c1c", fontWeight: "bold", fontFamily: "monospace" }}>{burnCostTRX.gt(0) ? burnCostTRX.toString() : "—"} TRX</td>
                                                        <td></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            {savings.gt(0) && (
                                                <div className="d-flex align-items-center gap-2 p-2 rounded mb-2" style={{ background: "#dcfce7", border: "1px solid #86efac", fontSize: "0.88em" }}>
                                                    <i className="bi bi-piggy-bank-fill" style={{ color: "#16a34a", fontSize: "1.1em" }}></i>
                                                    <span>Renting saves <strong style={{ color: "#15803d" }}>~{savings.toString()} TRX ({savingsPct.toString()}%)</strong> vs TRX burn. <strong>Rental recommended.</strong></span>
                                                </div>
                                            )}
                                            {!needsRental || deficit === 0 ? null : !savings.gt(0) && (
                                                <div className="d-flex align-items-center gap-2 p-2 rounded mb-2" style={{ background: "#fef9c3", border: "1px solid #fde047", fontSize: "0.88em" }}>
                                                    <i className="bi bi-info-circle-fill" style={{ color: "#b45309" }}></i>
                                                    <span>Prices are similar — either option works.</span>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {!needsRental && userEnergyKnown && (
                                        <div className="d-flex align-items-center gap-2 p-2 rounded mb-2" style={{ background: "#dcfce7", border: "1px solid #86efac", fontSize: "0.88em" }}>
                                            <i className="bi bi-check2-circle" style={{ color: "#16a34a", fontSize: "1.1em" }}></i>
                                            <span>Your wallet has <strong>{userAvailable.toLocaleString()} energy</strong> — enough for all {staticEst.txCount} tx at no extra cost.</span>
                                        </div>
                                    )}

                                    {/* Rent toggle */}
                                    <div className="form-check form-switch mt-2">
                                        <input className="form-check-input" type="checkbox" id="bulk_rent_check"
                                            checked={rentResources}
                                            onChange={(e) => setRentResources(e.target.checked)}
                                            disabled={sending || !needsRental} />
                                        <label className="form-check-label font-14" htmlFor="bulk_rent_check"
                                            style={{ cursor: needsRental ? "pointer" : "default", color: needsRental ? "inherit" : "#aaa" }}>
                                            {needsRental
                                                ? <><strong>Rent {deficit.toLocaleString()} energy</strong> with Brutus before sending{brutusCostTRX.gt(0) && <span style={{ color: "#555" }}> ({brutusCostTRX.toString()} TRX)</span>}</>
                                                : <span style={{ color: "#aaa" }}>No rental needed — wallet energy is sufficient</span>
                                            }
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="d-flex gap-2 flex-wrap mt-3">
                                <button type="button" className="btn btn-outline-primary btn-sm" onClick={addRow} disabled={sending}>
                                    <i className="bi bi-plus-circle"></i> Add row
                                </button>
                                <button type="button" className="btn btn-outline-secondary btn-sm" disabled={sending}
                                    onClick={() => { setRecipients([{ address: "", amount: "" }]); setResults([]); setProgress(null); }}>
                                    <i className="bi bi-arrow-counterclockwise"></i> Clear
                                </button>
                                <button type="button"
                                    className={`btn ms-auto ${rentResources ? "btn-warning" : "btn-success"}`}
                                    disabled={sending || anyInsufficient}
                                    onClick={handleSend}>
                                    {sending
                                        ? <><img src="images/cargando.gif" height="20px" alt="" /> Sending…</>
                                        : rentResources
                                        ? <><i className="bi bi-lightning-charge-fill"></i> Rent &amp; Send ({validRows.length} recipients)</>
                                        : <><i className="bi bi-send-fill"></i> Send all ({validRows.length} recipients)</>
                                    }
                                </button>
                            </div>

                            {/* Progress panel */}
                            {progress && (() => {
                                const theme = phaseColors[progress.phase] || phaseColors.signing;
                                const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
                                return (
                                    <div className="mt-3 p-3 rounded" style={{ background: theme.bg, border: `1.5px solid ${theme.border}` }}>
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <i className={`bi ${theme.icon}`} style={{ color: theme.color, fontSize: "1.2rem" }}></i>
                                            <strong style={{ color: theme.color }}>
                                                {progress.phase === "renting"      && "Renting energy…"}
                                                {progress.phase === "signing"      && "Waiting for wallet signature…"}
                                                {progress.phase === "broadcasting" && "Broadcasting to TRON network…"}
                                                {progress.phase === "waiting"      && "Waiting for confirmation…"}
                                                {progress.phase === "error"        && "Transaction error"}
                                                {progress.phase === "cancelled"    && "Cancelled by user"}
                                                {progress.phase === "done"         && "Completed"}
                                            </strong>
                                            <span className="ms-auto" style={{ fontSize: "0.85em", color: "#555" }}>{progress.current} / {progress.total} tx</span>
                                        </div>
                                        <div className="progress mb-2" style={{ height: "10px", backgroundColor: "#ddd" }}>
                                            <div className="progress-bar progress-bar-striped progress-bar-animated"
                                                style={{ width: `${pct}%`, backgroundColor: theme.color, transition: "width 0.4s ease" }}
                                                aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" />
                                        </div>
                                        <p className="mb-2" style={{ fontSize: "0.85em", color: "#333", wordBreak: "break-all", fontFamily: "monospace" }}>{progress.step}</p>
                                        {progress.total > 1 && (
                                            <div className="d-flex gap-3 flex-wrap" style={{ fontSize: "0.82em" }}>
                                                {[
                                                    { filter: (r) => r.status === "confirmed", color: "#1a7a3c", icon: "bi-check2-circle", label: "confirmed" },
                                                    { filter: (r) => r.status === "ok" || r.status === "sent", color: "#27ae60", icon: "bi-check-circle-fill", label: "broadcast" },
                                                    { filter: (r) => r.status === "reverted", color: "#c0392b", icon: "bi-arrow-counterclockwise", label: "reverted" },
                                                    { filter: (r) => r.status === "failed" || r.status === "error", color: "#c0392b", icon: "bi-x-circle-fill", label: "failed" },
                                                    { filter: (r) => r.status === "cancelled", color: "#7f8c8d", icon: "bi-slash-circle", label: "cancelled" },
                                                ].map(({ filter, color, icon, label }) => (
                                                    <span key={label} style={{ color }}><i className={`bi ${icon}`}></i> {results.filter(filter).length} {label}</span>
                                                ))}
                                                <span style={{ color: "#888" }}><i className="bi bi-hourglass"></i> {Math.max(0, progress.total - results.length)} pending</span>
                                            </div>
                                        )}
                                        {(progress.phase === "done" || progress.phase === "cancelled" || (progress.phase === "error" && !sending)) && (
                                            <button type="button" className="btn btn-sm btn-outline-secondary mt-2" onClick={() => setProgress(null)}>
                                                <i className="bi bi-x"></i> Dismiss
                                            </button>
                                        )}
                                        {!["done", "cancelled", "error"].includes(progress.phase) && (
                                            <p className="mb-0 mt-2" style={{ fontSize: "0.78em", color: "#c0392b", fontWeight: "bold" }}>
                                                <i className="bi bi-exclamation-triangle-fill"></i> Do not close or refresh this tab — transactions are in progress.
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* ── Right panel: how-it-works ── */}
                <div className="col-lg-4 pt-2 col-sm-12">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5>How it works</h5>
                            <ol className="font-14" style={{ paddingLeft: "1.2rem" }}>
                                <li>Choose a token (USDT, BRUT, BTT… or paste a custom TRC-20 address).</li>
                                <li>Add recipients manually or paste a CSV block.</li>
                                <li>Enable <b>Rent with Brutus</b> to pre-rent energy and pay much less in fees.</li>
                                <li>Click <b>Send all</b> — each transfer is signed individually by your TronLink wallet.</li>
                                <li>Track results inline; click a green checkmark to view the tx on TronScan.</li>
                            </ol>
                            <hr />
                            <p className="font-14" style={{ color: "#888" }}>
                                <i className="bi bi-info-circle"></i> USDT / TRC-20 transfers consume ~32 000–65 000 energy each.
                                Without staked/rented energy TRON burns ~420 SUN per energy unit from your TRX balance.
                            </p>
                            <hr />
                            <p className="font-14"><b>Supported tokens:</b></p>
                            <ul className="font-14" style={{ paddingLeft: "1.2rem" }}>
                                {KNOWN_TOKENS.filter((tk) => tk.address !== "custom").map((tk) => (
                                    <li key={tk.address}>
                                        <b>{tk.symbol}</b>
                                        {tk.address !== "TRX" && (
                                            <> — <a href={`https://tronscan.org/#/token20/${tk.address}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8em", color: "purple" }}>{tk.address.slice(0, 8)}…</a></>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Transaction history ── */}
            {txHistory.length > 0 && (
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header d-flex align-items-center gap-2 flex-wrap">
                                <h5 className="mb-0"><i className="bi bi-clock-history"></i> Transaction History</h5>
                                <span className="badge bg-secondary ms-1">{txHistory.length}</span>
                                <div className="ms-auto d-flex gap-1 flex-wrap">
                                    {[
                                        { key: "all",       label: "All" },
                                        { key: "ok",        label: "✓ Success" },
                                        { key: "error",     label: "✗ Failed / Reverted" },
                                        { key: "cancelled", label: "⊘ Cancelled" },
                                    ].map(({ key, label }) => (
                                        <button key={key} type="button"
                                            className={`btn btn-sm ${historyFilter === key ? "btn-primary" : "btn-outline-secondary"}`}
                                            onClick={() => setHistoryFilter(key)}>{label}</button>
                                    ))}
                                    <button type="button" className="btn btn-sm btn-outline-danger"
                                        onClick={() => { localStorage.removeItem(TX_HISTORY_KEY); setTxHistory([]); }}
                                        title="Clear all history">
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
                                            {filteredHistory.length === 0 ? (
                                                <tr><td colSpan={6} className="text-center text-muted py-3">No transactions match the selected filter.</td></tr>
                                            ) : filteredHistory.map((tx) => {
                                                const dt = new Date(tx.timestamp);
                                                return (
                                                    <tr key={tx.id}>
                                                        <td style={{ whiteSpace: "nowrap", color: "#555" }}>
                                                            {dt.toLocaleDateString()}<br />
                                                            <span style={{ color: "#999" }}>{dt.toLocaleTimeString()}</span>
                                                        </td>
                                                        <td><strong>{tx.token}</strong></td>
                                                        <td style={{ fontFamily: "monospace" }}>{tx.amount}</td>
                                                        <td style={{ fontFamily: "monospace" }}>
                                                            <a href={`https://tronscan.org/#/address/${tx.to}`} target="_blank" rel="noopener noreferrer" style={{ color: "#555" }} title={tx.to}>
                                                                {tx.to.slice(0, 8)}…{tx.to.slice(-6)}
                                                            </a>
                                                        </td>
                                                        <td>{statusBadge(tx)}</td>
                                                        <td style={{ fontFamily: "monospace" }}>
                                                            {tx.txid
                                                                ? <a href={`https://tronscan.org/#/transaction/${tx.txid}`} target="_blank" rel="noopener noreferrer" style={{ color: "purple" }} title={tx.txid}>
                                                                    {tx.txid.slice(0, 10)}…{tx.txid.slice(-6)}{" "}<i className="bi bi-box-arrow-up-right" style={{ fontSize: "0.75em" }}></i>
                                                                  </a>
                                                                : <span style={{ color: "#bbb" }} title={tx.errMsg}>— <small>{tx.errMsg?.slice(0, 30)}</small></span>
                                                            }
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-muted px-3 py-2 mb-0" style={{ fontSize: "0.75em", borderTop: "1px solid #eee" }}>
                                    <i className="bi bi-info-circle"></i> History is stored locally in your browser. Max {TX_HISTORY_MAX} entries (newest first).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal ── */}
            <div className="modal fade" id="mensaje-bbsend"
                data-bs-backdrop={sending ? "static" : "true"}
                data-bs-keyboard={sending ? "false" : "true"}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{modalTitle}</h5>
                            {!sending && <button type="button" className="btn-close" data-bs-dismiss="modal"></button>}
                        </div>
                        <div className="modal-body">
                            <p>{modalBody}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ── Pure helper: simulate energy per row (extracted for reuse) ─────────────────
async function simulateEnergyPerRow(tronWeb, accountAddress, tokenAddress, decimals, rows, fallbackPerTx) {
    const simulations = await Promise.all(
        rows.map(async (row) => {
            const toAddr = row.address.trim();
            const amountSun = new BigNumber(row.amount).shiftedBy(decimals).dp(0).toFixed(0);
            const inputs = [
                { type: "address", value: tronWeb.address.toHex(toAddr) },
                { type: "uint256", value: amountSun },
            ];
            const sim = await tronWeb.transactionBuilder
                .triggerConstantContract(
                    tronWeb.address.toHex(tokenAddress),
                    "transfer(address,uint256)",
                    { feeLimit: 150_000_000 },
                    inputs,
                    tronWeb.address.toHex(accountAddress),
                )
                .catch(() => null);

            const energyUsed = sim && sim.energy_used ? sim.energy_used : fallbackPerTx;
            const source = sim && sim.energy_used ? "simulation" : "fallback";
            return { address: toAddr, energyUsed, source };
        }),
    );

    const allSim = simulations.every((s) => s.source === "simulation");
    const totalEnergy = simulations.reduce((acc, s) => acc + s.energyUsed, 0);
    const energyMin = Math.min(...simulations.map((s) => s.energyUsed));
    const energyMax = Math.max(...simulations.map((s) => s.energyUsed));
    const energyAvg = simulations.length > 0 ? Math.round(totalEnergy / simulations.length) : 0;

    return { perRow: simulations, totalEnergy, energyMin, energyMax, energyAvg, source: allSim ? "simulation" : "fallback" };
}

export default withTranslation()(BulkSendPage);
