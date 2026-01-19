import React, { useMemo } from 'react';
import { Project } from '../types';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, 
  ReferenceLine, Legend, BarChart, Bar,
  ComposedChart, Line
} from 'recharts';
import { AlertTriangle, TrendingDown, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onProjectClick: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onProjectClick }) => {
  
  // 1. Portfolio KPIs
  const metrics = useMemo(() => {
    const totalBAC = projects.reduce((acc, p) => acc + p.bac, 0);
    const totalEV = projects.reduce((acc, p) => acc + p.ev, 0);
    const totalAC = projects.reduce((acc, p) => acc + p.ac, 0);
    
    // Weighted Average
    const portfolioCPI = totalAC > 0 ? totalEV / totalAC : 0;
    const portfolioSPI = projects.length > 0 ? projects.reduce((acc, p) => acc + p.spi, 0) / projects.length : 0;

    const criticalRisks = projects.filter(p => p.riskSchedule === 3 || p.riskCost === 3).length;
    const delayedProjects = projects.filter(p => p.scheduleDeviationDays > 10).length;

    return { totalBAC, portfolioCPI, portfolioSPI, criticalRisks, delayedProjects };
  }, [projects]);

  // 2. Data Preparation for Bubble Chart
  const bubbleData = useMemo(() => {
    return projects.map(p => ({
      ...p,
      x: p.spi,
      y: p.cpi,
      z: p.bac, // Size bubble by budget
    }));
  }, [projects]);

  // 3. Problem Projects (Level 2 Drilldown)
  const problemProjects = useMemo(() => {
    return [...projects]
      .filter(p => p.cpi < 0.9 || p.spi < 0.9 || p.riskCost === 3)
      .sort((a, b) => a.cpi - b.cpi) // Lowest CPI first
      .slice(0, 5);
  }, [projects]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Portfolio Overview</h1>
          <p className="text-slate-500 text-sm">Real-time EVM analytics and risk assessment</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-white border border-slate-200 rounded text-sm text-slate-600 font-medium">
             Last Updated: {new Date().toLocaleDateString()}
           </span>
        </div>
      </div>

      {/* Level 1: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Budget (BAC)" 
          value={`$${metrics.totalBAC.toLocaleString()}M`} 
          icon={<DollarSign className="text-blue-500" />}
          trend="Portfolio Value"
        />
        <KPICard 
          title="Portfolio CPI" 
          value={metrics.portfolioCPI.toFixed(2)} 
          icon={<Activity className={metrics.portfolioCPI >= 1 ? "text-green-500" : "text-red-500"} />}
          trend={metrics.portfolioCPI < 1 ? "Over Budget" : "Under Budget"}
          isNegative={metrics.portfolioCPI < 1}
        />
        <KPICard 
          title="Schedule Risk" 
          value={`${metrics.delayedProjects} Projects`} 
          icon={<TrendingDown className="text-orange-500" />}
          trend="Delayed > 10 days"
          isNegative={metrics.delayedProjects > 0}
        />
        <KPICard 
          title="Critical Risks" 
          value={metrics.criticalRisks.toString()} 
          icon={<AlertTriangle className="text-red-500" />}
          trend="High Impact/Prob"
          isNegative={metrics.criticalRisks > 0}
        />
      </div>

      {/* Level 2: Main Portfolio Maps */}
      <div className="grid grid-cols-1 gap-6">
        {/* Bubble Chart: Portfolio Health */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Portfolio Health Matrix (EVM)</h3>
            <div className="text-xs text-slate-500 flex gap-4">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Healthy</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical</span>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="SPI" 
                  domain={[0.5, 1.5]} 
                  label={{ value: 'Schedule Performance (SPI)', position: 'bottom', offset: 0 }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="CPI" 
                  domain={[0.5, 1.5]} 
                  label={{ value: 'Cost Performance (CPI)', angle: -90, position: 'insideLeft' }} 
                />
                <ReferenceLine x={1} stroke="#94a3b8" strokeDasharray="3 3" />
                <ReferenceLine y={1} stroke="#94a3b8" strokeDasharray="3 3" />
                <RechartsTooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-800 text-white p-3 rounded shadow-lg text-xs">
                          <p className="font-bold mb-1">{data.code}</p>
                          <p>{data.name}</p>
                          <p className="mt-1 text-slate-300">CPI: {data.cpi} | SPI: {data.spi}</p>
                          <p className="text-slate-300">Budget: ${data.bac}M</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Projects" data={bubbleData} onClick={(p) => onProjectClick(p.id)}>
                  {bubbleData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.cpi < 0.9 || entry.spi < 0.9 ? '#ef4444' : (entry.cpi > 1 && entry.spi > 1 ? '#22c55e' : '#3b82f6')}
                      fillOpacity={0.7}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Level 3: Deep Dive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Physical Progress Chart (NEW) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Physical Progress Breakdown (%)</h3>
          <div className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart 
                layout="vertical"
                data={[...projects].sort((a, b) => b.bac - a.bac).slice(0, 5)}
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
               >
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                 <XAxis type="number" domain={[0, 100]} />
                 <YAxis dataKey="code" type="category" width={80} style={{ fontSize: '12px' }} />
                 <RechartsTooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
                   itemStyle={{ color: '#fff' }}
                 />
                 <Legend wrapperStyle={{ fontSize: '12px' }} />
                 <Bar dataKey="designPercent" name="Design" stackId="a" fill="#6366f1" barSize={20} />
                 <Bar dataKey="equipmentPercent" name="Procurement" stackId="b" fill="#8b5cf6" barSize={20} />
                 <Bar dataKey="smrFact" name="Construction" stackId="c" fill="#3b82f6" barSize={20} />
                 <Bar dataKey="pnrPercent" name="Commissioning" stackId="d" fill="#10b981" barSize={20} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Budget Utilization */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Budget Utilization (Top 5 by BAC)</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                layout="vertical"
                data={[...projects].sort((a,b) => b.bac - a.bac).slice(0, 5)}
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
              >
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="code" type="category" width={80} style={{ fontSize: '12px' }} />
                <RechartsTooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
                   itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="ac" name="Actual Cost" fill="#3b82f6" barSize={12} radius={[0, 4, 4, 0]} />
                <Bar dataKey="ev" name="Earned Value" fill="#10b981" barSize={12} radius={[0, 4, 4, 0]} />
                <Bar dataKey="bac" name="Budget" fill="#cbd5e1" barSize={12} radius={[0, 4, 4, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Level 4: Problem Projects Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            Projects Requiring Attention
          </h3>
          <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All Issues</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Manager</th>
                <th className="px-6 py-4">CPI / SPI</th>
                <th className="px-6 py-4">Variance Cause</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {problemProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No critical projects found. Great job!
                  </td>
                </tr>
              ) : (
                problemProjects.map(project => (
                  <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{project.code}</div>
                      <div className="text-slate-500 text-xs">{project.name}</div>
                    </td>
                    <td className="px-6 py-4">{project.pm}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <Badge value={project.cpi} type="CPI" />
                        <Badge value={project.spi} type="SPI" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                      {project.costReason || "Not specified"}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onProjectClick(project.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// UI Helpers
const KPICard = ({ title, value, icon, trend, isNegative }: any) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className={`text-xs mt-2 font-medium ${isNegative ? 'text-red-600' : 'text-slate-400'}`}>
        {trend}
      </p>
    </div>
    <div className={`p-3 rounded-lg bg-slate-50`}>
      {icon}
    </div>
  </div>
);

const Badge = ({ value, type }: { value: number, type: string }) => {
  const isBad = value < 0.9;
  const isGood = value > 1.05;
  const color = isBad ? 'bg-red-100 text-red-700' : isGood ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>
      {type}: {value.toFixed(2)}
    </span>
  )
}

export default Dashboard;
