import { Summary } from "../../components/Summary.jsx";
import { Stats } from "../../components/Stats.jsx";
import { Transactions } from "../../components/Transactions.jsx";

export const Dashboard = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_22%)]" />
      <div className="relative mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="grid gap-6 xl:grid-cols-12">
          <Summary />
          <Transactions />
          <Stats />
        </div>
      </div>
    </main>
  );
};
