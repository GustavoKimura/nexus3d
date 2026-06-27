import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      title: "Nexus3D",
      directory: "Directory",
      scanner: "Scanner",
      dashboard: "Results",
      add_robot: "Add Robot",
      edit_robot: "Edit Robot",
      name: "Robot Name",
      status: "Status",
      location: "Location",
      upload_scan: "Point Cloud Scan Upload",
      drag_drop: "Drag & drop your .xyz file here, or click to browse",
      use_sample: "Use sample file",
      process: "Process Cloud Data",
      ai_report: "AI Technical Report",
      valid_points: "Valid Points",
      success: "Successfully registered!",
      error: "Operation failed.",
      sample_loaded: "Sample file loaded!",
      scan_success: "Scan processed successfully!",
      proceed: "Proceed",
      stop: "Stop",
      anomaly: "Anomaly Detected",
      no_anomaly: "Normal Status",
      visualization_3d: "3D Visualization",
      no_robots: "No robots found. Register one to get started.",
      update_success: "Robot updated successfully!",
      delete_success: "Robot deleted successfully!",
      confirm_delete: "Are you sure you want to delete this robot?",
      delete_robot_title: "Delete Robot",
      delete_button: "Delete",
      online: "Online",
      offline: "Offline",
      toggle: "Toggle",
      save: "Save",
      cancel: "Cancel",
      select_robot_first: "Select a Robot First",
      select_robot_desc:
        "Choose a robot from the directory to begin processing point clouds.",
      go_to_directory: "Go to Directory",
      no_results: "No Results Yet",
      no_results_desc:
        "Process a scan in the Scanner tab to view the AI analysis and 3D visualization.",
      manage_robots_desc: "Manage your active robotic units",
      robot_offline_warning:
        "Cannot select an offline robot. Please wake it up first.",
    },
  },
  ja: {
    translation: {
      title: "Nexus3D",
      directory: "ディレクトリ",
      scanner: "スキャナー",
      dashboard: "結果",
      add_robot: "ロボット追加",
      edit_robot: "ロボット編集",
      name: "ロボット名",
      status: "ステータス",
      location: "場所",
      upload_scan: "点群スキャンアップロード",
      drag_drop: "ここにファイルをドラッグ＆ドロップ、またはクリックして参照",
      use_sample: "サンプルを使用する",
      process: "クラウドデータを処理",
      ai_report: "AI技術レポート",
      valid_points: "有効なポイント",
      success: "登録に成功しました！",
      error: "操作に失敗しました。",
      sample_loaded: "サンプルを読み込みました！",
      scan_success: "スキャンが正常に処理されました！",
      proceed: "進行する",
      stop: "停止",
      anomaly: "異常検出",
      no_anomaly: "正常なステータス",
      visualization_3d: "3D ビジュアライゼーション",
      no_robots: "ロボットが見つかりません。登録してください。",
      update_success: "正常に更新されました！",
      delete_success: "正常に削除されました！",
      confirm_delete: "このロボットを削除してもよろしいですか？",
      delete_robot_title: "ロボットの削除",
      delete_button: "削除",
      online: "オンライン",
      offline: "オフライン",
      toggle: "切替",
      save: "保存",
      cancel: "キャンセル",
      select_robot_first: "ロボットを選択してください",
      select_robot_desc:
        "ディレクトリからロボットを選択して、点群の処理を開始します。",
      go_to_directory: "ディレクトリへ",
      no_results: "結果はまだありません",
      no_results_desc:
        "スキャナータブでスキャンを処理すると、AI分析と3D表示が表示されます。",
      manage_robots_desc: "アクティブなロボットユニットを管理します",
      robot_offline_warning:
        "オフラインのロボットは選択できません。まず起動してください。",
    },
  },
};

const savedLanguage = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
