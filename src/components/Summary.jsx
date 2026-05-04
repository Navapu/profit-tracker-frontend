import { apiClient } from "../services/apiClient.js";
import { useState, useEffect, useEffectEvent } from "react";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";

const TRANSACTION_UPDATED_EVENT = "transactions:updated";
const DEFAULT_PERIOD = "month";

const formatAmount = (value) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDateForApi = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getSummaryRange = (period) => {
  const today = new Date();
  const endDate = formatDateForApi(today);
  const startDate = new Date(today);

  if (period === "today") {
    return { startDate: endDate, endDate };
  }

  if (period === "week") {
    startDate.setDate(today.getDate() - 6);

    return {
      startDate: formatDateForApi(startDate),
      endDate,
    };
  }

  if (period === "sixMonths") {
    startDate.setMonth(today.getMonth() - 5, 1);

    return {
      startDate: formatDateForApi(startDate),
      endDate,
    };
  }

  if (period === "year") {
    startDate.setMonth(0, 1);

    return {
      startDate: formatDateForApi(startDate),
      endDate,
    };
  }

  startDate.setDate(1);

  return {
    startDate: formatDateForApi(startDate),
    endDate,
  };
};

export const Summary = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD);

  const periodOptions = [
    { value: "today", label: t("dashboard.periodToday") },
    { value: "week", label: t("dashboard.periodWeek") },
    { value: "month", label: t("dashboard.periodMonth") },
    { value: "sixMonths", label: t("dashboard.periodSixMonths") },
    { value: "year", label: t("dashboard.periodYear") },
  ];

  const getSummary = useEffectEvent(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { startDate, endDate } = getSummaryRange(selectedPeriod);
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await apiClient(
        `/transactions/summary?${params.toString()}`,
        {
          method: "GET",
        }
      );
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
  }, [selectedPeriod]);

  useEffect(() => {
    const handleTransactionUpdated = () => {
      getSummary();
    };

    window.addEventListener(TRANSACTION_UPDATED_EVENT, handleTransactionUpdated);

    return () => {
      window.removeEventListener(
        TRANSACTION_UPDATED_EVENT,
        handleTransactionUpdated
      );
    };
  }, []);

  const activeRange = getSummaryRange(selectedPeriod);
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
  const activePresetLabel =
    periodOptions.find((option) => option.value === selectedPeriod)?.label ||
    t("dashboard.periodMonth");

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur xl:col-span-12 xl:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_26%)]" />

      <div className="relative space-y-8">
        <header className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-start">
          <div className="space-y-4">
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

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                {t("dashboard.rangePreset")}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {periodOptions.map((option) => {
                  const isActive = selectedPeriod === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedPeriod(option.value)}
                      className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-emerald-400 text-slate-950"
                          : "border border-slate-700 bg-slate-950 text-slate-200 hover:border-emerald-400/40 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
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
            <p className="mt-4 text-sm text-slate-400">
              {t("dashboard.activePreset", { preset: activePresetLabel })}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {t("dashboard.activeRange", {
                start: activeRange.startDate,
                end: activeRange.endDate,
              })}
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
