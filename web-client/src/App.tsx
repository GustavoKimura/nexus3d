import React, { useState, useRef } from "react";
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
} from "lucide-react";
import PointCloudViewer from "./components/PointCloudViewer";

interface ScanResult {
  id: number;
  robot_id: number;
  point_count: number;
  has_anomaly: boolean;
  s3_file_url: string;
  ai_report?: string;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const { t, i18n } = useTranslation();

  const [robotName, setRobotName] = useState("");
  const [robotStatus, setRobotStatus] = useState("online");
  const [robotLocation, setRobotLocation] = useState("");
  const [robotId, setRobotId] = useState<number | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      toast.success(t("success"));
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setIsRegistering(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
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

        <div className="flex items-center gap-4 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
          <Globe className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold transition-colors ${i18n.language === "en" ? "text-cyan-400" : "text-slate-500"}`}
            >
              EN
            </span>
            <button
              type="button"
              onClick={toggleLanguage}
              className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-900 border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-cyan-400 transition-transform ${i18n.language === "ja" ? "translate-x-5" : "translate-x-1"}`}
              />
            </button>
            <span
              className={`text-xs font-bold transition-colors ${i18n.language === "ja" ? "text-cyan-400" : "text-slate-500"}`}
            >
              JA
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/20 h-fit">
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
                <input
                  type="text"
                  value={robotStatus}
                  onChange={(e) => setRobotStatus(e.target.value)}
                  required
                  disabled={isRegistering}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
                />
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
              className="w-full mt-4 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
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

        <div className="space-y-8">
          <section
            className={`bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/20 transition-all ${!robotId ? "opacity-50 pointer-events-none" : ""}`}
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
            </div>

            <button
              onClick={handleProcessScan}
              disabled={uploading || !file}
              className="w-full mt-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-center">
                    <span className="block text-xs font-medium text-slate-500 mb-1">
                      {t("valid_points")}
                    </span>
                    <span className="text-xl font-mono font-semibold text-cyan-400">
                      {scanResult.point_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-center truncate">
                    <span className="block text-xs font-medium text-slate-500 mb-1">
                      {t("s3_url")}
                    </span>
                    <a
                      href={scanResult.s3_file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline truncate block transition-colors"
                    >
                      {t("view_file")}
                    </a>
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
