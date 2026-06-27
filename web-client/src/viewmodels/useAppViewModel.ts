import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { api } from "../services/api";
import type { Robot, ScanResult, TabType } from "../models/types";

export function useAppViewModel() {
  const { t, i18n } = useTranslation();
  const [isInitializing, setIsInitializing] = useState(true);
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

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRobots = async () => {
    try {
      const res = await api.getRobots();
      setRobots(res.data);
    } catch {
      toast.error(t("error"));
    }
  };

  useEffect(() => {
    let isMounted = true;
    const wakeUpBackend = async () => {
      while (isMounted) {
        try {
          const res = await api.getRobots();
          if (isMounted) {
            setRobots(res.data);
            setIsInitializing(false);
            break;
          }
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    };
    wakeUpBackend();
    return () => {
      isMounted = false;
    };
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
        const res = await api.createRobot({
          name: formData.name,
          status: formData.status,
          location: formData.location,
        });
        setRobotId(res.data.id);
        toast.success(t("success"));
      } else {
        await api.updateRobot(formData.id, {
          name: formData.name,
          status: formData.status,
          location: formData.location,
        });
        toast.success(t("update_success"));
        if (formData.status === "offline" && robotId === formData.id) {
          setRobotId(null);
          setScanResult(null);
          setFile(null);
          setFileContent(null);
          setActiveTab("directory");
        }
      }
      setIsModalOpen(false);
      fetchRobots();
    } catch {
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
      await api.deleteRobot(id);
      toast.success(t("delete_success"));
      if (robotId === id) {
        setRobotId(null);
        setScanResult(null);
        setFile(null);
        setFileContent(null);
        setActiveTab("directory");
      }
      fetchRobots();
    } catch {
      toast.error(t("error"));
    }
  };

  const handleSelectRobot = (robot: Robot) => {
    if (robot.status === "offline") {
      toast.error(t("robot_offline_warning"));
      return;
    }
    setRobotId(robot.id);
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
      const response = await fetch(api.getSampleUrl());
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "generated_sample.xyz";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match.length > 1) filename = match[1];
      }
      setFile(new File([blob], filename, { type: "text/plain" }));
      toast.success(t("sample_loaded"));
    } catch {
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
      const res = await api.processScan(robotId, form);
      setScanResult(res.data);
      const text = await file.text();
      setFileContent(text);
      toast.success(t("scan_success"));
      setActiveTab("results");
    } catch {
      toast.error(t("error"));
    } finally {
      setUploading(false);
    }
  };

  const selectedRobotName = robots.find((r) => r.id === robotId)?.name;

  return {
    t,
    i18n,
    isInitializing,
    activeTab,
    setActiveTab,
    robots,
    robotId,
    selectedRobotName,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    formData,
    setFormData,
    isSaving,
    confirmModal,
    setConfirmModal,
    file,
    setFile,
    fileContent,
    uploading,
    scanResult,
    fileInputRef,
    toggleLanguage,
    openAddModal,
    openEditModal,
    handleSaveRobot,
    triggerDeleteRobot,
    handleSelectRobot,
    handleFileDrop,
    handleLoadSample,
    handleProcessScan,
  };
}
