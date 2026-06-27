import {
  Plus,
  Database,
  Edit2,
  Trash2,
  Signal,
  MapPin,
  Scan,
  Loader2,
  FileText,
  LayoutDashboard,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import PointCloudViewer from "../components/PointCloudViewer";

export function DirectoryTab({ vm }: { vm: any }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col p-4 md:p-8 transition-opacity duration-300 ${vm.activeTab === "directory" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}
    >
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            {vm.t("directory")}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {vm.t("manage_robots_desc")}
          </p>
        </div>
        <button
          onClick={vm.openAddModal}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-cyan-900/20 cursor-pointer text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{vm.t("add_robot")}</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-0">
        {vm.robots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <Database className="w-16 h-16 opacity-20" />
            <p>{vm.t("no_robots")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vm.robots.map((robot: any) => (
              <div
                key={robot.id}
                onClick={() => vm.handleSelectRobot(robot)}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-3 ${vm.robotId === robot.id ? "bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-900/10" : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"}`}
              >
                {vm.robotId === robot.id && (
                  <div className="absolute top-0 right-0 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                    {vm.t("selected")}
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <h3
                    className={`font-bold text-lg truncate pr-16 ${vm.robotId === robot.id ? "text-cyan-400" : "text-slate-200"}`}
                  >
                    {robot.name}
                  </h3>
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => vm.openEditModal(e, robot)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => vm.triggerDeleteRobot(e, robot.id)}
                      className="p-2 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-2 border-t border-slate-800/50">
                  <span className="flex items-center gap-1.5 font-medium px-2 py-1 bg-slate-950 rounded-md border border-slate-800">
                    <Signal className="w-3 h-3" />
                    <span
                      className={`w-2 h-2 rounded-full ${robot.status === "online" ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" : "bg-slate-600"}`}
                    ></span>
                    {robot.status === "online"
                      ? vm.t("online")
                      : robot.status === "offline"
                        ? vm.t("offline")
                        : robot.status}
                  </span>
                  <span className="flex items-center gap-1 truncate max-w-[50%]">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{robot.location}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ScannerTab({ vm }: { vm: any }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col p-4 md:p-8 transition-opacity duration-300 ${vm.activeTab === "scanner" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}
    >
      {!vm.robotId ? (
        <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 shadow-xl shadow-black/50">
            <Scan className="w-10 h-10 text-cyan-500/50" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">
              {vm.t("select_robot_first")}
            </h2>
            <p className="text-slate-500 leading-relaxed">
              {vm.t("select_robot_desc")}
            </p>
          </div>
          <button
            onClick={() => vm.setActiveTab("directory")}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            {vm.t("go_to_directory")}
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full max-w-2xl mx-auto w-full justify-center">
          <div className="mb-6 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-slate-100">
              {vm.t("scanner")}
            </h2>
            <p className="text-cyan-400 font-medium mt-1">
              [{vm.selectedRobotName}]
            </p>
          </div>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={vm.handleFileDrop}
            onClick={() =>
              !vm.isLoadingSample && vm.fileInputRef.current?.click()
            }
            className={`border-2 border-dashed rounded-3xl p-10 md:p-16 flex flex-col items-center justify-center transition-all group w-full bg-slate-900/30 ${vm.isLoadingSample ? "opacity-50 cursor-not-allowed border-slate-800" : "cursor-pointer"} ${vm.file ? "border-cyan-500/50 bg-cyan-950/10 shadow-[0_0_30px_rgba(6,182,212,0.1)]" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/30"}`}
          >
            <input
              type="file"
              ref={vm.fileInputRef}
              className="hidden"
              onChange={(e) => vm.setFile(e.target.files?.[0] || null)}
              accept=".xyz,.txt"
            />
            <Database
              className={`w-12 h-12 md:w-16 md:h-16 mb-6 transition-colors ${vm.file ? "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "text-slate-600 group-hover:text-cyan-500/70"}`}
            />
            <p
              className={`font-semibold text-center text-sm md:text-base ${vm.file ? "text-cyan-300" : "text-slate-400"}`}
            >
              {vm.file ? vm.file.name : vm.t("drag_drop")}
            </p>
            {!vm.file && (
              <button
                type="button"
                onClick={vm.handleLoadSample}
                disabled={vm.isLoadingSample}
                className="mt-8 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-cyan-400 text-sm font-bold rounded-xl border border-slate-800 transition-colors z-10 shadow-sm cursor-pointer shadow-black/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {vm.isLoadingSample && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {vm.t("use_sample")}
              </button>
            )}
          </div>
          <button
            onClick={vm.handleProcessScan}
            disabled={vm.uploading || !vm.file}
            className="w-full mt-8 bg-linear-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {vm.uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            {vm.t("process")}
          </button>
        </div>
      )}
    </div>
  );
}

export function ResultsTab({ vm }: { vm: any }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col p-4 md:p-8 transition-opacity duration-300 ${vm.activeTab === "results" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}
    >
      {!vm.scanResult || !vm.fileContent ? (
        <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 shadow-xl shadow-black/50">
            <LayoutDashboard className="w-10 h-10 text-slate-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">
              {vm.t("no_results")}
            </h2>
            <p className="text-slate-500 leading-relaxed">
              {vm.t("no_results_desc")}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full gap-4 md:gap-6">
          <h2 className="text-xl font-bold text-slate-100 shrink-0 hidden md:block">
            {vm.t("dashboard")}
          </h2>
          <div className="flex flex-col md:flex-row gap-4 shrink-0">
            <div
              className={`flex-1 p-5 rounded-2xl border flex items-start gap-4 shadow-md ${vm.scanResult.has_anomaly ? "bg-red-950/20 border-red-900/50" : "bg-emerald-950/20 border-emerald-900/50"}`}
            >
              {vm.scanResult.has_anomaly ? (
                <AlertCircle className="w-6 h-6 text-red-500 mt-1 shrink-0" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mt-1 shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-200">
                    {vm.t("ai_report")}
                  </h3>
                  <span
                    className={`px-3 py-1 text-[10px] uppercase font-black tracking-wider rounded-md border ${vm.scanResult.has_anomaly ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}
                  >
                    {vm.scanResult.has_anomaly ? vm.t("stop") : vm.t("proceed")}
                  </span>
                </div>
                <p
                  className={`text-sm leading-relaxed font-medium ${vm.scanResult.has_anomaly ? "text-red-300/80" : "text-emerald-300/80"}`}
                >
                  {vm.scanResult.ai_report ||
                    (vm.scanResult.has_anomaly
                      ? vm.t("anomaly")
                      : vm.t("no_anomaly"))}
                </p>
              </div>
            </div>
            <div className="w-full md:w-48 shrink-0 bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex flex-col justify-center shadow-md">
              <span className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                {vm.t("valid_points")}
              </span>
              <span className="text-2xl font-mono font-bold text-cyan-400">
                {vm.scanResult.point_count.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-400 mb-3 shrink-0">
              {vm.t("visualization_3d")}
            </h3>
            <PointCloudViewer data={vm.fileContent} />
          </div>
        </div>
      )}
    </div>
  );
}
