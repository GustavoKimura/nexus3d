import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Globe,
  Bot,
  UploadCloud,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  Database,
  Loader2,
  List,
  Edit2,
  Trash2,
  X,
  Save,
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const { t, i18n } = useTranslation();

  const [robots, setRobots] = useState<Robot[]>([]);
  const [robotName, setRobotName] = useState("");
  const [robotStatus, setRobotStatus] = useState("online");
  const [robotLocation, setRobotLocation] = useState("");
  const [robotId, setRobotId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    status: "",
    location: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
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
    i18n.changeLanguage(i18n.language === "en" ? "ja" : "en");
  };

  const handleRegisterRobot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const res = await axios.post(`${API_URL}/robots`, {
        name: robotName,
        status: robotStatus,
        location: robotLocation,
      });
      setRobotId(res.data.id);
      setRobotName("");
      setRobotStatus("online");
      setRobotLocation("");
      fetchRobots();
      toast.success(t("success"));
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setIsRegistering(false);
    }
  };

  const handleStartEdit = (e: React.MouseEvent, robot: Robot) => {
    e.stopPropagation();
    setEditingId(robot.id);
    setEditForm({
      name: robot.name,
      status: robot.status,
      location: robot.location,
    });
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleSaveEdit = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await axios.put(`${API_URL}/robots/${id}`, editForm);
      toast.success(t("update_success"));
      setEditingId(null);
      fetchRobots();
    } catch (err) {
      toast.error(t("error"));
    }
  };

  const handleDeleteRobot = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm(t("confirm_delete"))) return;
    try {
      await axios.delete(`${API_URL}/robots/${id}`);
      toast.success(t("delete_success"));
      if (robotId === id) {
        setRobotId(null);
        setScanResult(null);
        setFile(null);
        setFileContent(null);
      }
      fetchRobots();
    } catch (err) {
      toast.error(t("error"));
    }
  };

  const handleSelectRobot = (id: number) => {
    if (editingId !== id) {
      setRobotId(id);
    }
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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", i18n.language);

    try {
      const res = await axios.post(
        `${API_URL}/scans/process/${robotId}`,
        formData,
      );
      setScanResult(res.data);
      const text = await file.text();
      setFileContent(text);
      toast.success(t("scan_success"));
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            border: "1px solid #1e293b",
          },
        }}
      />

      <header className="bg-slate-900 border-b border-slate-800 px-8 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
            <Activity className="text-cyan-400 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
            Nexus3D
          </h1>
        </div>

        <div
          onClick={toggleLanguage}
          className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 transition-colors px-5 py-2.5 rounded-full border border-slate-600 shadow-md cursor-pointer group select-none"
        >
          <Globe className="w-4 h-4 text-cyan-400 group-hover:animate-pulse" />
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold transition-colors ${i18n.language === "en" ? "text-cyan-400" : "text-slate-400"}`}
            >
              EN
            </span>
            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-cyan-500/30 ${i18n.language === "ja" ? "bg-cyan-600" : "bg-slate-950"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${i18n.language === "ja" ? "translate-x-6" : "translate-x-1"}`}
              />
            </div>
            <span
              className={`text-xs font-bold transition-colors ${i18n.language === "ja" ? "text-cyan-400" : "text-slate-400"}`}
            >
              JA
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8 flex flex-col">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/20 shrink-0">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="text-cyan-400 w-6 h-6" />
              <h2 className="text-xl font-semibold text-slate-100">
                {t("robot_registration")}
              </h2>
            </div>

            <form onSubmit={handleRegisterRobot} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  {t("name")}
                </label>
                <input
                  type="text"
                  value={robotName}
                  onChange={(e) => setRobotName(e.target.value)}
                  required
                  disabled={isRegistering}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    {t("status")}
                  </label>
                  <button
                    type="button"
                    disabled={isRegistering}
                    onClick={() =>
                      setRobotStatus((prev) =>
                        prev === "online" ? "offline" : "online",
                      )
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      robotStatus === "online"
                        ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-400"
                        : "bg-slate-900/50 border-slate-700 text-slate-400"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${robotStatus === "online" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-slate-500"}`}
                      ></span>
                      {robotStatus === "online" ? t("online") : t("offline")}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                      {t("toggle")}
                    </span>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    {t("location")}
                  </label>
                  <input
                    type="text"
                    value={robotLocation}
                    onChange={(e) => setRobotLocation(e.target.value)}
                    required
                    disabled={isRegistering}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full mt-4 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRegistering ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {t("register")}
              </button>
            </form>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/20 flex-1 flex flex-col min-h-75 max-h-125">
            <div className="flex items-center gap-3 mb-6 shrink-0">
              <List className="text-cyan-400 w-6 h-6" />
              <h2 className="text-xl font-semibold text-slate-100">
                {t("robots_list")}
              </h2>
            </div>

            <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar flex-1">
              {robots.length === 0 ? (
                <div className="text-center text-slate-500 py-10 text-sm">
                  {t("no_robots")}
                </div>
              ) : (
                robots.map((robot) => (
                  <div
                    key={robot.id}
                    onClick={() => handleSelectRobot(robot.id)}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer group overflow-hidden ${
                      robotId === robot.id
                        ? "bg-cyan-950/20 border-cyan-500/50"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
                    }`}
                  >
                    {robotId === robot.id && (
                      <div className="absolute top-0 right-0 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                        {t("selected")}
                      </div>
                    )}

                    {editingId === robot.id ? (
                      <div
                        className="space-y-3 pt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditForm({
                                ...editForm,
                                status:
                                  editForm.status === "online"
                                    ? "offline"
                                    : "online",
                              });
                            }}
                            className={`w-1/2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                              editForm.status === "online"
                                ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-400"
                                : "bg-slate-900 border-slate-700 text-slate-400"
                            } text-sm`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${editForm.status === "online" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-slate-500"}`}
                            ></span>
                            {editForm.status === "online"
                              ? t("online")
                              : t("offline")}
                          </button>
                          <input
                            type="text"
                            value={editForm.location}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                location: e.target.value,
                              })
                            }
                            className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleSaveEdit(e, robot.id)}
                            className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors shadow-lg shadow-cyan-900/20 cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3
                            className={`font-semibold ${robotId === robot.id ? "text-cyan-400" : "text-slate-200"}`}
                          >
                            {robot.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <span
                                className={`w-2 h-2 rounded-full ${robot.status === "online" ? "bg-emerald-500/80" : "bg-slate-500/80"}`}
                              ></span>
                              {robot.status === "online"
                                ? t("online")
                                : robot.status === "offline"
                                  ? t("offline")
                                  : robot.status}
                            </span>
                            <span>•</span>
                            <span>{robot.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleStartEdit(e, robot)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteRobot(e, robot.id)}
                            className="p-2 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-900/50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8 flex flex-col sticky top-28">
          <section
            className={`bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/20 transition-all ${!robotId ? "opacity-40 pointer-events-none grayscale-[0.5]" : ""}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <UploadCloud className="text-cyan-400 w-6 h-6" />
              <h2 className="text-xl font-semibold text-slate-100">
                {t("upload_scan")}
              </h2>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all group cursor-pointer ${file ? "border-cyan-500/50 bg-cyan-950/20" : "border-slate-700 bg-slate-950/50 hover:bg-slate-800/80"}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".xyz,.txt"
              />
              <Database
                className={`w-10 h-10 mb-4 transition-colors ${file ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-400"}`}
              />
              <p
                className={`font-medium text-center text-sm ${file ? "text-cyan-300" : "text-slate-400"}`}
              >
                {file ? file.name : t("drag_drop")}
              </p>

              {!file && (
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg border border-slate-700 transition-colors z-10 shadow-sm cursor-pointer"
                >
                  {t("use_sample")}
                </button>
              )}
            </div>

            <button
              onClick={handleProcessScan}
              disabled={uploading || !file}
              className="w-full mt-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
              {t("process")}
            </button>
          </section>

          {scanResult && (
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-semibold text-slate-100 mb-6">
                {t("results")}
              </h2>

              <div className="space-y-6">
                <div
                  className={`p-5 rounded-xl border flex items-start gap-4 ${scanResult.has_anomaly ? "bg-red-950/30 border-red-500/30" : "bg-emerald-950/30 border-emerald-500/30"}`}
                >
                  {scanResult.has_anomaly ? (
                    <AlertCircle className="w-6 h-6 text-red-400 mt-1 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-1 shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-200">
                        {t("ai_report")}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${scanResult.has_anomaly ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}
                      >
                        {scanResult.has_anomaly ? t("stop") : t("proceed")}
                      </span>
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${scanResult.has_anomaly ? "text-red-300" : "text-emerald-300"}`}
                    >
                      {scanResult.ai_report
                        ? scanResult.ai_report
                        : scanResult.has_anomaly
                          ? t("anomaly")
                          : t("no_anomaly")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="block text-xs font-medium text-slate-500 mb-1">
                      {t("valid_points")}
                    </span>
                    <span className="text-2xl font-mono font-semibold text-cyan-400">
                      {scanResult.point_count.toLocaleString()}
                    </span>
                  </div>
                </div>

                {fileContent && (
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <h3 className="font-semibold text-slate-200 mb-4">
                      {t("visualization_3d")}
                    </h3>
                    <PointCloudViewer data={fileContent} />
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
