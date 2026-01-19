import React from 'react';
import { Project, ProjectTask, ProjectComponent } from '../types';
import { ArrowLeft, Edit, CheckCircle, Clock, AlertCircle, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProjectDetailProps {
  project: Project;
  onEdit: () => void;
  onBack: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onEdit, onBack }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {project.name}
              <span className="text-sm font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{project.code}</span>
            </h1>
            <p className="text-slate-500 text-sm">PM: {project.pm} | Owner: {project.businessOwner}</p>
          </div>
        </div>
        <button 
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
        >
          <Edit size={16} /> Edit Project
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard 
          label="Budget Performance (CPI)" 
          value={project.cpi} 
          subValue={`$${Math.abs(project.costDeviation)}M ${project.costDeviation >= 0 ? 'Under' : 'Over'}`}
          isBad={project.cpi < 0.9} 
        />
        <KPICard 
          label="Schedule Performance (SPI)" 
          value={project.spi} 
          subValue={`${Math.abs(project.scheduleDeviationDays)} Days ${project.scheduleDeviationDays > 0 ? 'Late' : 'Early'}`}
          isBad={project.spi < 0.9} 
        />
        <KPICard 
          label="Physical Progress (SMR)" 
          value={`${project.smrFact}%`} 
          subValue={`Plan: ${project.smrPlan}%`}
          isBad={project.smrFact < project.smrPlan - 10} 
        />
        <KPICard 
          label="Total Budget (EAC)" 
          value={`$${project.eac}M`} 
          subValue={`Baseline: $${project.bac}M`}
          isBad={project.eac > project.bac} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Section: Component Progress */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600"/>
            Detailed Component Progress
          </h3>
          
          {project.components.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={project.components} 
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={150} style={{fontSize: '12px', fontWeight: 500}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="progress" barSize={24} radius={[0, 4, 4, 0]}>
                    {project.components.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.progress === 100 ? '#10b981' : 
                        entry.progress > 50 ? '#3b82f6' : '#6366f1'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
              <p>No tracking components defined.</p>
              <p className="text-sm">Add components in "Edit Project" to visualize sub-tasks.</p>
            </div>
          )}
        </div>

        {/* Side Section: Task Board */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
             <h3 className="font-bold text-slate-800">Project Tasks</h3>
             <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
               {project.tasks.length}
             </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {project.tasks.length > 0 ? (
               project.tasks.map(task => (
                 <TaskItem key={task.id} task={task} />
               ))
             ) : (
                <p className="text-center text-slate-400 mt-10">No active tasks.</p>
             )}
          </div>
        </div>
      </div>
      
      {/* Lower Section: Milestones & Variance */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
         <h3 className="font-bold text-slate-800 mb-4">Milestone Progress Summary</h3>
         <div className="space-y-4">
            <ProgressBar label="Design & Engineering" value={project.designPercent} color="bg-indigo-500" />
            <ProgressBar label="Procurement & Logistics" value={project.equipmentPercent} color="bg-purple-500" />
            <ProgressBar label="Construction & Assembly" value={project.smrFact} color="bg-blue-500" />
            <ProgressBar label="Commissioning & Start-up" value={project.pnrPercent} color="bg-emerald-500" />
         </div>
      </div>
    </div>
  );
};

const KPICard = ({ label, value, subValue, isBad }: any) => (
  <div className={`p-4 rounded-xl border ${isBad ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200'} shadow-sm`}>
    <p className="text-slate-500 text-xs font-bold uppercase">{label}</p>
    <div className="mt-1 flex items-baseline gap-2">
      <span className={`text-2xl font-bold ${isBad ? 'text-red-700' : 'text-slate-900'}`}>{value}</span>
      <span className="text-xs text-slate-500 font-medium">{subValue}</span>
    </div>
  </div>
);

const TaskItem: React.FC<{ task: ProjectTask }> = ({ task }) => {
  const statusColor = task.status === 'Done' ? 'bg-green-100 text-green-700' : task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600';
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:shadow-md transition-shadow bg-white">
       <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${task.status === 'Done' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-300'}`} />
       <div className="flex-1">
         <p className="text-sm font-medium text-slate-900">{task.title}</p>
         <div className="flex justify-between items-center mt-1">
           <span className="text-xs text-slate-500">{task.category}</span>
           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusColor}`}>{task.status}</span>
         </div>
         {task.assignee && <p className="text-xs text-slate-400 mt-1">Assignee: {task.assignee}</p>}
       </div>
    </div>
  );
}

const ProgressBar = ({ label, value, color }: any) => (
  <div className="flex items-center gap-4">
    <div className="w-48 text-sm font-medium text-slate-700">{label}</div>
    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
    </div>
    <div className="w-12 text-sm font-bold text-slate-900 text-right">{value}%</div>
  </div>
);

export default ProjectDetail;
