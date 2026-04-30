import { apiClient } from "../services/apiClient.js";
import { useState, useEffect, useEffectEvent } from "react";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";

const formatAmount = (value) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

export const Summary = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({});

  const getSummary = useEffectEvent(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient("/transactions/summary", {
        method: "GET",
      });
      const res = await response.json();

      if (!response.ok) throw new Error(res.msg || t("errors.getSummaryFailed"));

      setSummary(res.data);
    } catch (requestError) {
      setError(requestError.message || t("errors.unexpected"));
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    getSummary();
  }, []);

  const totalIncome = Number(summary.totalIncome) || 0;
  const totalExpense = Number(summary.totalExpense) || 0;
  const balance = Number(summary.balance) || 0;
  const savingsRate =
    totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;
  const balanceTone =
    balance > 0
      ? "text-emerald-300"
      : balance < 0
        ? "text-rose-300"
        : "text-white";

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur xl:col-span-12 xl:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_26%)]" />

      <div className="relative space-y-8">
        <header className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)] xl:items-start">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">
              {t("dashboard.access")}
            </p>
            <div className="max-w-3xl space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {t("dashboard.title")}
              </h2>
              <p className="text-sm leading-6 text-slate-300 sm:text-base">
                {t("dashboard.subtitle")}
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5 shadow-xl shadow-slate-950/20">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              {t("dashboard.netStatus")}
            </p>
            <p className={`mt-3 text-3xl font-semibold ${balanceTone}`}>
              {formatAmount(balance)}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {balance >= 0
                ? t("dashboard.netPositive")
                : t("dashboard.netNegative")}
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full ${
                  balance >= 0 ? "bg-emerald-400" : "bg-rose-400"
                }`}
                style={{
                  width: `${Math.min(Math.max(Math.abs(savingsRate), 8), 100)}%`,
                }}
              />
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
              {t("dashboard.savingsRate", { value: savingsRate })}
            </p>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-44 items-center justify-center rounded-3xl border border-white/10 bg-slate-950/40">
            <ClipLoader color="#34d399" size={42} speedMultiplier={0.8} />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl border border-white/10 bg-slate-950/45 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-sm text-slate-400">{t("dashboard.balance")}</p>
              <p className={`mt-3 text-3xl font-semibold ${balanceTone}`}>
                {formatAmount(balance)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {t("dashboard.balanceHint")}
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-slate-950/45 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-sm text-slate-400">{t("dashboard.income")}</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-300">
                {formatAmount(totalIncome)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {t("dashboard.incomeHint")}
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-slate-950/45 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-sm text-slate-400">{t("dashboard.expenses")}</p>
              <p className="mt-3 text-3xl font-semibold text-rose-300">
                {formatAmount(totalExpense)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {t("dashboard.expenseHint")}
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-slate-950/45 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-sm text-slate-400">
                {t("dashboard.savingsMetric")}
              </p>
              <p className="mt-3 text-3xl font-semibold text-sky-300">
                {savingsRate}%
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {t("dashboard.savingsHint")}
              </p>
            </article>
          </div>
        )}
      </div>
    </section>
  );
};
