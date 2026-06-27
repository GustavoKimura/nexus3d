import { Toaster } from "react-hot-toast";
import { Activity, Database, Scan, LayoutDashboard } from "lucide-react";
import { useAppViewModel } from "./viewmodels/useAppViewModel";
import { LanguageSwitch } from "./components/LanguageSwitch";
import { RobotModal, ConfirmModal } from "./components/Modals";
import { DirectoryTab, ScannerTab, ResultsTab } from "./views/Tabs";

function App() {
  const vm = useAppViewModel();

  return (
    <div className="h-dvh w-dvw bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-hidden font-sans selection:bg-cyan-500 selection:text-white">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            border: "1px solid #1e293b",
          },
        }}
      />

      <header className="md:hidden h-16 shrink-0 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500/10 p-1.5 rounded-lg border border-cyan-500/20">
            <Activity className="text-cyan-400 w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
            {vm.t("title")}
          </h1>
        </div>
        <LanguageSwitch
          language={vm.i18n.language}
          onToggle={vm.toggleLanguage}
        />
      </header>

      <nav className="hidden md:flex flex-col w-64 h-full bg-slate-900 border-r border-slate-800 z-40 shrink-0">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800/50">
          <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20">
            <Activity className="text-cyan-400 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
            {vm.t("title")}
          </h1>
        </div>
        <div className="flex-1 flex flex-col gap-2 p-4">
          <button
            onClick={() => vm.setActiveTab("directory")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${vm.activeTab === "directory" ? "bg-cyan-950/40 text-cyan-400 border border-cyan-900/50" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"}`}
          >
            <Database className="w-5 h-5" />
            <span className="font-semibold">{vm.t("directory")}</span>
          </button>
          <button
            onClick={() => vm.setActiveTab("scanner")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${vm.activeTab === "scanner" ? "bg-cyan-950/40 text-cyan-400 border border-cyan-900/50" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"}`}
          >
            <Scan className="w-5 h-5" />
            <span className="font-semibold">{vm.t("scanner")}</span>
          </button>
          <button
            onClick={() => vm.setActiveTab("results")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${vm.activeTab === "results" ? "bg-cyan-950/40 text-cyan-400 border border-cyan-900/50" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-semibold">{vm.t("dashboard")}</span>
          </button>
        </div>
        <div className="p-4 border-t border-slate-800/50 flex justify-center">
          <LanguageSwitch
            language={vm.i18n.language}
            onToggle={vm.toggleLanguage}
          />
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden bg-slate-950 flex flex-col">
        <DirectoryTab vm={vm} />
        <ScannerTab vm={vm} />
        <ResultsTab vm={vm} />
      </main>

      <nav className="md:hidden h-16 shrink-0 flex items-center justify-around bg-slate-900 border-t border-slate-800 z-40 px-2 pb-safe">
        <button
          onClick={() => vm.setActiveTab("directory")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${vm.activeTab === "directory" ? "text-cyan-400" : "text-slate-500"}`}
        >
          <Database className="w-5 h-5" />
          <span className="text-[10px] font-bold">{vm.t("directory")}</span>
        </button>
        <button
          onClick={() => vm.setActiveTab("scanner")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${vm.activeTab === "scanner" ? "text-cyan-400" : "text-slate-500"}`}
        >
          <Scan className="w-5 h-5" />
          <span className="text-[10px] font-bold">{vm.t("scanner")}</span>
        </button>
        <button
          onClick={() => vm.setActiveTab("results")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${vm.activeTab === "results" ? "text-cyan-400" : "text-slate-500"}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">{vm.t("dashboard")}</span>
        </button>
      </nav>

      <RobotModal vm={vm} />
      <ConfirmModal vm={vm} />
    </div>
  );
}

export default App;
