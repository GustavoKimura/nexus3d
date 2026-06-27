export interface ScanResult {
  id: number;
  robot_id: number;
  point_count: number;
  has_anomaly: boolean;
  ai_report?: string;
  created_at: string;
}

export interface Robot {
  id: number;
  name: string;
  status: string;
  location: string;
}

export type TabType = "directory" | "scanner" | "results";
