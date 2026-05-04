import { apiClient } from "../services/apiClient.js";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

const PAGE_LIMIT = 6;
const TRANSACTION_UPDATED_EVENT = "transactions:updated";

const formatAmount = (value) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getTypeClasses = (type) => {
  if (type === "income") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }

  if (type === "expense") {
    return "border-rose-400/30 bg-rose-400/10 text-rose-200";
  }

  return "border-sky-400/30 bg-sky-400/10 text-sky-200";
};

const getStatusClasses = (status) => {
  if (status === "completed") {
    return "text-emerald-300";
  }

  if (status === "pending") {
    return "text-amber-300";
  }

  if (status === "failed") {
    return "text-rose-300";
  }

  if (status === "canceled") {
    return "text-slate-300";
  }

  if (status === "returned") {
    return "text-sky-300";
  }

  return "text-slate-300";
};

export const Transactions = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    type: "expense",
    name: "",
    amount: "",
    transactionDate: "",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [transactionsData, setTransactionsData] = useState({
    totalTransactions: 0,
    limit: PAGE_LIMIT,
    page: 1,
    totalPages: 1,
    transactions: [],
  });

  const getTransactions = async (currentPage) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: String(PAGE_LIMIT),
        page: String(currentPage),
      });

      const response = await apiClient(`/transactions?${params.toString()}`, {
        method: "GET",
      });
      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.msg || t("errors.getTransactionsFailed"));
      }

      setTransactionsData({
        totalTransactions: res.data?.totalTransactions || 0,
        limit: res.data?.limit || PAGE_LIMIT,
        page: res.data?.page || 1,
        totalPages: res.data?.totalPages || 1,
        transactions: res.data?.transactions || [],
      });
    } catch (requestError) {
      setError(requestError.message || t("errors.unexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTransactions(page);
  }, [page]);

  useEffect(() => {
    const handleTransactionUpdated = () => {
      getTransactions(page);
    };

    window.addEventListener(TRANSACTION_UPDATED_EVENT, handleTransactionUpdated);

    return () => {
      window.removeEventListener(
        TRANSACTION_UPDATED_EVENT,
        handleTransactionUpdated
      );
    };
  }, [page]);

  const hasTransactions = transactionsData.transactions.length > 0;
  const firstItem = hasTransactions
    ? (transactionsData.page - 1) * transactionsData.limit + 1
    : 0;
  const lastItem = hasTransactions
    ? firstItem + transactionsData.transactions.length - 1
    : 0;

  const getTypeLabel = (type) => {
    if (type === "income") return t("transactions.incomeType");
    if (type === "expense") return t("transactions.expenseType");

    return t("transactions.unknownType");
  };

  const getStatusLabel = (status) => {
    if (status === "completed") return t("transactions.statusCompleted");
    if (status === "pending") return t("transactions.statusPending");
    if (status === "failed") return t("transactions.statusFailed");
    if (status === "canceled") return t("transactions.statusCanceled");
    if (status === "returned") return t("transactions.statusReturned");

    return t("transactions.noStatus");
  };

  const startEditing = (transaction) => {
    setEditingId(transaction._id);
    setEditValues({
      type: transaction.type || "expense",
      name: transaction.name || "",
      amount: String(transaction.amount ?? ""),
      transactionDate: transaction.transactionDate
        ? String(transaction.transactionDate).slice(0, 10)
        : "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({
      type: "expense",
      name: "",
      amount: "",
      transactionDate: "",
    });
  };

  const handleEditValueChange = (event) => {
    const { name, value } = event.target;

    setEditValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUpdateTransaction = async (transactionId) => {
    const trimmedName = editValues.name.trim();
    const trimmedDate = editValues.transactionDate.trim();
    const amountValue = Number(editValues.amount);

    if (trimmedName.length < 3 || trimmedName.length > 100) {
      const message =
        trimmedName.length > 100
          ? t("validation.transactionNameMax")
          : t("validation.transactionNameMin");
      setError(message);
      toast.error(message);
      return;
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      const message = t("validation.transactionAmountPositive");
      setError(message);
      toast.error(message);
      return;
    }

    if (!trimmedDate) {
      const message = t("validation.transactionDateRequired");
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setIsSubmittingEdit(true);
      setError(null);

      const response = await apiClient(`/transactions/update/${transactionId}`, {
        method: "PUT",
        body: JSON.stringify({
          type: editValues.type,
          name: trimmedName,
          amount: amountValue,
          transactionDate: trimmedDate,
        }),
      });
      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.msg || t("errors.updateTransactionFailed"));
      }

      toast.success(res.msg || t("transactions.updateSuccess"));
      cancelEditing();
      await getTransactions(page);
      window.dispatchEvent(new Event(TRANSACTION_UPDATED_EVENT));
    } catch (requestError) {
      const message =
        requestError.message || t("errors.updateTransactionFailed");

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const confirmDeleteTransaction = async () => {
    if (!pendingDeleteId) return;

    try {
      setDeletingId(pendingDeleteId);
      setError(null);

      const response = await apiClient(
        `/transactions/delete/${pendingDeleteId}`,
        {
          method: "DELETE",
        }
      );
      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.msg || t("errors.deleteTransactionFailed"));
      }

      toast.success(res.msg || t("transactions.deleteSuccess"));

      const shouldGoBackOnePage =
        transactionsData.transactions.length === 1 && page > 1;

      if (shouldGoBackOnePage) {
        setPage((current) => Math.max(current - 1, 1));
      } else {
        await getTransactions(page);
      }

      window.dispatchEvent(new Event(TRANSACTION_UPDATED_EVENT));
    } catch (requestError) {
      const message =
        requestError.message || t("errors.deleteTransactionFailed");

      setError(message);
      toast.error(message);
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  const chartSummary = hasTransactions ? `${firstItem}-${lastItem}` : "0";

  return (
    <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur xl:col-span-8 xl:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_28%)]" />

      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">
              {t("transactions.eyebrow")}
            </p>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-white">
                {t("transactions.title")}
              </h3>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:pl-6">
            <article className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="wrap-break-word text-[11px] leading-4 uppercase tracking-[0.14em] text-slate-400">
                {t("transactions.total")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {transactionsData.totalTransactions}
              </p>
            </article>
            <article className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="wrap-break-word text-[11px] leading-4 uppercase tracking-[0.14em] text-slate-400">
                {t("transactions.page")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {transactionsData.page}/{transactionsData.totalPages || 1}
              </p>
            </article>
            <article className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:col-span-2 xl:col-span-1">
              <p className="wrap-break-word text-[11px] leading-4 uppercase tracking-[0.14em] text-slate-400">
                {t("transactions.showing")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {chartSummary}
              </p>
            </article>
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
        ) : hasTransactions ? (
          <>
            <div className="grid gap-4">
              {transactionsData.transactions.map((transaction) => (
                <article
                  key={transaction._id}
                  className="relative grid gap-5 rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-5 transition hover:border-emerald-400/30 hover:bg-slate-950/75 lg:grid-cols-[minmax(0,1.55fr)_minmax(220px,0.75fr)]"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                          transaction.type === "expense"
                            ? "bg-rose-400"
                            : "bg-emerald-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${getTypeClasses(transaction.type)}`}
                          >
                            {getTypeLabel(transaction.type)}
                          </span>
                          <span
                            className={`text-xs font-medium uppercase tracking-[0.16em] ${getStatusClasses(transaction.status)}`}
                          >
                            {getStatusLabel(transaction.status)}
                          </span>
                          <button
                            type="button"
                            onClick={() => startEditing(transaction)}
                            disabled={isSubmittingEdit || deletingId === transaction._id}
                            className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-200 transition hover:border-sky-300/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {t("transactions.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(transaction._id)}
                            disabled={deletingId === transaction._id || isSubmittingEdit}
                            className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-rose-200 transition hover:border-rose-300/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === transaction._id
                              ? t("transactions.deleting")
                              : t("transactions.delete")}
                          </button>
                        </div>

                        <div>
                          <h4 className="truncate text-lg font-semibold text-white">
                            {transaction.name || t("transactions.untitled")}
                          </h4>
                          <p className="mt-1 text-sm text-slate-400">
                            {formatDate(transaction.transactionDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                          {t("transactions.statusLabel")}
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-200">
                          {getStatusLabel(transaction.status)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                          {t("transactions.recordDate")}
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          {formatDate(transaction.transactionDate)}
                        </p>
                      </div>
                    </div>

                    {editingId === transaction._id && (
                      <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="block text-[11px] uppercase tracking-[0.18em] text-slate-500">
                              {t("transactions.movementType")}
                            </label>
                            <select
                              name="type"
                              value={editValues.type}
                              onChange={handleEditValueChange}
                              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                            >
                              <option value="income">
                                {t("transactions.incomeType")}
                              </option>
                              <option value="expense">
                                {t("transactions.expenseType")}
                              </option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[11px] uppercase tracking-[0.18em] text-slate-500">
                            {t("createTransaction.name")}
                          </label>
                          <input
                            name="name"
                            type="text"
                            value={editValues.name}
                            onChange={handleEditValueChange}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="block text-[11px] uppercase tracking-[0.18em] text-slate-500">
                              {t("transactions.amount")}
                            </label>
                            <input
                              name="amount"
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={editValues.amount}
                              onChange={handleEditValueChange}
                              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[11px] uppercase tracking-[0.18em] text-slate-500">
                              {t("transactions.recordDate")}
                            </label>
                            <input
                              name="transactionDate"
                              type="date"
                              value={editValues.transactionDate}
                              onChange={handleEditValueChange}
                              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleUpdateTransaction(transaction._id)}
                            disabled={isSubmittingEdit}
                            className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isSubmittingEdit
                              ? t("transactions.saving")
                              : t("transactions.save")}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={isSubmittingEdit}
                            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {t("transactions.cancel")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 self-stretch sm:grid-cols-2 lg:grid-cols-1">
                    <div className="flex items-center">
                      <div className="w-full rounded-3xl border border-white/8 bg-white/3 px-5 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {t("transactions.amount")}
                        </p>
                        <p
                          className={`mt-2 text-2xl font-semibold ${
                            transaction.type === "expense"
                              ? "text-rose-300"
                              : "text-emerald-300"
                          }`}
                        >
                          {transaction.type === "expense" ? "-" : "+"}
                          {formatAmount(transaction.amount).replace(/^-/, "")}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          {transaction.type === "expense"
                            ? t("transactions.outflow")
                            : t("transactions.inflow")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center lg:justify-end">
                      <div className="w-full rounded-3xl border border-white/8 bg-white/3 px-5 py-4 text-left">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {t("transactions.movementType")}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {getTypeLabel(transaction.type)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {pendingDeleteId === transaction._id && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[1.75rem] bg-slate-950/82 p-4 backdrop-blur-sm">
                      <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/40">
                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-rose-300">
                          {t("transactions.delete")}
                        </p>
                        <h4 className="mt-3 text-2xl font-semibold text-white">
                          {t("transactions.deleteTitle")}
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {t("transactions.deleteConfirm")}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={confirmDeleteTransaction}
                            disabled={Boolean(deletingId)}
                            className="rounded-2xl bg-rose-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingId
                              ? t("transactions.deleting")
                              : t("transactions.confirmDelete")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(null)}
                            disabled={Boolean(deletingId)}
                            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {t("transactions.cancel")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                {t("transactions.paginationSummary", {
                  current: transactionsData.page,
                  total: transactionsData.totalPages || 1,
                })}
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  disabled={page <= 1 || isLoading}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("transactions.previous")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(current + 1, transactionsData.totalPages || 1)
                    )
                  }
                  disabled={page >= transactionsData.totalPages || isLoading}
                  className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("transactions.next")}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white">
              {t("transactions.emptyTitle")}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {t("transactions.emptyDescription")}
            </p>
          </div>
        )}
      </div>

    </section>
  );
};
