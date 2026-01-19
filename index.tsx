
import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard,
  Table as TableIcon,
  FileText,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Filter,
  BarChart3,
  Activity,
  User,
  MoreVertical
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// --- Types & Data Models ---

type ProjectStage = 'Идея' | 'ТЭО' | 'РП' | 'СМР' | 'ПНР' | 'Завершено';
type ProjectType = 'CAPEX' | 'OPEX' | 'HSE' | 'IT';
type RiskLevel = 1 | 2 | 3; // 1: Low, 2: Medium, 3: High
type ProjectStatus = 'On Track' | 'At Risk' | 'Off Track';

interface ProjectData {
  id: string;
  code: string;
  name: string;
  type: ProjectType;
  category: 'Крупный' | 'Средний' | 'Малый';
  stage: ProjectStage;
  customer: string;
  manager: string;
  status: ProjectStatus;
  
  // Dates
  startPlan: string;
  startFact: string;
  endPlan: string;
  endForecast: string;
  
  // Finance (in million units, e.g., KZT)
  bac: number; // Budget at Completion
  eac: number; // Estimate at Completion
  ac: number;  // Actual Cost
  ev: number;  // Earned Value
  
  // Progress %
  progressSMR: number;
  progressPNR: number;
  progressEquip: number;
  
  // Risks
  scheduleRisk: RiskLevel;
  budgetRisk: RiskLevel;
  contractRisk: RiskLevel;
  
  issues: number;
  changeRequests: number;
}

// --- Mock Data Generator ---

const MOCK_PROJECTS: ProjectData[] = [
  {
    id: '1', code: 'PRJ-001', name: 'Модернизация НПЗ Фаза 2', type: 'CAPEX', category: 'Крупный', stage: 'СМР',
    customer: 'Департамент Добычи', manager: 'А. Иванов', status: 'At Risk',
    startPlan: '2023-01-10', startFact: '2023-01-15', endPlan: '2024-12-30', endForecast: '2025-02-15',
    bac: 12500, eac: 13200, ac: 5400, ev: 4800,
    progressSMR: 45, progressPNR: 5, progressEquip: 80,
    scheduleRisk: 3, budgetRisk: 2, contractRisk: 1,
    issues: 12, changeRequests: 4
  },
  {
    id: '2', code: 'PRJ-002', name: 'Внедрение ERP Системы', type: 'IT', category: 'Средний', stage: 'РП',
    customer: 'ИТ Департамент', manager: 'Б. Смагулов', status: 'On Track',
    startPlan: '2023-06-01', startFact: '2023-06-01', endPlan: '2024-06-01', endForecast: '2024-06-15',
    bac: 4500, eac: 4600, ac: 2100, ev: 2200,
    progressSMR: 0, progressPNR: 0, progressEquip: 0,
    scheduleRisk: 1, budgetRisk: 1, contractRisk: 2,
    issues: 3, changeRequests: 1
  },
  {
    id: '3', code: 'PRJ-003', name: 'Строительство ГПЗ', type: 'CAPEX', category: 'Крупный', stage: 'ТЭО',
    customer: 'Газовый блок', manager: 'С. Петров', status: 'Off Track',
    startPlan: '2022-05-10', startFact: '2022-05-10', endPlan: '2026-12-30', endForecast: '2027-08-20',
    bac: 45000, eac: 52000, ac: 8500, ev: 6200,
    progressSMR: 10, progressPNR: 0, progressEquip: 15,
    scheduleRisk: 3, budgetRisk: 3, contractRisk: 2,
    issues: 45, changeRequests: 12
  },
  {
    id: '4', code: 'PRJ-004', name: 'Экологическая очистка полигона', type: 'HSE', category: 'Малый', stage: 'ПНР',
    customer: 'Эко-мониторинг', manager: 'Д. Козлов', status: 'On Track',
    startPlan: '2023-10-01', startFact: '2023-10-05', endPlan: '2024-03-30', endForecast: '2024-03-30',
    bac: 800, eac: 780, ac: 650, ev: 700,
    progressSMR: 95, progressPNR: 40, progressEquip: 100,
    scheduleRisk: 1, budgetRisk: 1, contractRisk: 1,
    issues: 1, changeRequests: 0
  },
  {
    id: '5', code: 'PRJ-005', name: 'Разработка месторождения "Южное"', type: 'CAPEX', category: 'Крупный', stage: 'Идея',
    customer: 'Разведка', manager: 'Е. Беков', status: 'On Track',
    startPlan: '2024-01-01', startFact: '-', endPlan: '2029-12-30', endForecast: '2029-12-30',
    bac: 120000, eac: 120000, ac: 0, ev: 0,
    progressSMR: 0, progressPNR: 0, progressEquip: 0,
    scheduleRisk: 2, budgetRisk: 1, contractRisk: 1,
    issues: 0, changeRequests: 0
  }
];

// --- Utilities ---

const calculateEVM = (p: ProjectData) => {
  const cpi = p.ac === 0 ? 1 : p.ev / p.ac;
  const spi = (p.bac === 0) ? 1 : p.ev / (p.bac * 0.5); // Simulating Planned Value as 50% for mock
  return { cpi, spi };
};

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case 'On Track': return 'text-green-600 bg-green-50 border-green-200';
    case 'At Risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Off Track': return 'text-red-600 bg-red-50 border-red-200';
  }
};

const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case 1: return 'bg-green-500';
    case 2: return 'bg-yellow-500';
    case 3: return 'bg-red-500';
  }
};

// --- Components ---

const StatCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    {subtext && <p className="text-slate-400 text-xs mt-1">{subtext}</p>}
  </div>
);

const App = () => {
  const [view, setView] = useState<'dashboard' | 'registry' | 'detail'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const projectsWithEVM = useMemo(() => MOCK_PROJECTS.map(p => ({
    ...p,
    ...calculateEVM(p)
  })), []);

  const filteredProjects = useMemo(() => 
    projectsWithEVM.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase())),
  [projectsWithEVM, searchQuery]);

  const stats = useMemo(() => {
    const totalBac = projectsWithEVM.reduce((acc, p) => acc + p.bac, 0);
    const avgCpi = projectsWithEVM.reduce((acc, p) => acc + p.cpi, 0) / projectsWithEVM.length;
    const avgSpi = projectsWithEVM.reduce((acc, p) => acc + p.spi, 0) / projectsWithEVM.length;
    const offTrack = projectsWithEVM.filter(p => p.status === 'Off Track').length;
    return { totalBac, avgCpi, avgSpi, offTrack };
  }, [projectsWithEVM]);

  const selectedProject = projectsWithEVM.find(p => p.id === selectedProjectId);

  // --- Renderers ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Portfolio Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Всего проектов" value={projectsWithEVM.length} subtext="Активный портфель" icon={Layers} />
        <StatCard title="Общий бюджет (BAC)" value={`${(stats.totalBac / 1000).toFixed(1)} млрд ₸`} subtext="Суммарный CAPEX/OPEX" icon={DollarSign} trend={4.2} />
        <StatCard title="Средний CPI / SPI" value={`${stats.avgCpi.toFixed(2)} / ${stats.avgSpi.toFixed(2)}`} subtext="Индекс эффективности" icon={TrendingUp} />
        <StatCard title="Критические отклонения" value={stats.offTrack} subtext="Требуют внимания ИК" icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bubble Chart Portfolio View */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Матрица Эффективности Портфеля</h2>
            <div className="text-xs text-slate-400 flex gap-4">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Размер = Бюджет</span>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="spi" name="SPI" unit="" domain={[0.5, 1.5]} label={{ value: 'SPI (Сроки)', position: 'bottom', offset: 0 }} />
                <YAxis type="number" dataKey="cpi" name="CPI" unit="" domain={[0.5, 1.5]} label={{ value: 'CPI (Стоимость)', angle: -90, position: 'insideLeft' }} />
                <ZAxis type="number" dataKey="bac" range={[100, 2000]} name="Budget" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ProjectData & { cpi: number, spi: number };
                    return (
                      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg">
                        <p className="font-bold text-slate-800 mb-1">{data.name}</p>
                        <p className="text-xs text-slate-500">CPI: {data.cpi.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">SPI: {data.spi.toFixed(2)}</p>
                        <p className="text-xs font-semibold text-slate-900 mt-1">BAC: {data.bac} млн ₸</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Scatter data={projectsWithEVM} fill="#8884d8">
                  {projectsWithEVM.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.status === 'Off Track' ? '#ef4444' : entry.status === 'At Risk' ? '#f59e0b' : '#10b981'} 
                      onClick={() => { setSelectedProjectId(entry.id); setView('detail'); }}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Funnel / Stages */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Воронка Проектов</h2>
          <div className="space-y-4">
            {(['Идея', 'ТЭО', 'РП', 'СМР', 'ПНР', 'Завершено'] as ProjectStage[]).map(stage => {
              const count = projectsWithEVM.filter(p => p.stage === stage).length;
              const total = projectsWithEVM.length;
              const width = (count / total) * 100;
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600">{stage}</span>
                    <span className="text-slate-400">{count} проект(ов)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-800 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.max(width, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Топ Рисков Портфеля</h3>
            <div className="space-y-3">
              {projectsWithEVM.filter(p => p.status === 'Off Track').slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                  <AlertTriangle className="text-red-500" size={16} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-red-700">Отклонение BAC: +{(p.eac - p.bac).toLocaleString()} млн ₸</p>
                  </div>
                  <ChevronRight size={14} className="text-red-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRegistry = () => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Поиск по коду или названию..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Filter size={16} /> Фильтры
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
            <Plus size={16} /> Создать проект
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Код / Название</th>
              <th className="px-6 py-4">Статус / Этап</th>
              <th className="px-6 py-4">Бюджет (BAC/EAC)</th>
              <th className="px-6 py-4">Прогресс</th>
              <th className="px-6 py-4">CPI / SPI</th>
              <th className="px-6 py-4">Риски</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProjects.map(p => (
              <tr 
                key={p.id} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => { setSelectedProjectId(p.id); setView('detail'); }}
              >
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 text-sm">{p.code}</div>
                  <div className="text-slate-500 text-xs truncate max-w-[200px]">{p.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border ${getStatusColor(p.status)} mb-1`}>
                    {p.status}
                  </span>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">{p.stage}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{p.bac.toLocaleString()} млн ₸</div>
                  <div className={`text-[10px] ${p.eac > p.bac ? 'text-red-500' : 'text-slate-400'}`}>
                    EAC: {p.eac.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-500">Факт</span>
                      <span className="font-bold text-slate-900">{(p.ev / p.bac * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${p.status === 'Off Track' ? 'bg-red-500' : 'bg-slate-800'}`} 
                        style={{ width: `${(p.ev / p.bac * 100)}%` }} 
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <span className={`text-xs font-bold ${p.cpi < 0.9 ? 'text-red-500' : 'text-slate-700'}`}>C: {p.cpi.toFixed(2)}</span>
                    <span className={`text-xs font-bold ${p.spi < 0.9 ? 'text-red-500' : 'text-slate-700'}`}>S: {p.spi.toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${getRiskColor(p.scheduleRisk)}`} title="Schedule Risk" />
                    <div className={`w-2 h-2 rounded-full ${getRiskColor(p.budgetRisk)}`} title="Budget Risk" />
                    <div className={`w-2 h-2 rounded-full ${getRiskColor(p.contractRisk)}`} title="Contract Risk" />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <MoreVertical size={16} className="text-slate-400 inline cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!selectedProject) return null;
    const p = selectedProject;
    
    // Mock time-series data for the selected project
    const chartData = [
      { month: 'Янв', pv: 100, ev: 90, ac: 110 },
      { month: 'Фев', pv: 250, ev: 220, ac: 260 },
      { month: 'Мар', pv: 450, ev: 410, ac: 480 },
      { month: 'Апр', pv: 600, ev: 550, ac: 650 },
      { month: 'Май', pv: 800, ev: 720, ac: 890 },
    ];

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('registry')}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ChevronRight className="rotate-180" size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{p.name}</h1>
                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(p.status)}`}>
                  {p.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">{p.code} • {p.manager} • {p.customer}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Отчет PDF</button>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">Редактировать</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">Финансовый Статус</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-slate-500">BAC (Бюджет):</span>
                    <span className="text-sm font-bold text-slate-900">{p.bac.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-slate-500">AC (Факт):</span>
                    <span className="text-sm font-bold text-slate-900 text-red-600">{p.ac.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-slate-500">EV (Освоено):</span>
                    <span className="text-sm font-bold text-slate-900 text-green-600">{p.ev.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex justify-between items-end pt-1">
                    <span className="text-xs font-bold text-slate-800">EAC (Прогноз):</span>
                    <span className={`text-sm font-bold ${p.eac > p.bac ? 'text-red-600' : 'text-slate-900'}`}>{p.eac.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">Сроки и Этапы</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-slate-400 mb-1">ТЕКУЩИЙ ЭТАП</p>
                    <p className="text-sm font-bold text-slate-800">{p.stage}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[10px] text-slate-400">ПЛАН ЗАВЕРШЕНИЯ</p>
                      <p className="text-xs font-medium text-slate-700">{p.endPlan}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">ПРОГНОЗ</p>
                      <p className="text-xs font-bold text-red-500">{p.endForecast}</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-[10px] text-slate-400 mb-1">ОТКЛОНЕНИЕ ПО СРОКАМ</p>
                    <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 font-bold rounded-full">~45 дней</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">KPI Эффективности</h3>
                <div className="flex flex-col items-center justify-center h-full pb-4">
                   <div className="flex gap-8">
                     <div className="text-center">
                        <div className={`text-2xl font-black ${p.cpi < 0.9 ? 'text-red-500' : 'text-slate-800'}`}>{p.cpi.toFixed(2)}</div>
                        <div className="text-[10px] font-bold text-slate-400">CPI</div>
                     </div>
                     <div className="text-center">
                        <div className={`text-2xl font-black ${p.spi < 0.9 ? 'text-red-500' : 'text-slate-800'}`}>{p.spi.toFixed(2)}</div>
                        <div className="text-[10px] font-bold text-slate-400">SPI</div>
                     </div>
                   </div>
                   <div className="mt-4 text-center">
                      <p className="text-[10px] text-slate-400">ПРОЦЕСС ОСВОЕНИЯ</p>
                      <div className="text-lg font-bold text-slate-800">{(p.ev / p.bac * 100).toFixed(1)}%</div>
                   </div>
                </div>
              </div>
            </div>

            {/* EVM Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Диаграмма Освоения Бюджета (EVM)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend iconType="circle" />
                    <Area type="monotone" dataKey="pv" name="Плановое освоение (PV)" stroke="#94a3b8" fillOpacity={1} fill="url(#colorPv)" strokeWidth={2} />
                    <Area type="monotone" dataKey="ev" name="Факт. освоение (EV)" stroke="#10b981" fillOpacity={1} fill="url(#colorEv)" strokeWidth={2} />
                    <Line type="monotone" dataKey="ac" name="Факт. затраты (AC)" stroke="#ef4444" strokeWidth={2} dot={true} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar Detail Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Физический Прогресс</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">СМР</span>
                    <span className="font-bold">{p.progressSMR}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-800" style={{ width: `${p.progressSMR}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">ПНР</span>
                    <span className="font-bold">{p.progressPNR}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400" style={{ width: `${p.progressPNR}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Поставка оборуд.</span>
                    <span className="font-bold">{p.progressEquip}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-800" style={{ width: `${p.progressEquip}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Риски и Проблемы</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-slate-400" />
                    <span className="text-xs text-slate-600">Открытых Issues</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">{p.issues}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" />
                    <span className="text-xs text-slate-600">Запросы на изм.</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{p.changeRequests}</span>
                </div>
                
                <div className="pt-2">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-3">Карта рисков (1-3)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className={`h-2 rounded-full mb-1 ${getRiskColor(p.scheduleRisk)}`} />
                      <span className="text-[9px] text-slate-500 uppercase">Сроки</span>
                    </div>
                    <div className="text-center">
                      <div className={`h-2 rounded-full mb-1 ${getRiskColor(p.budgetRisk)}`} />
                      <span className="text-[9px] text-slate-500 uppercase">Бюджет</span>
                    </div>
                    <div className="text-center">
                      <div className={`h-2 rounded-full mb-1 ${getRiskColor(p.contractRisk)}`} />
                      <span className="text-[9px] text-slate-500 uppercase">Контракт</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 p-2 rounded-lg">
              <Activity className="text-white" size={24} />
            </div>
            <span className="font-black tracking-tight text-xl">PMO<span className="text-blue-400">CORE</span></span>
          </div>
          
          <nav className="space-y-2">
            <button 
              onClick={() => setView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutDashboard size={18} /> Портфель
            </button>
            <button 
              onClick={() => setView('registry')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === 'registry' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <TableIcon size={18} /> Реестр проектов
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <AlertTriangle size={18} /> Риски
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <BarChart3 size={18} /> Отчетность
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
              <User size={20} className="text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-bold">Admin PMO</p>
              <p className="text-[10px] text-slate-500">Системный администратор</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {view === 'dashboard' ? 'Единая управленческая сводка' : 
               view === 'registry' ? 'Реестр проектов портфеля' : 
               'Детализация проекта'}
            </h1>
            <p className="text-slate-500 font-medium">
              {view === 'dashboard' ? 'Общий статус и эффективность всех инициатив' : 
               view === 'registry' ? 'Полный список и фильтрация данных' : 
               'Карточка проекта и показатели EVM'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 flex items-center gap-2">
              <Calendar size={16} /> 20 Март 2024
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600">
               <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {view === 'dashboard' && renderDashboard()}
        {view === 'registry' && renderRegistry()}
        {view === 'detail' && renderDetail()}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
