import { apiClient } from "../services/apiClient.js";
import { useState, useEffect, useEffectEvent } from "react";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";

const formatAmount = (value) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatMonth = (value, language = "es") => {
  const [year, month] = String(value || "").split("-");

  if (!year || !month) return "--";

  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
};

export const Stats = () => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);

  const getStats = useEffectEvent(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient("/transactions/stats?months=6", {
        method: "GET",
      });
      const res = await response.json();

      if (!response.ok) throw new Error(res.msg || t("errors.getStatsFailed"));

      setStats(Array.isArray(res.data) ? res.data : []);
    } catch (requestError) {
      setError(requestError.message || t("errors.unexpected"));
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    getStats();
  }, []);

  const maxValue = Math.max(
    ...stats.flatMap((item) => [
      Number(item.totalIncome) || 0,
      Number(item.totalExpense) || 0,
    ]),
    1
  );

  const chartHeight = 220;
  const chartWidth = Math.max(stats.length * 90, 360);
  const barWidth = 20;
  const groupGap = 30;
  const leftPadding = 18;
  const bottomPadding = 26;
  const topPadding = 18;
  const usableHeight = chartHeight - topPadding - bottomPadding;

  return (
    <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur xl:col-span-4 xl:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.10),transparent_30%)]" />

      <div className="relative space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">
            {t("stats.eyebrow")}
          </p>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-white">
              {t("stats.title")}
            </h3>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-white/10 bg-slate-950/40">
            <ClipLoader color="#34d399" size={42} speedMultiplier={0.8} />
          </div>
        ) : stats.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <span className="mr-2">{t("stats.monthlyChart")}</span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                {t("stats.income")}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                {t("stats.expenses")}
              </span>
            </div>

            <div className="overflow-x-auto rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-4">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="h-64 min-w-90 w-full"
                role="img"
                aria-label={t("stats.chartAria")}
              >
                <line
                  x1={leftPadding}
                  y1={chartHeight - bottomPadding}
                  x2={chartWidth - 8}
                  y2={chartHeight - bottomPadding}
                  stroke="rgba(148, 163, 184, 0.24)"
                  strokeWidth="1"
                />

                {stats.map((item, index) => {
                  const income = Number(item.totalIncome) || 0;
                  const expense = Number(item.totalExpense) || 0;
                  const groupX = leftPadding + index * (barWidth * 2 + groupGap);
                  const incomeHeight = (income / maxValue) * usableHeight;
                  const expenseHeight = (expense / maxValue) * usableHeight;

                  return (
                    <g key={item.month}>
                      <rect
                        x={groupX}
                        y={chartHeight - bottomPadding - incomeHeight}
                        width={barWidth}
                        height={incomeHeight}
                        rx="8"
                        fill="#34d399"
                      />
                      <rect
                        x={groupX + barWidth + 8}
                        y={chartHeight - bottomPadding - expenseHeight}
                        width={barWidth}
                        height={expenseHeight}
                        rx="8"
                        fill="#fb7185"
                      />
                      <text
                        x={groupX + barWidth + 4}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="10"
                      >
                        {formatMonth(item.month, i18n.language)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="space-y-3">
              {stats.map((item) => {
                const income = Number(item.totalIncome) || 0;
                const expense = Number(item.totalExpense) || 0;
                const balance = Number(item.balance) || 0;

                return (
                  <article
                    key={item.month}
                    className="rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {formatMonth(item.month, i18n.language)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                          {item.month}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${
                          balance >= 0
                            ? "bg-emerald-400/10 text-emerald-200"
                            : "bg-rose-400/10 text-rose-200"
                        }`}
                      >
                        {t("stats.balanceLabel")} {formatAmount(balance)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                          {t("stats.income")}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-emerald-300">
                          {formatAmount(income)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                          {t("stats.expenses")}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-rose-300">
                          {formatAmount(expense)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white">
              {t("stats.emptyTitle")}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {t("stats.emptyDescription")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
