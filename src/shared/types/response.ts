export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string | undefined;
  database: {
    status: string;
    responseTime?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}
