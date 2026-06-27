import axios from "axios";
import type { Robot, ScanResult } from "../models/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = {
  getRobots: () => axios.get<Robot[]>(`${API_URL}/robots`),
  createRobot: (data: Partial<Robot>) =>
    axios.post<Robot>(`${API_URL}/robots`, data),
  updateRobot: (id: number, data: Partial<Robot>) =>
    axios.put<Robot>(`${API_URL}/robots/${id}`, data),
  deleteRobot: (id: number) => axios.delete(`${API_URL}/robots/${id}`),
  processScan: (robotId: number, form: FormData) =>
    axios.post<ScanResult>(`${API_URL}/scans/process/${robotId}`, form),
  getSampleUrl: () => `${API_URL}/sample`,
};
