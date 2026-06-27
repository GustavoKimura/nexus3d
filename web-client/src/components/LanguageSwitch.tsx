import { Globe } from "lucide-react";

export function LanguageSwitch({
  language,
  onToggle,
}: {
  language: string;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className="flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 transition-colors px-3 py-2 md:px-5 md:py-2.5 rounded-full border border-slate-600 shadow-md cursor-pointer group select-none"
    >
      <Globe className="w-4 h-4 text-cyan-400 group-hover:animate-pulse" />
      <span
        className={`text-xs font-bold transition-colors ${language === "en" ? "text-cyan-400" : "text-slate-400"}`}
      >
        EN
      </span>
      <div
        className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ring-2 ring-cyan-500/30 ${language === "ja" ? "bg-cyan-600" : "bg-slate-950"}`}
      >
        <span
          className={`inline-block h-3 w-3 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${language === "ja" ? "translate-x-5 md:translate-x-6" : "translate-x-1"}`}
        />
      </div>
      <span
        className={`text-xs font-bold transition-colors ${language === "ja" ? "text-cyan-400" : "text-slate-400"}`}
      >
        JA
      </span>
    </div>
  );
}
