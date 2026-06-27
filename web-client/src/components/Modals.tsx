import { X, Loader2, Bot, Save, AlertTriangle } from "lucide-react";

export function RobotModal({ vm }: { vm: any }) {
  if (!vm.isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]">
        <div className="p-5 md:p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            {vm.modalMode === "add" ? vm.t("add_robot") : vm.t("edit_robot")}
          </h2>
          <button
            onClick={() => vm.setIsModalOpen(false)}
            className="p-2 text-slate-500 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form
          onSubmit={vm.handleSaveRobot}
          className="p-5 md:p-6 space-y-5 overflow-y-auto no-scrollbar"
        >
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2">
              {vm.t("name")}
            </label>
            <input
              type="text"
              value={vm.formData.name}
              onChange={(e) =>
                vm.setFormData({ ...vm.formData, name: e.target.value })
              }
              required
              disabled={vm.isSaving}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2">
              {vm.t("status")}
            </label>
            <button
              type="button"
              disabled={vm.isSaving}
              onClick={() =>
                vm.setFormData((prev: any) => ({
                  ...prev,
                  status: prev.status === "online" ? "offline" : "online",
                }))
              }
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${vm.formData.status === "online" ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-400"}`}
            >
              <span className="flex items-center gap-2 font-bold">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${vm.formData.status === "online" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-slate-500"}`}
                ></span>
                {vm.formData.status === "online"
                  ? vm.t("online")
                  : vm.t("offline")}
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider bg-slate-900 px-2 py-1 rounded-md border border-slate-700/50">
                {vm.t("toggle")}
              </span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2">
              {vm.t("location")}
            </label>
            <input
              type="text"
              value={vm.formData.location}
              onChange={(e) =>
                vm.setFormData({ ...vm.formData, location: e.target.value })
              }
              required
              disabled={vm.isSaving}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
            />
          </div>
        </form>
        <div className="p-5 md:p-6 border-t border-slate-800 bg-slate-900/50 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => vm.setIsModalOpen(false)}
            disabled={vm.isSaving}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {vm.t("cancel")}
          </button>
          <button
            type="button"
            onClick={vm.handleSaveRobot}
            disabled={vm.isSaving || !vm.formData.name || !vm.formData.location}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-900/20 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {vm.isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {vm.t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmModal({ vm }: { vm: any }) {
  if (!vm.confirmModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              {vm.confirmModal.title}
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              {vm.confirmModal.message}
            </p>
          </div>
        </div>
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              vm.setConfirmModal((prev: any) => ({ ...prev, isOpen: false }))
            }
            disabled={vm.confirmModal.isLoading}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {vm.t("cancel")}
          </button>
          <button
            type="button"
            onClick={vm.confirmModal.onConfirm}
            disabled={vm.confirmModal.isLoading}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-900/20 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {vm.confirmModal.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            {vm.t("delete_button")}
          </button>
        </div>
      </div>
    </div>
  );
}
