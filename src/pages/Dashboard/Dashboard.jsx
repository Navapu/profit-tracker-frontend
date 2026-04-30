import { apiClient } from "../../services/apiClient.js";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";
export const Dashboard = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({});
  const getSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient("/transactions/summary", {
        method: "GET",
      });
      const res = await response.json();

      if (!response.ok) throw new Error(res.msg || "Get Summary failed");

      setSummary(res.data);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ClipLoader color="#34d399" size={40} />
      </div>
    );
  }
  
  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">
          {t("dashboard.access")}
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-white">
          {t("dashboard.title")}
        </h2>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-xl shadow-slate-950/20">
          <p className="text-sm text-slate-400">{t("dashboard.balance")}</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {summary.balance|| "0"}
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-xl shadow-slate-950/20">
          <p className="text-sm text-slate-400">{t("dashboard.income")}</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">
            {summary.totalIncome|| "0"}
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-xl shadow-slate-950/20">
          <p className="text-sm text-slate-400">{t("dashboard.expenses")}</p>
          <p className="mt-2 text-3xl font-semibold text-rose-300">
            {summary.totalExpense|| "0"}
          </p>
        </article>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
    </div>
  );
};
