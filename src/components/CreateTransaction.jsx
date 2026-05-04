import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

import { apiClient } from "../services/apiClient.js";

const TRANSACTION_UPDATED_EVENT = "transactions:updated";

const createTransactionSchema = (t) =>
  z.object({
    type: z.enum(["income", "expense"], {
      error: () => ({ message: t("validation.transactionTypeRequired") }),
    }),
    name: z
      .string()
      .trim()
      .min(3, t("validation.transactionNameMin"))
      .max(100, t("validation.transactionNameMax")),
    amount: z.coerce
      .number({
        error: () => ({ message: t("validation.transactionAmountRequired") }),
      })
      .positive(t("validation.transactionAmountPositive")),
    transactionDate: z
      .string()
      .trim()
      .min(1, t("validation.transactionDateRequired"))
      .regex(/^\d{4}-\d{2}-\d{2}$/, t("validation.transactionDateFormat")),
  });

export const CreateTransaction = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTransactionSchema(t)),
    defaultValues: {
      type: "expense",
      name: "",
      amount: "",
      transactionDate: new Date().toISOString().slice(0, 10),
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient("/transactions/create", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          name: values.name.trim(),
          amount: Number(values.amount),
        }),
      });
      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.msg || t("errors.createTransactionFailed"));
      }

      toast.success(res.msg || t("createTransaction.success"));
      reset({
        type: values.type,
        name: "",
        amount: "",
        transactionDate: new Date().toISOString().slice(0, 10),
      });
      window.dispatchEvent(new Event(TRANSACTION_UPDATED_EVENT));
    } catch (requestError) {
      const message =
        requestError.message || t("errors.createTransactionFailed");

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur xl:col-span-4 xl:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.12),transparent_32%)]" />

      <div className="relative space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-300">
            {t("createTransaction.eyebrow")}
          </p>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-white">
              {t("createTransaction.title")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {t("createTransaction.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
              {t("createTransaction.typeLabel")}
            </p>
            <p
              className={`mt-2 text-lg font-semibold ${
                selectedType === "income" ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {selectedType === "income"
                ? t("createTransaction.typeIncome")
                : t("createTransaction.typeExpense")}
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
              {t("createTransaction.statusLabel")}
            </p>
            <p className="mt-2 text-lg font-semibold text-emerald-300">
              {t("createTransaction.statusCompleted")}
            </p>
          </article>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-3xl border px-4 py-4 transition ${
                selectedType === "income"
                  ? "border-emerald-400/40 bg-emerald-400/10"
                  : "border-white/10 bg-slate-950/45 hover:border-emerald-400/20"
              }`}
            >
              <input
                type="radio"
                value="income"
                className="sr-only"
                {...register("type")}
              />
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {t("createTransaction.typeLabel")}
              </span>
              <p className="mt-2 text-lg font-semibold text-white">
                {t("createTransaction.typeIncome")}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {t("createTransaction.typeIncomeHint")}
              </p>
            </label>

            <label
              className={`cursor-pointer rounded-3xl border px-4 py-4 transition ${
                selectedType === "expense"
                  ? "border-rose-400/40 bg-rose-400/10"
                  : "border-white/10 bg-slate-950/45 hover:border-rose-400/20"
              }`}
            >
              <input
                type="radio"
                value="expense"
                className="sr-only"
                {...register("type")}
              />
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {t("createTransaction.typeLabel")}
              </span>
              <p className="mt-2 text-lg font-semibold text-white">
                {t("createTransaction.typeExpense")}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {t("createTransaction.typeExpenseHint")}
              </p>
            </label>
          </div>

          {errors.type && (
            <p className="text-sm text-rose-300">{errors.type.message}</p>
          )}

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-200"
              htmlFor="transaction-name"
            >
              {t("createTransaction.name")}
            </label>
            <input
              id="transaction-name"
              type="text"
              placeholder={t("createTransaction.namePlaceholder")}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-rose-300">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-200"
                htmlFor="transaction-amount"
              >
                {t("createTransaction.amount")}
              </label>
              <input
                id="transaction-amount"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                placeholder={t("createTransaction.amountPlaceholder")}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-sm text-rose-300">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-200"
                htmlFor="transaction-date"
              >
                {t("createTransaction.transactionDate")}
              </label>
              <input
                id="transaction-date"
                type="date"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                {...register("transactionDate")}
              />
              {errors.transactionDate && (
                <p className="text-sm text-rose-300">
                  {errors.transactionDate.message}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading && (
                <ClipLoader size={18} color="#020617" speedMultiplier={0.8} />
              )}
              <span>
                {isLoading
                  ? t("createTransaction.submitting")
                  : t("createTransaction.submit")}
              </span>
            </div>
          </button>
        </form>
      </div>
    </section>
  );
};
