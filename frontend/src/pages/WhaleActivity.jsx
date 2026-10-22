import { useCallback, useEffect, useState } from "react";

function WhaleActivity() {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityHistory, setActivityHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/activity", {
        method: "GET",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch activity prediction",
        );
      }

      setActivity(result);
    } catch (err) {
      setError(err.message || "Unable to load market activity");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivityHistory = useCallback(async () => {
    setHistoryError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/activity/history",
        {
          method: "GET",
          credentials: "include",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch activity history");
      }

      setActivityHistory(result.data || []);
    } catch (err) {
      setHistoryError(err.message || "Unable to load activity history");
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await fetchActivity();
    await fetchActivityHistory();
  }, [fetchActivity, fetchActivityHistory]);

  useEffect(() => {
    refreshAll();

    const intervalId = setInterval(() => {
      refreshAll();
    }, 60_000);

    return () => clearInterval(intervalId);
  }, [refreshAll]);

  const prediction = activity?.data;

  const probability = prediction
    ? (prediction.activity_probability * 100).toFixed(2)
    : null;

  const isHighActivity = prediction?.high_activity;

  return (
    <div className="min-h-full bg-[#050914] p-6 text-white">
      {/* Page header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-wide text-orange-500">
            Whale Activity
          </h1>

          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-500">
            Bitcoin market activity intelligence
          </p>
        </div>

        <button
          onClick={refreshAll}
          disabled={loading}
          className="rounded border border-orange-500/40 px-4 py-2 text-sm text-orange-400 transition hover:bg-orange-500/10 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Refresh"}
        </button>
      </div>

      {/* Current prediction error */}
      {error && (
        <div className="mb-6 rounded border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{error}</p>

          <button
            onClick={refreshAll}
            className="mt-3 text-sm text-orange-400 hover:text-orange-300"
          >
            Try again
          </button>
        </div>
      )}

      {loading && !activity && (
        <div className="rounded-lg border border-orange-500/20 bg-[#0a0a0a] p-8 text-sm text-slate-400">
          Fetching BTC market data and analyzing activity...
        </div>
      )}

      {/* Current activity prediction */}
      {prediction && (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Probability card */}
            <div className="rounded-lg border border-orange-500/20 bg-[#0a0a0a] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Predicted activity probability
              </p>

              <p className="mt-4 text-4xl font-bold text-orange-400">
                {probability}%
              </p>

              <div className="mt-5 h-2 overflow-hidden rounded bg-slate-800">
                <div
                  className="h-full rounded bg-orange-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      prediction.activity_probability * 100,
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Model alert threshold:{" "}
                {(prediction.alert_threshold * 100).toFixed(0)}%
              </p>
            </div>

            {/* Status card */}
            <div className="rounded-lg border border-orange-500/20 bg-[#0a0a0a] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Market activity status
              </p>

              <p
                className={`mt-4 text-2xl font-bold ${
                  isHighActivity ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {isHighActivity ? "HIGH ACTIVITY ALERT" : "NORMAL ACTIVITY"}
              </p>

              <p className="mt-3 text-sm text-slate-400">
                {isHighActivity
                  ? "The model detected a higher probability of unusually high trading activity."
                  : "The model's probability is below the configured high-activity alert threshold."}
              </p>
            </div>
          </div>

          {/* Prediction details */}
          <div className="mt-5 rounded-lg border border-orange-500/20 bg-[#0a0a0a] p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-orange-400">
              Prediction details
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">
                  Historical candles analyzed
                </p>

                <p className="mt-1 text-lg">{activity.candlesUsed}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Last successful update</p>

                <p className="mt-1 text-sm">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="mt-5 rounded-lg border border-slate-700 bg-slate-900/40 p-5">
            <h2 className="text-sm font-semibold text-slate-300">
              About this prediction
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              This model estimates unusually high trading activity using Binance
              BTC/USDT candle data, including volume, trade counts, price
              returns, and buy pressure. It does not identify individual traders
              or confirm whale transactions on-chain.
            </p>
          </div>
        </>
      )}

      {/* Recent activity history */}
      <div className="mt-6 rounded-lg border border-orange-500/20 bg-[#0a0a0a] p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-orange-400">
              Recent Activity History
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Previously saved BTC market activity predictions
            </p>
          </div>

          <span className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-400">
            {activityHistory.length} records
          </span>
        </div>

        {historyError && (
          <p className="mb-4 text-sm text-red-400">{historyError}</p>
        )}

        {!historyError && activityHistory.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">
            No activity history available yet.
          </p>
        )}

        {activityHistory.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-medium">Date & Time</th>
                  <th className="px-4 py-3 font-medium">Probability</th>
                  <th className="px-4 py-3 font-medium">Threshold</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {activityHistory.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-slate-800/70 transition hover:bg-slate-900/50"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-slate-300">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>

                    <td className="px-4 py-4 font-medium text-orange-400">
                      {(item.activity_probability * 100).toFixed(2)}%
                    </td>

                    <td className="px-4 py-4 text-slate-400">
                      {(item.alert_threshold * 100).toFixed(0)}%
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${
                          item.high_activity
                            ? "border border-red-500/30 bg-red-500/10 text-red-400"
                            : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {item.high_activity ? "High Activity" : "Normal"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-600">
          History refreshes automatically every 60 seconds.
        </p>
      </div>
    </div>
  );
}

export default WhaleActivity;
