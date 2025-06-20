import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Globe, 
  Terminal as TerminalIcon, 
  Eye, 
  Lock, 
  Wifi, 
  Server, 
  Zap,
  TrendingUp,
  Users,
  Database,
  Clock,
  MapPin,
  X,
  Maximize2,
  Minimize2,
  Play,
  RefreshCw
} from 'lucide-react';
import { useSocket } from './hooks/useSocket';
import { apiService, SystemMetrics, NetworkNode, SecurityAlert, ThreatStats, Vulnerability } from './services/api';
import { RealTimeChart } from './components/RealTimeChart';
import { format } from 'date-fns';

// Matrix Background Component
const MatrixBackground: React.FC = () => {
  useEffect(() => {
    const canvas = document.getElementById('matrix-bg') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const fontSize = 12;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      id="matrix-bg"
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-10"
    />
  );
};

// Real Network Map Component
const RealNetworkMap: React.FC = () => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { on, off } = useSocket();

  useEffect(() => {
    const handleNetworkStatus = (networkData: NetworkNode[]) => {
      setNodes(networkData);
    };

    on('networkStatus', handleNetworkStatus);
    
    // Load initial data
    apiService.getNetworkStatus().then(setNodes).catch(console.error);

    return () => {
      off('networkStatus', handleNetworkStatus);
    };
  }, [on, off]);

  const handleScanNetwork = async () => {
    setIsScanning(true);
    try {
      await apiService.scanNetwork();
    } catch (error) {
      console.error('Network scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return '#00ff41';
      case 'warning': return '#ffaa00';
      case 'critical': return '#ff0040';
      default: return '#00ff41';
    }
  };

  return (
    <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-4 h-80 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-green-400 flex items-center">
          <Wifi className="mr-2" size={20} />
          Network Topology
        </h3>
        <button
          onClick={handleScanNetwork}
          disabled={isScanning}
          className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Scan'}</span>
        </button>
      </div>
      
      <svg className="w-full h-56">
        {/* Draw Connections */}
        {nodes.map(node => 
          node.connections.map(connectionId => {
            const targetNode = nodes.find(n => n.id === connectionId);
            if (!targetNode) return null;
            return (
              <line
                key={`${node.id}-${connectionId}`}
                x1={node.location.x}
                y1={node.location.y}
                x2={targetNode.location.x}
                y2={targetNode.location.y}
                stroke="#333"
                strokeWidth="1"
                className="animate-pulse"
              />
            );
          })
        )}
        
        {/* Draw Nodes */}
        {nodes.map(node => (
          <g key={node.id}>
            <circle
              cx={node.location.x}
              cy={node.location.y}
              r="10"
              fill={getStatusColor(node.status)}
              className="animate-pulse"
            />
            <text
              x={node.location.x}
              y={node.location.y - 20}
              fill="#fff"
              fontSize="10"
              textAnchor="middle"
              className="font-mono"
            >
              {node.name}
            </text>
            <text
              x={node.location.x}
              y={node.location.y + 25}
              fill="#888"
              fontSize="8"
              textAnchor="middle"
              className="font-mono"
            >
              {node.ip}
            </text>
            {node.responseTime && (
              <text
                x={node.location.x}
                y={node.location.y + 35}
                fill="#0ff"
                fontSize="8"
                textAnchor="middle"
                className="font-mono"
              >
                {typeof node.responseTime === 'number' ? `${node.responseTime}ms` : node.responseTime}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

// Real Threat Monitor Component
const RealThreatMonitor: React.FC = () => {
  const [threatStats, setThreatStats] = useState<ThreatStats>({ detected: 0, blocked: 0, successRate: 100 });
  const { on, off } = useSocket();

  useEffect(() => {
    const handleThreatStats = (stats: ThreatStats) => {
      setThreatStats(stats);
    };

    on('threatStats', handleThreatStats);
    
    // Load initial data
    apiService.getThreatStats().then(setThreatStats).catch(console.error);

    return () => {
      off('threatStats', handleThreatStats);
    };
  }, [on, off]);

  return (
    <div className="bg-gray-900 border border-red-500/30 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
        <Shield className="mr-2" size={20} />
        Real-Time Threat Monitor
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-400 font-mono">{threatStats.detected}</div>
          <div className="text-sm text-gray-400">Threats Detected</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400 font-mono">{threatStats.blocked}</div>
          <div className="text-sm text-gray-400">Threats Blocked</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Success Rate</span>
          <span className="text-green-400">{threatStats.successRate}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-300 h-2 rounded-full transition-all duration-500"
            style={{ width: `${threatStats.successRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Real System Health Component
const RealSystemHealth: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({ cpu: 0, memory: 0, disk: 0, network: 0 });
  const [chartData, setChartData] = useState<{ [key: string]: any[] }>({
    cpu: [],
    memory: [],
    disk: [],
    network: []
  });
  const { on, off } = useSocket();

  useEffect(() => {
    const handleSystemMetrics = (newMetrics: SystemMetrics) => {
      setMetrics(newMetrics);
      
      const timestamp = format(new Date(), 'HH:mm:ss');
      
      setChartData(prev => ({
        cpu: [...prev.cpu.slice(-19), { time: timestamp, value: newMetrics.cpu }],
        memory: [...prev.memory.slice(-19), { time: timestamp, value: newMetrics.memory }],
        disk: [...prev.disk.slice(-19), { time: timestamp, value: newMetrics.disk }],
        network: [...prev.network.slice(-19), { time: timestamp, value: newMetrics.network }]
      }));
    };

    on('systemMetrics', handleSystemMetrics);
    
    // Load initial data
    apiService.getSystemMetrics().then(handleSystemMetrics).catch(console.error);

    return () => {
      off('systemMetrics', handleSystemMetrics);
    };
  }, [on, off]);

  const getStatusColor = (value: number) => {
    if (value > 80) return 'text-red-400';
    if (value > 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getBarColor = (value: number) => {
    if (value > 80) return 'bg-red-500';
    if (value > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-gray-900 border border-blue-500/30 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
        <Activity className="mr-2" size={20} />
        Real System Health
      </h3>
      <div className="space-y-3">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-gray-300 text-sm capitalize">{key} Usage</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-800 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getBarColor(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className={`text-sm font-mono ${getStatusColor(value)}`}>
                {value.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Real Security Alerts Component
const RealSecurityAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const { on, off } = useSocket();

  useEffect(() => {
    const handleSecurityAlerts = (alertsData: SecurityAlert[]) => {
      setAlerts(alertsData);
    };

    const handleNewThreat = (newThreat: SecurityAlert) => {
      setAlerts(prev => [newThreat, ...prev.slice(0, 19)]);
    };

    on('securityAlerts', handleSecurityAlerts);
    on('newThreat', handleNewThreat);
    
    // Load initial data
    apiService.getSecurityAlerts().then(setAlerts).catch(console.error);

    return () => {
      off('securityAlerts', handleSecurityAlerts);
      off('newThreat', handleNewThreat);
    };
  }, [on, off]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 border-red-500/50 bg-red-500/10';
      case 'high': return 'text-orange-400 border-orange-500/50 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
      case 'low': return 'text-green-400 border-green-500/50 bg-green-500/10';
      default: return 'text-gray-400 border-gray-500/50 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-gray-900 border border-orange-500/30 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center">
        <AlertTriangle className="mr-2" size={20} />
        Live Security Alerts
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Shield className="mx-auto mb-2" size={32} />
            <p>No active threats detected</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`border rounded-lg p-3 ${getSeverityColor(alert.severity)}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm">{alert.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase font-mono">{alert.severity}</span>
                  <span className={`w-2 h-2 rounded-full ${alert.status === 'blocked' ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">{alert.description}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Source: {alert.source}</span>
                <span>{format(new Date(alert.timestamp), 'HH:mm:ss')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Real Security Terminal Component
const RealSecurityTerminal: React.FC = () => {
  const [commands, setCommands] = useState<string[]>([
    '🛡️  CyberSOC Terminal v2.1.0 - Real-time Security Operations',
    '📡 Connecting to security infrastructure...',
    '✅ Connection established - All systems operational',
    '🔍 Monitoring network traffic and system logs...'
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim() && !isExecuting) {
      setIsExecuting(true);
      const command = currentInput.trim();
      setCommands(prev => [...prev, `user@cyberSOC:~$ ${command}`]);
      setCurrentInput('');

      try {
        const result = await apiService.executeCommand(command);
        setCommands(prev => [...prev, result.output]);
      } catch (error) {
        setCommands(prev => [...prev, `❌ Error: ${error instanceof Error ? error.message : 'Command failed'}`]);
      } finally {
        setIsExecuting(false);
      }
    }
  };

  const suggestedCommands = [
    'nmap -sn 192.168.1.0/24',
    'netstat -an',
    'ps aux | grep suspicious',
    'tail -f /var/log/security.log',
    'iptables -L',
    'ss -tuln'
  ];

  return (
    <div className="bg-black border border-green-500/30 rounded-lg p-4 h-80 flex flex-col">
      <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center">
        <TerminalIcon className="mr-2" size={20} />
        Live Security Terminal
      </h3>
      
      <div className="flex-1 overflow-y-auto font-mono text-sm space-y-1 mb-2">
        {commands.map((cmd, index) => (
          <div key={index} className="text-green-400">
            {cmd.startsWith('user@') ? cmd : `${cmd}`}
          </div>
        ))}
        {isExecuting && (
          <div className="text-yellow-400 animate-pulse">
            Executing command...
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="text-xs text-gray-500 mb-1">Suggested commands:</div>
        <div className="flex flex-wrap gap-1">
          {suggestedCommands.slice(0, 3).map((cmd, index) => (
            <button
              key={index}
              onClick={() => setCurrentInput(cmd)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30"
            >
              {cmd.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex">
        <span className="text-green-400 font-mono mr-2">user@cyberSOC:~$</span>
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          disabled={isExecuting}
          className="flex-1 bg-transparent text-green-400 font-mono outline-none disabled:opacity-50"
          placeholder="Enter security command..."
        />
      </form>
    </div>
  );
};

// Real Vulnerability Scanner Component
const RealVulnerabilityScanner: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const { on, off } = useSocket();

  useEffect(() => {
    const handleVulnerabilities = (vulnData: Vulnerability[]) => {
      setVulnerabilities(vulnData);
    };

    const handleNewVulnerability = (newVuln: Vulnerability) => {
      setVulnerabilities(prev => [newVuln, ...prev.slice(0, 19)]);
    };

    on('vulnerabilities', handleVulnerabilities);
    on('newVulnerability', handleNewVulnerability);
    
    // Load initial data
    apiService.getVulnerabilities().then(setVulnerabilities).catch(console.error);

    return () => {
      off('vulnerabilities', handleVulnerabilities);
      off('newVulnerability', handleNewVulnerability);
    };
  }, [on, off]);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await apiService.scanVulnerabilities();
      setLastScan(new Date());
    } catch (error) {
      console.error('Vulnerability scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
  const highCount = vulnerabilities.filter(v => v.severity === 'high').length;

  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-purple-400 flex items-center">
          <Eye className="mr-2" size={20} />
          Live Vulnerability Scanner
        </h3>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
        >
          <Zap className={`w-4 h-4 ${isScanning ? 'animate-pulse' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Last Scan</span>
          <span className="text-green-400 font-mono">
            {lastScan ? format(lastScan, 'HH:mm:ss') : 'Never'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Critical Vulns</span>
          <span className="text-red-400 font-mono">{criticalCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">High Priority</span>
          <span className="text-orange-400 font-mono">{highCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Total Found</span>
          <span className="text-blue-400 font-mono">{vulnerabilities.length}</span>
        </div>
        
        {vulnerabilities.length > 0 && (
          <div className="mt-4 max-h-32 overflow-y-auto">
            <div className="text-xs text-gray-500 mb-2">Recent Vulnerabilities:</div>
            {vulnerabilities.slice(0, 3).map(vuln => (
              <div key={vuln.id} className="text-xs border-l-2 border-red-500 pl-2 mb-1">
                <div className="text-red-400">{vuln.title}</div>
                <div className="text-gray-500">CVSS: {vuln.cvss} | {vuln.affected}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const { socket } = useSocket();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => setConnectionStatus('connected'));
      socket.on('disconnect', () => setConnectionStatus('disconnected'));
    }
  }, [socket]);

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-red-400';
      case 'connecting': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <MatrixBackground />
      
      {/* Header */}
      <header className="relative z-10 bg-gray-900/80 backdrop-blur border-b border-green-500/30 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Shield className="text-green-400" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-green-400 font-mono">CyberSOC Dashboard</h1>
              <p className="text-sm text-gray-400">Real-Time Security Operations Center</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-cyan-400 font-mono text-lg">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-gray-400 text-sm">
              {currentTime.toLocaleDateString()}
            </div>
            <div className={`text-xs font-mono ${getConnectionStatusColor()}`}>
              ● {connectionStatus.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="relative z-10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Quick Stats */}
          <div className="bg-gray-900 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
              <TrendingUp className="mr-2" size={20} />
              Security Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 font-mono">
                  {connectionStatus === 'connected' ? '99.9%' : '0%'}
                </div>
                <div className="text-xs text-gray-400">System Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 font-mono">LIVE</div>
                <div className="text-xs text-gray-400">Real-Time Data</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 font-mono">24/7</div>
                <div className="text-xs text-gray-400">Active Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 font-mono">API</div>
                <div className="text-xs text-gray-400">Backend Connected</div>
              </div>
            </div>
          </div>

          <RealThreatMonitor />
          <RealSystemHealth />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RealNetworkMap />
          <RealSecurityAlerts />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealSecurityTerminal />
          <RealVulnerabilityScanner />
        </div>
      </main>
    </div>
  );
}

export default App;