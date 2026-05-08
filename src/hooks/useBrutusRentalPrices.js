/**
 * useBrutusRentalPrices
 *
 * Fetches the Brutus energy-rental price list and pool availability from the
 * BOT API and exposes them as reactive state.  Both EBOT (rental page) and
 * BBSEND (bulk-send page) depend on these prices to calculate costs.
 *
 * Usage:
 *   const { precios, energyOn, bandOn, av_energy, av_band, refresh } =
 *     useBrutusRentalPrices();
 *
 * The hook refreshes automatically every `refreshInterval` ms (default 15 s).
 * Call `refresh()` to force an immediate update.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import BigNumber from "bignumber.js";
import { config } from "../config/env";

const DEFAULT_PRECIOS = { energy: [], bandwidth: [] };
const REFRESH_INTERVAL_MS = 15_000;

export function useBrutusRentalPrices(refreshInterval = REFRESH_INTERVAL_MS) {
  const [precios, setPrecios] = useState(DEFAULT_PRECIOS);
  const [energyOn, setEnergyOn] = useState(false);
  const [bandOn, setBandOn] = useState(false);
  const [avEnergy, setAvEnergy] = useState([]); // full list per duration
  const [avBand, setAvBand] = useState([]);     // full list per duration
  const [totalEnergyPool, setTotalEnergyPool] = useState(0);
  const [totalBandPool, setTotalBandPool] = useState(0);
  const [loading, setLoading] = useState(false);

  const mountedRef = useRef(true);

  const fetchAll = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const URL = config.BOT_URL;

      // ── 1. Check availability ──────────────────────────────────────────────
      const availRes = await fetch(URL)
        .then((r) => r.json())
        .catch(() => null);

      if (!availRes || !mountedRef.current) {
        setLoading(false);
        return;
      }

      const isOn = Boolean(availRes.available);
      setEnergyOn(isOn);
      setBandOn(isOn);

      // ── 2. Detailed availability per duration ──────────────────────────────
      const detail = await fetch(URL + "available")
        .then((r) => r.json())
        .catch(() => null);

      if (!detail || !mountedRef.current) {
        setLoading(false);
        return;
      }

      const available_energy = [
        { duration: "5min", available: detail.av_energy[0].available },
        { duration: "1h",   available: detail.av_energy[0].available },
        { duration: "1d",   available: detail.av_energy[1].available },
        { duration: "3d",   available: detail.av_energy[2].available },
        { duration: "7d",   available: detail.av_energy[3].available },
        { duration: "14d",  available: detail.av_energy[3].available },
        { duration: "30d",  available: detail.av_energy[3].available },
      ];

      const available_bandwidth = [
        { duration: "5min", available: detail.av_band[0].available },
        { duration: "1h",   available: detail.av_band[0].available },
        { duration: "1d",   available: detail.av_band[1].available },
        { duration: "3d",   available: detail.av_band[2].available },
        { duration: "7d",   available: detail.av_band[3].available },
        { duration: "14d",  available: detail.av_band[3].available },
        { duration: "30d",  available: detail.av_band[3].available },
      ];

      setAvEnergy(available_energy);
      setAvBand(available_bandwidth);
      setTotalEnergyPool(detail.total_energy_pool);
      setTotalBandPool(detail.total_bandwidth_pool);

      // ── 3. Price list ──────────────────────────────────────────────────────
      const priceData = await fetch(URL + "/prices/all", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((r) => r.json())
        .catch(() => null);

      if (!priceData || !mountedRef.current) {
        setLoading(false);
        return;
      }

      const energyPrices = [
        { duration: "5min", UE: new BigNumber(priceData.energy_minutes_100K).shiftedBy(1).dp(6).toNumber() },
        { duration: "1h",   UE: new BigNumber(priceData.energy_hour_100K).shiftedBy(1).dp(6).toNumber() },
        { duration: "1",    UE: new BigNumber(priceData.energy_one_day_100K).shiftedBy(1).dp(6).toNumber() },
        { duration: "2",    UE: new BigNumber(priceData.energy_over_one_day_100K).shiftedBy(1).dp(6).toNumber() },
        { duration: "3",    UE: new BigNumber(priceData.energy_over_one_day_100K).shiftedBy(1).dp(6).toNumber() },
        { duration: "4",    UE: new BigNumber(priceData.energy_over_one_day_100K).shiftedBy(1).dp(6).toNumber() },
        { duration: "7",    UE: new BigNumber(priceData.energy_over_one_day_100K).shiftedBy(1).times(7 / 3).dp(6).toNumber() },
        { duration: "14",   UE: new BigNumber(priceData.energy_over_one_day_100K).shiftedBy(1).times(14 / 3).dp(6).toNumber() },
        { duration: "30",   UE: new BigNumber(priceData.energy_over_one_day_100K).shiftedBy(1).times(30 / 3).dp(6).toNumber() },
      ];

      const bandwidthPrices = [
        { duration: "5min", UE: new BigNumber(priceData.band_minutes_1000).times(1000).dp(6).toNumber() },
        { duration: "1h",   UE: new BigNumber(priceData.band_hour_1000).times(1000).dp(6).toNumber() },
        { duration: "1",    UE: new BigNumber(priceData.band_one_day_1000).times(1000).dp(6).toNumber() },
        { duration: "2",    UE: new BigNumber(priceData.band_one_day_1000).times(1000).dp(6).toNumber() },
        { duration: "3",    UE: new BigNumber(priceData.band_over_one_day_1000).times(1000).dp(6).toNumber() },
        { duration: "4",    UE: new BigNumber(priceData.band_over_one_day_1000).times(1000).dp(6).toNumber() },
        { duration: "7",    UE: new BigNumber(priceData.band_over_one_day_1000).times(1000).times(7 / 3).dp(6).toNumber() },
        { duration: "14",   UE: new BigNumber(priceData.band_over_one_day_1000).times(1000).times(14 / 3).dp(6).toNumber() },
        { duration: "30",   UE: new BigNumber(priceData.band_over_one_day_1000).times(1000).times(30 / 3).dp(6).toNumber() },
      ];

      if (mountedRef.current) {
        setPrecios({ energy: energyPrices, bandwidth: bandwidthPrices });
      }
    } catch (e) {
      console.error("[useBrutusRentalPrices]", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial fetch + interval
  useEffect(() => {
    mountedRef.current = true;
    fetchAll();

    const id = setInterval(fetchAll, refreshInterval);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchAll, refreshInterval]);

  return {
    precios,
    energyOn,
    bandOn,
    avEnergy,
    avBand,
    totalEnergyPool,
    totalBandPool,
    loading,
    refresh: fetchAll,
  };
}
