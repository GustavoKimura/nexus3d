import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Globe,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  Database,
  Loader2,
  Scan,
  LayoutDashboard,
  Plus,
  Trash2,
  X,
  MapPin,
  Signal,
  Edit2,
  Bot,
  Save,
  AlertTriangle,
} from "lucide-react";
import PointCloudViewer from "./components/PointCloudViewer";

interface ScanResult {
  id: number;
  robot_id: number;
  point_count: number;
  has_anomaly: boolean;
  ai_report?: string;
  created_at: string;
}

interface Robot {
  id: number;
  name: string;
  status: string;
  location: string;
}

type TabType = "directory" | "scanner" | "results";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabType>("directory");
  const [robots, setRobots] = useState<Robot[]>([]);
  const [robotId, setRobotId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    status: "online",
    location: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRobots = async () => {
    try {
      const res = await axios.get(`${API_URL}/robots`);
      setRobots(res.data);
    } catch (error) {
      console.error("Failed to fetch robots", error);
    }
  };

  useEffect(() => {
    fetchRobots();
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ja" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ id: 0, name: "", status: "online", location: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, robot: Robot) => {
    e.stopPropagation();
    setModalMode("edit");
    setFormData({
      id: robot.id,
      name: robot.name,
      status: robot.status,
      location: robot.location,
    });
    setIsModalOpen(true);
  };

  const handleSaveRobot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (modalMode === "add") {
        const res = await axios.post(`${API_URL}/robots`, {
          name: formData.name,
          status: formData.status,
          location: formData.location,
        });
        setRobotId(res.data.id);
        toast.success(t("success"));
      } else {
        await axios.put(`${API_URL}/robots/${formData.id}`, {
          name: formData.name,
          status: formData.status,
          location: formData.location,
        });
        toast.success(t("update_success"));
      }
      setIsModalOpen(false);
      fetchRobots();
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setIsSaving(false);
    }
  };

  const triggerDeleteRobot = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: t("delete_robot_title"),
      message: t("confirm_delete"),
      onConfirm: () => executeDeleteRobot(id),
    });
  };

  const executeDeleteRobot = async (id: number) => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    try {
      await axios.delete(`${API_URL}/robots/${id}`);
      toast.success(t("delete_success"));
      if (robotId === id) {
        setRobotId(null);
        setScanResult(null);
        setFile(null);
        setFileContent(null);
        setActiveTab("directory");
      }
      fetchRobots();
    } catch (err) {
      toast.error(t("error"));
    }
  };

  const handleSelectRobot = (id: number) => {
    setRobotId(id);
    setActiveTab("scanner");
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_URL}/sample`);
      if (!response.ok) throw new Error("Sample file not found");
      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "generated_sample.xyz";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      const sampleFile = new File([blob], filename, { type: "text/plain" });
      setFile(sampleFile);
      toast.success(t("sample_loaded"));
    } catch (error) {
      toast.error(t("error"));
    }
  };

  const handleProcessScan = async () => {
    if (!robotId || !file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("language", i18n.language);

    try {
      const res = await axios.post(`${API_URL}/scans/process/${robotId}`, form);
      setScanResult(res.data);
      const text = await file.text();
      setFileContent(text);
      toast.success(t("scan_success"));
      setActiveTab("results");
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setUploading(false);
    }
  };

  const LangSwitch = () => (
    <div
      onClick={toggleLanguage}
      className="flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 transition-colors px-3 py-2 md:px-5 md:py-2.5 rounded-full border border-slate-600 shadow-md cursor-pointer group select-none"
    >
      <Globe className="w-4 h-4 text-cyan-400 group-hover:animate-pulse" />
      <span
        className={`text-xs font-bold transition-colors ${i18n.language === "en" ? "text-cyan-400" : "text-slate-400"}`}
      >
        EN
      </span>
      <div
        className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ring-2 ring-cyan-500/30 ${i18n.language === "ja" ? "bg-cyan-600" : "bg-slate-950"}`}
      >
        <span
          className={`inline-block h-3 w-3 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${i18n.language === "ja" ? "translate-x-5 md:translate-x-6" : "translate-x-1"}`}
        />
      </div>
      <span
        className={`text-xs font-bold transition-colors ${i18n.language === "ja" ? "text-cyan-400" : "text-slate-400"}`}
      >
        JA
      </span>
    </div>
  );

  const selectedRobotName = robots.find((r) => r.id === robotId)?.name;

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
            {t("title")}
          </h1>
        </div>
        <LangSwitch />
      </header>

      <nav className="hidden md:flex flex-col w-64 h-full bg-slate-900 border-r border-slate-800 z-40 shrink-0">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800/50">
          <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20">
            <Activity className="text-cyan-400 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
            {t("title")}
          </h1>
        </div>

        <div className="flex-1 flex flex-col gap-2 p-4">
          <button
            onClick={() => setActiveTab("directory")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === "directory" ? "bg-cyan-950/40 text-cyan-400 border border-cyan-900/50" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"}`}
          >
            <Database className="w-5 h-5" />
            <span className="font-semibold">{t("directory")}</span>
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === "scanner" ? "bg-cyan-950/40 text-cyan-400 border border-cyan-900/50" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"}`}
          >
            <Scan className="w-5 h-5" />
            <span className="font-semibold">{t("scanner")}</span>
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === "results" ? "bg-cyan-950/40 text-cyan-400 border border-cyan-900/50" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-semibold">{t("dashboard")}</span>
          </button>
        </div>

        <div className="p-4 border-t border-slate-800/50 flex justify-center">
          <LangSwitch />
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden bg-slate-950 flex flex-col">
        <div
          className={`absolute inset-0 flex flex-col p-4 md:p-8 transition-opacity duration-300 ${activeTab === "directory" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}
        >
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">
                {t("directory")}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {t("manage_robots_desc")}
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-cyan-900/20 cursor-pointer text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t("add_robot")}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-0">
            {robots.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                <Database className="w-16 h-16 opacity-20" />
                <p>{t("no_robots")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {robots.map((robot) => (
                  <div
                    key={robot.id}
                    onClick={() => handleSelectRobot(robot.id)}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-3 ${robotId === robot.id ? "bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-900/10" : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"}`}
                  >
                    {robotId === robot.id && (
                      <div className="absolute top-0 right-0 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                        {t("selected")}
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <h3
                        className={`font-bold text-lg truncate pr-16 ${robotId === robot.id ? "text-cyan-400" : "text-slate-200"}`}
                      >
                        {robot.name}
                      </h3>
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => openEditModal(e, robot)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => triggerDeleteRobot(e, robot.id)}
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
                          ? t("online")
                          : robot.status === "offline"
                            ? t("offline")
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

        <div
          className={`absolute inset-0 flex flex-col p-4 md:p-8 transition-opacity duration-300 ${activeTab === "scanner" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}
        >
          {!robotId ? (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 shadow-xl shadow-black/50">
                <Scan className="w-10 h-10 text-cyan-500/50" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-200 mb-2">
                  {t("select_robot_first")}
                </h2>
                <p className="text-slate-500 leading-relaxed">
                  {t("select_robot_desc")}
                </p>
              </div>
              <button
                onClick={() => setActiveTab("directory")}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                {t("go_to_directory")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full max-w-2xl mx-auto w-full justify-center">
              <div className="mb-6 flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold text-slate-100">
                  {t("scanner")}
                </h2>
                <p className="text-cyan-400 font-medium mt-1">
                  [{selectedRobotName}]
                </p>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-10 md:p-16 flex flex-col items-center justify-center transition-all group cursor-pointer w-full bg-slate-900/30 ${file ? "border-cyan-500/50 bg-cyan-950/10 shadow-[0_0_30px_rgba(6,182,212,0.1)]" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/30"}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".xyz,.txt"
                />
                <Database
                  className={`w-12 h-12 md:w-16 md:h-16 mb-6 transition-colors ${file ? "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "text-slate-600 group-hover:text-cyan-500/70"}`}
                />
                <p
                  className={`font-semibold text-center text-sm md:text-base ${file ? "text-cyan-300" : "text-slate-400"}`}
                >
                  {file ? file.name : t("drag_drop")}
                </p>
                {!file && (
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="mt-8 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-cyan-400 text-sm font-bold rounded-xl border border-slate-800 transition-colors z-10 shadow-sm cursor-pointer shadow-black/50"
                  >
                    {t("use_sample")}
                  </button>
                )}
              </div>

              <button
                onClick={handleProcessScan}
                disabled={uploading || !file}
                className="w-full mt-8 bg-linear-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                {t("process")}
              </button>
            </div>
          )}
        </div>

        <div
          className={`absolute inset-0 flex flex-col p-4 md:p-8 transition-opacity duration-300 ${activeTab === "results" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}
        >
          {!scanResult || !fileContent ? (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 shadow-xl shadow-black/50">
                <LayoutDashboard className="w-10 h-10 text-slate-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-200 mb-2">
                  {t("no_results")}
                </h2>
                <p className="text-slate-500 leading-relaxed">
                  {t("no_results_desc")}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full gap-4 md:gap-6">
              <h2 className="text-xl font-bold text-slate-100 shrink-0 hidden md:block">
                {t("dashboard")}
              </h2>

              <div className="flex flex-col md:flex-row gap-4 shrink-0">
                <div
                  className={`flex-1 p-5 rounded-2xl border flex items-start gap-4 shadow-md ${scanResult.has_anomaly ? "bg-red-950/20 border-red-900/50" : "bg-emerald-950/20 border-emerald-900/50"}`}
                >
                  {scanResult.has_anomaly ? (
                    <AlertCircle className="w-6 h-6 text-red-500 mt-1 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mt-1 shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-200">
                        {t("ai_report")}
                      </h3>
                      <span
                        className={`px-3 py-1 text-[10px] uppercase font-black tracking-wider rounded-md border ${scanResult.has_anomaly ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}
                      >
                        {scanResult.has_anomaly ? t("stop") : t("proceed")}
                      </span>
                    </div>
                    <p
                      className={`text-sm leading-relaxed font-medium ${scanResult.has_anomaly ? "text-red-300/80" : "text-emerald-300/80"}`}
                    >
                      {scanResult.ai_report ||
                        (scanResult.has_anomaly
                          ? t("anomaly")
                          : t("no_anomaly"))}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-48 shrink-0 bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex flex-col justify-center shadow-md">
                  <span className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                    {t("valid_points")}
                  </span>
                  <span className="text-2xl font-mono font-bold text-cyan-400">
                    {scanResult.point_count.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-h-0 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 shrink-0">
                  {t("visualization_3d")}
                </h3>
                <PointCloudViewer data={fileContent} />
              </div>
            </div>
          )}
        </div>
      </main>

      <nav className="md:hidden h-16 shrink-0 flex items-center justify-around bg-slate-900 border-t border-slate-800 z-40 px-2 pb-safe">
        <button
          onClick={() => setActiveTab("directory")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "directory" ? "text-cyan-400" : "text-slate-500"}`}
        >
          <Database className="w-5 h-5" />
          <span className="text-[10px] font-bold">{t("directory")}</span>
        </button>
        <button
          onClick={() => setActiveTab("scanner")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "scanner" ? "text-cyan-400" : "text-slate-500"}`}
        >
          <Scan className="w-5 h-5" />
          <span className="text-[10px] font-bold">{t("scanner")}</span>
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "results" ? "text-cyan-400" : "text-slate-500"}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">{t("dashboard")}</span>
        </button>
      </nav>

      {/* Main Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]">
            <div className="p-5 md:p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                {modalMode === "add" ? t("add_robot") : t("edit_robot")}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-500 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveRobot}
              className="p-5 md:p-6 space-y-5 overflow-y-auto no-scrollbar"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  {t("name")}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={isSaving}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  {t("status")}
                </label>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: prev.status === "online" ? "offline" : "online",
                    }))
                  }
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${formData.status === "online" ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-400"}`}
                >
                  <span className="flex items-center gap-2 font-bold">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${formData.status === "online" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-slate-500"}`}
                    ></span>
                    {formData.status === "online" ? t("online") : t("offline")}
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider bg-slate-900 px-2 py-1 rounded-md border border-slate-700/50">
                    {t("toggle")}
                  </span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  {t("location")}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                  disabled={isSaving}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
                />
              </div>
            </form>

            <div className="p-5 md:p-6 border-t border-slate-800 bg-slate-900/50 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleSaveRobot}
                disabled={isSaving || !formData.name || !formData.location}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-900/20 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">
                  {confirmModal.title}
                </h2>
                <p className="text-slate-400 mt-2 text-sm">
                  {confirmModal.message}
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-900/20"
              >
                {t("delete_button")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
