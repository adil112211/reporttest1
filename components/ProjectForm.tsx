import React, { useState, useEffect } from 'react';
import { Project, ProjectTask, ProjectComponent } from '../types';
import { Save, X, Plus, Trash2 } from 'lucide-react';

interface ProjectFormProps {
  initialData?: Project;
  onSave: (project: Project) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    type: 'CAPEX',
    category: 'Medium',
    stage: 'Idea',
    riskSchedule: 1,
    riskCost: 1,
    riskContract: 1,
    isCriticalPath: false,
    bac: 0,
    eac: 0,
    pv: 0,
    ev: 0,
    ac: 0,
    designPercent: 0,
    smrFact: 0,
    equipmentPercent: 0,
    pnrPercent: 0,
    components: [],
    tasks: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof Project, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate EVM indices
      if (['ev', 'ac', 'pv'].includes(field)) {
         const ev = Number(updated.ev || 0);
         const ac = Number(updated.ac || 0);
         const pv = Number(updated.pv || 0);
         updated.cpi = ac > 0 ? Number((ev / ac).toFixed(2)) : 0;
         updated.spi = pv > 0 ? Number((ev / pv).toFixed(2)) : 0;
         updated.costDeviation = (Number(updated.bac || 0)) - (Number(updated.eac || 0));
      }

      return updated;
    });
  };

  const handleAddComponent = () => {
    const newComp: ProjectComponent = { id: Date.now().toString(), name: 'New Component', type: 'Construction', progress: 0 };
    setFormData(prev => ({ ...prev, components: [...(prev.components || []), newComp] }));
  };

  const updateComponent = (id: string, field: keyof ProjectComponent, val: any) => {
     setFormData(prev => ({
       ...prev,
       components: prev.components?.map(c => c.id === id ? { ...c, [field]: val } : c)
     }));
  };

  const deleteComponent = (id: string) => {
     setFormData(prev => ({ ...prev, components: prev.components?.filter(c => c.id !== id) }));
  };

  const handleAddTask = () => {
    const newTask: ProjectTask = { id: Date.now().toString(), title: 'New Task', category: 'General', status: 'Pending' };
    setFormData(prev => ({ ...prev, tasks: [...(prev.tasks || []), newTask] }));
  };

  const updateTask = (id: string, field: keyof ProjectTask, val: any) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks?.map(t => t.id === id ? { ...t, [field]: val } : t)
    }));
  };

  const deleteTask = (id: string) => {
    setFormData(prev => ({ ...prev, tasks: prev.tasks?.filter(t => t.id !== id) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) return alert('Code and Name are required');
    onSave(formData as Project);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-5xl mx-auto">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? `Edit Project: ${initialData.code}` : 'New Project Entry'}
          </h2>
          <p className="text-sm text-slate-500">Fill in all mandatory fields to generate PMO analytics.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-2">
            <X size={18} /> Cancel
          </button>
          <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm">
            <Save size={18} /> Save Project
          </button>
        </div>
      </div>

      <div className="p-8 space-y-10">
        
        {/* Section 1: Passport */}
        <Section title="1. Project Passport">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input label="Project Code *" value={formData.code} onChange={(v: any) => handleChange('code', v)} placeholder="e.g. CAPEX-24-001" />
            <Input label="Project Name *" value={formData.name} onChange={(v: any) => handleChange('name', v)} className="md:col-span-2" />
            
            <Select label="Type" value={formData.type} onChange={(v: any) => handleChange('type', v)}>
              <option value="CAPEX">CAPEX</option>
              <option value="OPEX">OPEX</option>
              <option value="IT">IT</option>
              <option value="HSE">HSE</option>
            </Select>

            <Select label="Category" value={formData.category} onChange={(v: any) => handleChange('category', v)}>
              <option value="Large">Large</option>
              <option value="Medium">Medium</option>
              <option value="Small">Small</option>
            </Select>

            <Select label="Stage" value={formData.stage} onChange={(v: any) => handleChange('stage', v)}>
              <option value="Idea">Idea</option>
              <option value="Feasibility">Feasibility</option>
              <option value="Planning">Planning</option>
              <option value="Execution">Execution</option>
              <option value="Commissioning">Commissioning</option>
              <option value="Closed">Closed</option>
            </Select>

            <Input label="Project Manager" value={formData.pm} onChange={(v: any) => handleChange('pm', v)} />
            <Input label="Business Owner" value={formData.businessOwner} onChange={(v: any) => handleChange('businessOwner', v)} />
          </div>
        </Section>

        {/* Section 2: Financials & EVM */}
        <Section title="2. Financials & EVM (Millions)">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
            <Input type="number" label="BAC (Budget)" value={formData.bac} onChange={(v: any) => handleChange('bac', Number(v))} />
            <Input type="number" label="EAC (Forecast)" value={formData.eac} onChange={(v: any) => handleChange('eac', Number(v))} />
            <Input type="number" label="PV (Planned Value)" value={formData.pv} onChange={(v: any) => handleChange('pv', Number(v))} />
            <Input type="number" label="EV (Earned Value)" value={formData.ev} onChange={(v: any) => handleChange('ev', Number(v))} />
            <Input type="number" label="AC (Actual Cost)" value={formData.ac} onChange={(v: any) => handleChange('ac', Number(v))} />
            
            {/* Computed Read-only */}
            <div className="md:col-span-1">
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Calculated CPI</label>
               <div className={`text-xl font-bold ${Number(formData.cpi) < 1 ? 'text-red-600' : 'text-green-600'}`}>{formData.cpi || '-'}</div>
            </div>
             <div className="md:col-span-1">
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Calculated SPI</label>
               <div className={`text-xl font-bold ${Number(formData.spi) < 1 ? 'text-red-600' : 'text-green-600'}`}>{formData.spi || '-'}</div>
            </div>
          </div>
        </Section>

        {/* Section 3: Sub-Component Tracking */}
        <Section title="3. Sub-Component Tracking (Visual Dashboard)">
           <div className="space-y-3">
             {formData.components?.map((comp, idx) => (
               <div key={comp.id} className="flex gap-4 items-end bg-slate-50 p-3 rounded-lg border border-slate-200">
                 <Input className="flex-1" label="Component Name" value={comp.name} onChange={(v: any) => updateComponent(comp.id, 'name', v)} />
                 <Select className="w-40" label="Type" value={comp.type} onChange={(v: any) => updateComponent(comp.id, 'type', v)}>
                    <option value="Construction">Construction</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Design">Design</option>
                 </Select>
                 <Input className="w-24" type="number" label="Progress %" value={comp.progress} onChange={(v: any) => updateComponent(comp.id, 'progress', Number(v))} />
                 <button type="button" onClick={() => deleteComponent(comp.id)} className="mb-1 p-2 text-red-500 hover:bg-red-50 rounded">
                   <Trash2 size={18} />
                 </button>
               </div>
             ))}
             <button type="button" onClick={handleAddComponent} className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700">
                <Plus size={16} /> Add Sub-Component
             </button>
           </div>
        </Section>

        {/* Section 4: Task Management */}
        <Section title="4. Task Management">
           <div className="space-y-3">
             {formData.tasks?.map((task, idx) => (
               <div key={task.id} className="flex gap-4 items-end bg-slate-50 p-3 rounded-lg border border-slate-200">
                 <Input className="flex-1" label="Task Title" value={task.title} onChange={(v: any) => updateTask(task.id, 'title', v)} />
                 <Input className="w-40" label="Category" value={task.category} onChange={(v: any) => updateTask(task.id, 'category', v)} />
                 <Input className="w-40" label="Assignee" value={task.assignee} onChange={(v: any) => updateTask(task.id, 'assignee', v)} />
                 <Select className="w-32" label="Status" value={task.status} onChange={(v: any) => updateTask(task.id, 'status', v)}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                 </Select>
                 <button type="button" onClick={() => deleteTask(task.id)} className="mb-1 p-2 text-red-500 hover:bg-red-50 rounded">
                   <Trash2 size={18} />
                 </button>
               </div>
             ))}
             <button type="button" onClick={handleAddTask} className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700">
                <Plus size={16} /> Add Task
             </button>
           </div>
        </Section>

      </div>
    </form>
  );
};

// Form UI Components
const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">{title}</h3>
    {children}
  </div>
);

const Input = ({ label, value, onChange, type = 'text', placeholder, className }: any) => (
  <div className={className}>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input 
      type={type} 
      value={value || ''} 
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-10 px-3 text-sm"
      placeholder={placeholder}
    />
  </div>
);

const Select = ({ label, value, onChange, children, className }: any) => (
  <div className={className}>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <select 
      value={value || ''} 
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-10 px-3 text-sm"
    >
      {children}
    </select>
  </div>
);

const RiskSelect = ({ label, value, onChange }: any) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <div className="flex gap-2">
      {[1, 2, 3].map(level => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`flex-1 py-2 text-xs font-bold rounded border ${
            value === level 
              ? level === 1 ? 'bg-green-100 border-green-300 text-green-800' : level === 2 ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-red-100 border-red-300 text-red-800'
              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
          }`}
        >
          {level === 1 ? 'Low' : level === 2 ? 'Med' : 'High'}
        </button>
      ))}
    </div>
  </div>
);

export default ProjectForm;
