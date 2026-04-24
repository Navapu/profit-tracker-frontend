import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router";
import BACKEND_URL from "../../config/config.js";
const loginSchema = z.object({
  email: z.email("Email invalido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
});

export const Login = () => {
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
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.msg || "Login failed");
      }

      console.log("Funciono");
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message || "Ha ocurrido un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-slate-900 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_30%)]" />
          <div className="relative flex max-w-xl flex-col justify-between px-12 py-14">
            <div className="space-y-6">
              <span className="inline-flex w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200">
                Profit Tracker
              </span>
              <div className="space-y-4">
                <h1 className="max-w-md text-4xl font-semibold tracking-tight text-white xl:text-5xl">
                  Controla tus finanzas con una vista clara y accionable.
                </h1>
                <p className="max-w-lg text-base leading-7 text-slate-300">
                  Consulta tu balance, analiza tus movimientos y gestiona tus
                  ingresos y gastos desde una sola interfaz.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-sm text-slate-400">Balance</p>
                <p className="mt-2 text-2xl font-semibold text-white">+2,450</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-sm text-slate-400">Ingresos</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-300">
                  3,900
                </p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-sm text-slate-400">Gastos</p>
                <p className="mt-2 text-2xl font-semibold text-rose-300">
                  1,450
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
              <div className="mb-8 space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">
                  Acceso
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Inicia sesion
                </h2>
                <p className="text-sm leading-6 text-slate-400">
                  Entra con tu cuenta para ver tu dashboard y tus
                  transacciones.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-slate-200"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
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
                  <div className="flex items-center justify-between gap-4">
                    <label
                      className="block text-sm font-medium text-slate-200"
                      htmlFor="password"
                    >
                      Contrasena
                    </label>
                    <button
                      type="button"
                      className="text-sm font-medium text-emerald-300 transition hover:text-emerald-200"
                    >
                      Olvide mi contrasena
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
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
                  {isLoading ? "Entrando..." : "Iniciar sesion"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Aun no tienes cuenta?{" "}
                <button
                  type="button"
                  className="font-medium text-emerald-300 transition hover:text-emerald-200"
                >
                  Crear cuenta
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
