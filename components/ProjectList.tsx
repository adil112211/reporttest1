import React, { useState } from 'react';
import { Project } from '../types';
import { Search, Filter, ArrowRight } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  onEdit: (id: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onEdit }) => {
  const [search, setSearch] = useState('');

  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Project Registry</h2>
           <p className="text-slate-500 text-sm">{projects.length} Active Projects</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search code or name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Project Name</th>
              <th className="px-6 py-4">Stage</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Budget</th>
              <th className="px-6 py-4">Status (CPI/SPI)</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onEdit(p.id)}>
                <td className="px-6 py-4 font-mono text-slate-600">{p.code}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs border border-slate-200">
                    {p.stage}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{p.type}</td>
                <td className="px-6 py-4 text-slate-900 font-medium">${p.bac}M</td>
                <td className="px-6 py-4">
                   <div className="flex gap-2">
                     <Indicator val={p.cpi} label="CPI" />
                     <Indicator val={p.spi} label="SPI" />
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Indicator = ({ val, label }: { val: number, label: string }) => (
  <div className={`px-2 py-0.5 rounded text-xs font-bold border ${
    val >= 1 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
  }`}>
    {label} {val.toFixed(2)}
  </div>
);

export default ProjectList;
