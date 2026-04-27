import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { AuthContext } from "../../context/AuthContext.jsx";

const createRegisterSchema = (t) =>
  z.object({
    username: z
      .string()
      .min(3, t("validation.usernameMin"))
      .max(20, t("validation.usernameMax")),
    email: z.email(t("validation.invalidEmail")),
    password: z.string().min(6, t("validation.passwordMin")),
  });

export const Register = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createRegisterSchema(t)),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      setError(null);
      await registerUser(values);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message || t("errors.unexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-slate-900 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_30%)]" />
          <div className="relative flex w-full items-center justify-center px-12 py-14 xl:px-16">
            <div className="flex w-full max-w-3xl flex-col justify-center gap-12 text-center">
              <div className="space-y-6">
                <span className="mx-auto inline-flex w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200">
                  {t("register.badge")}
                </span>
                <div className="space-y-4">
                  <h1 className="mx-auto max-w-md text-4xl font-semibold tracking-tight text-white xl:text-5xl">
                    {t("register.heroTitle")}
                  </h1>
                  <p className="mx-auto max-w-lg text-base leading-7 text-slate-300">
                    {t("register.heroDescription")}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-sm text-slate-400">{t("register.balance")}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">+2,450</p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-sm text-slate-400">{t("register.income")}</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-300">
                    3,900
                  </p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-sm text-slate-400">{t("register.expenses")}</p>
                  <p className="mt-2 text-2xl font-semibold text-rose-300">
                    1,450
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
              <div className="mb-8 space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">
                  {t("register.access")}
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  {t("register.title")}
                </h2>
                <p className="text-sm leading-6 text-slate-400">
                  {t("register.subtitle")}
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-slate-200"
                    htmlFor="username"
                  >
                    {t("register.username")}
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder={t("register.usernamePlaceholder")}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="text-sm text-rose-300">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-slate-200"
                    htmlFor="email"
                  >
                    {t("register.email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t("register.emailPlaceholder")}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-rose-300">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-slate-200"
                    htmlFor="password"
                  >
                    {t("register.password")}
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder={t("register.passwordPlaceholder")}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-rose-300">
                      {errors.password.message}
                    </p>
                  )}
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
                  {isLoading ? t("register.submitting") : t("register.submit")}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                {t("register.haveAccount")}{" "}
                <Link
                  to="/auth/login"
                  className="font-medium text-emerald-300 transition hover:text-emerald-200"
                >
                  {t("register.goToLogin")}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
