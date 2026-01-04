import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { parseJwt } from '../utils/jwt';
import { getApiUrl } from '../config/environment';
import { useToast } from '../utils/toastContext';
import { Button } from '../components/ui/button';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { ProjectCardSkeleton } from '../components/dashboard/ProjectCardSkeleton';
import { EmptyState } from '../components/dashboard/EmptyState';
import { CreateProjectSheet } from '../components/dashboard/CreateProjectSheet';
import EditFanout from '../components/EditFanout';
import { Sheet, SheetContent } from '../components/ui/sheet';

interface Project {
  id: string;
  name: string;
  description?: string;
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleReconnection = () => {
      fetchProjects();
    };

    window.addEventListener('backend-reconnected', handleReconnection);
    
    return () => {
      window.removeEventListener('backend-reconnected', handleReconnection);
    };
    // eslint-disable-next-line
  }, []);

  const fetchProjects = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }
    
    const payload = parseJwt(token);
    const username = payload?.sub;
    if (!username) {
      setError('Invalid token payload');
      setLoading(false);
      return;
    }
    fetch(getApiUrl(`/projects/user/${username}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Fetched projects data:', data);
        const mappedProjects = Array.isArray(data)
          ? data.map((p: any) => {
              console.log('Mapping project:', p);
              return {
                id: p.projectId || p.id,
                name: p.title || p.name,
                description: p.description,
              };
            })
          : [];
        console.log('Mapped projects:', mappedProjects);
        setProjects(mappedProjects);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleDelete = (projectId: string) => {
    const token = localStorage.getItem('token');
    fetch(getApiUrl(`/projects/${projectId}`), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setProjects(projects => projects.filter(p => p.id !== projectId));
        showToast('Project deleted successfully', 'success');
      })
      .catch(() => {
        showToast('Failed to delete project', 'error');
      });
  };

  const handleProjectCreated = () => {
    fetchProjects();
    showToast('Project created successfully', 'success');
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
  };

  const handleEditSave = () => {
    fetchProjects();
    setEditingProject(null);
    showToast('Project updated successfully', 'success');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Projects</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-12 text-center">
        <h2 className="text-2xl font-bold text-destructive">Error loading projects</h2>
        <p className="mt-2 text-destructive">{error}</p>
        <Button
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchProjects();
          }}
          className="mt-6"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Projects</h1>
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <EmptyState onCreateProject={() => setShowCreateDialog(true)} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      <CreateProjectSheet
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProjectCreated={handleProjectCreated}
      />

      <Sheet open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {editingProject && (
            <EditFanout
              mode="edit"
              node={{
                id: editingProject.id,
                name: editingProject.name,
                description: editingProject.description || '',
                type: 'PROJECT',
              }}
              onSave={handleEditSave}
              onClose={() => setEditingProject(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Dashboard;