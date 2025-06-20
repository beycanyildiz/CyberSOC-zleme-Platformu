import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface NetworkNode {
  id: string;
  ip: string;
  status: 'safe' | 'warning' | 'critical';
  location: { x: number; y: number };
  connections: string[];
  name: string;
  responseTime?: number | string;
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  status: string;
}

export interface ThreatStats {
  detected: number;
  blocked: number;
  successRate: number;
}

export interface Vulnerability {
  id: number;
  severity: string;
  title: string;
  description: string;
  affected: string;
  cvss: number;
  published: Date;
  status: string;
}

export const apiService = {
  // System Metrics
  getSystemMetrics: async (): Promise<SystemMetrics> => {
    const response = await api.get('/system-metrics');
    return response.data;
  },

  // Network Status
  getNetworkStatus: async (): Promise<NetworkNode[]> => {
    const response = await api.get('/network-status');
    return response.data;
  },

  // Security Alerts
  getSecurityAlerts: async (): Promise<SecurityAlert[]> => {
    const response = await api.get('/security-alerts');
    return response.data;
  },

  // Threat Statistics
  getThreatStats: async (): Promise<ThreatStats> => {
    const response = await api.get('/threat-stats');
    return response.data;
  },

  // Vulnerabilities
  getVulnerabilities: async (): Promise<Vulnerability[]> => {
    const response = await api.get('/vulnerabilities');
    return response.data;
  },

  // Network Scan
  scanNetwork: async () => {
    const response = await api.post('/scan-network');
    return response.data;
  },

  // Vulnerability Scan
  scanVulnerabilities: async () => {
    const response = await api.post('/scan-vulnerabilities');
    return response.data;
  },

  // Execute Command
  executeCommand: async (command: string) => {
    const response = await api.post('/execute-command', { command });
    return response.data;
  }
};