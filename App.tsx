import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import ProjectDetail from './components/ProjectDetail';
import { INITIAL_PROJECTS } from './data';
import { Project } from './types';

function App() {
  const [view, setView] = useState<string>('dashboard');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleSaveProject = (project: Project) => {
    if (selectedProjectId) {
      // Update
      setProjects(prev => prev.map(p => p.id === selectedProjectId ? { ...project, id: selectedProjectId } : p));
      setView('detail'); // Return to detail view after edit
    } else {
      // Create
      const newId = Math.random().toString(36).substr(2, 9);
      setProjects(prev => [...prev, { ...project, id: newId }]);
      setSelectedProjectId(newId);
      setView('detail');
    }
  };

  const handleProjectClick = (id: string) => {
    setSelectedProjectId(id);
    setView('detail'); // Go to detail dashboard first
  };

  const handleCreateRequest = () => {
    setSelectedProjectId(null);
    setView('create');
  };

  const handleEditRequest = () => {
    setView('create'); // Edit mode (form)
  };

  const activeProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : undefined;

  return (
    <Layout activeView={view} onNavigate={(v) => {
        if(v === 'create') handleCreateRequest();
        else {
           setView(v);
           setSelectedProjectId(null);
        }
    }}>
      {view === 'dashboard' && (
        <Dashboard projects={projects} onProjectClick={handleProjectClick} />
      )}
      
      {view === 'list' && (
        <ProjectList projects={projects} onEdit={handleProjectClick} />
      )}

      {view === 'detail' && activeProject && (
        <ProjectDetail 
           project={activeProject} 
           onEdit={handleEditRequest} 
           onBack={() => setView('dashboard')} 
        />
      )}

      {view === 'create' && (
        <ProjectForm 
          initialData={activeProject} 
          onSave={handleSaveProject} 
          onCancel={() => selectedProjectId ? setView('detail') : setView('dashboard')} 
        />
      )}
    </Layout>
  );
}

export default App;
