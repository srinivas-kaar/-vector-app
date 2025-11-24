import { useState, useCallback, useMemo } from "react";
import { API_BASE_URL } from "../config";

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getMonthLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return monthNames[d.getMonth()];
}

export default function useOppData(currentUser, ownerScope) {
  const [opps, setOpps] = useState([]);
  const loadOpps = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/opportunities`);
      const data = await res.json();
      setOpps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load opportunities:", err);
    }
  }, []);

  const scopedOpps = useMemo(() => {
    if (ownerScope === "all") return opps;
    return opps.filter((o) => o.CREATEDBY === currentUser);
  }, [opps, ownerScope, currentUser]);

  
  const latestFive = useMemo(() => {
    return [...scopedOpps]
      .sort((a, b) => new Date(b.CREATEDAT) - new Date(a.CREATEDAT))
      .slice(0, 5);
  }, [scopedOpps]);

  
  const kpiTotal = useMemo(() => scopedOpps.length, [scopedOpps]);

  
  const kpiInReview = useMemo(() => {
    return scopedOpps.filter((o) => o.STATUS === "Review").length;
  }, [scopedOpps]);

  
  const avgDealSize = useMemo(() => {
    if (scopedOpps.length === 0) return 0;
    const sum = scopedOpps.reduce(
      (s, o) => s + (Number(o.ESTIMATEDREVENUE) || 0),
      0
    );
    return sum / scopedOpps.length;
  }, [scopedOpps]);

  
  const trendData = useMemo(() => {
    const buckets = {};

    scopedOpps.forEach((o) => {
      const m = getMonthLabel(o.ESTIMATEDSTARTDATE || o.CREATEDAT);
      if (!m) return;

      if (!buckets[m]) buckets[m] = 0;
      buckets[m] += 1;
    });

    const sorted = monthNames
      .map((m) => ({
        month: m,
        total: buckets[m] || 0,
      }))
      .filter((d) => d.total > 0);

    return sorted;
  }, [scopedOpps]);

  const statusData = useMemo(() => {
    const buckets = {};

    scopedOpps.forEach((o) => {
      if (!buckets[o.STATUS]) buckets[o.STATUS] = 0;
      buckets[o.STATUS] += 1;
    });

    return Object.entries(buckets).map(([STATUS, count]) => ({
      STATUS,
      count,
    }));
  }, [scopedOpps]);

  return {
    opps,
    loadOpps,
    scopedOpps,
    latestFive,
    kpiTotal,
    kpiInReview,
    avgDealSize,
    trendData,
    statusData,
  };
}
