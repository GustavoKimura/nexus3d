import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  Globe,
  Bot,
  UploadCloud,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  Database,
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

function App() {
  const { t, i18n } = useTranslation();

  const [robotName, setRobotName] = useState("");
  const [robotStatus, setRobotStatus] = useState("online");
  const [robotLocation, setRobotLocation] = useState("");
  const [robotId, setRobotId] = useState<number | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "ja" : "en");
  };

  const handleRegisterRobot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/robots", {
        name: robotName,
        status: robotStatus,
        location: robotLocation,
      });
      setRobotId(res.data.id);
      alert(t("success"));
    } catch (error) {
      alert(t("error"));
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

    try {
      const res = await axios.post(
        `http://localhost:8000/scans/process/${robotId}`,
        formData,
      );
      setScanResult(res.data);
      const text = await file.text();
      setFileContent(text);
    } catch (error) {
      alert(t("error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
            <Activity className="text-cyan-400 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
            Nexus3D
          </h1>
        </div>
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full transition-all text-sm font-medium"
        >
          <Globe className="w-4 h-4 text-slate-400" />
          {t("language")}
        </button>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
            >
              <CheckCircle2 className="w-5 h-5" />
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
              className="border-2 border-dashed border-slate-700 bg-slate-950/50 hover:bg-slate-800/80 cursor-pointer rounded-xl p-10 flex flex-col items-center justify-center transition-all group"
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Database className="w-10 h-10 text-slate-500 group-hover:text-cyan-400 mb-4 transition-colors" />
              <p className="text-slate-400 font-medium text-center text-sm">
                {file ? file.name : t("drag_drop")}
              </p>
            </div>

            <button
              onClick={handleProcessScan}
              disabled={uploading || !file}
              className="w-full mt-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Activity className="w-5 h-5 animate-spin" />
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
                  className={`p-4 rounded-xl border flex items-start gap-4 ${scanResult.has_anomaly ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}
                >
                  {scanResult.has_anomaly ? (
                    <AlertCircle className="w-6 h-6 text-red-400 mt-1 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-1 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-200 mb-1">
                      {t("ai_report")}
                    </h3>
                    <p
                      className={`text-sm font-medium ${scanResult.has_anomaly ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {scanResult.ai_report
                        ? scanResult.ai_report
                        : scanResult.has_anomaly
                          ? t("stop") + " — " + t("anomaly")
                          : t("proceed") + " — " + t("no_anomaly")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <span className="block text-xs font-medium text-slate-500 mb-1">
                      {t("valid_points")}
                    </span>
                    <span className="text-lg font-mono text-cyan-400">
                      {scanResult.point_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl truncate">
                    <span className="block text-xs font-medium text-slate-500 mb-1">
                      {t("s3_url")}
                    </span>
                    <a
                      href={scanResult.s3_file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-400 hover:underline truncate block"
                    >
                      View File
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
