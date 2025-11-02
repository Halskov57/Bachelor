import React, { useEffect, useState } from 'react';
import { parseJwt, isAdmin } from '../utils/jwt';
import EditFanout from '../components/EditFanout'; // Import your fanout component
import { getApiUrl, getGraphQLUrl } from '../config/environment';

interface Project {
  id: string;
  name: string;
  // add other fields as needed
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, []);

  const fetchProjects = () => {
    console.log('🔍 Fetching projects from:', getApiUrl('/projects'));
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

    console.log('👤 Fetching projects for user:', username);

    fetch(getApiUrl(`/projects/user/${username}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        console.log('📡 API Response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('📦 Projects data received:', data);
        const mappedProjects = Array.isArray(data)
          ? data.map((p: any) => ({
              id: p.projectId || p.id,
              name: p.title || p.name,
            }))
          : [];
        setProjects(mappedProjects);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching projects:', err);
        setError(err.message);
        setLoading(false);
      });
  };

  const handleDelete = (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    const token = localStorage.getItem('token');
    fetch(getApiUrl(`/projects/${projectId}`), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => {
      setProjects(projects => projects.filter(p => p.id !== projectId));
    });
  };

  const handleAdminPage = () => {
    window.location.href = '/admin';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem',
      color: '#022AFF'
    }}>
      Loading projects...
    </div>
  );

  if (error) return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem',
      color: '#d11a2a',
      textAlign: 'center'
    }}>
      <h2>Error loading projects</h2>
      <p>{error}</p>
      <button 
        onClick={() => {
          setError(null);
          setLoading(true);
          fetchProjects();
        }}
        style={{
          padding: '10px 20px',
          background: '#022AFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Retry
      </button>
    </div>
  );

  return (
    <>
      {/* Top navigation bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: '#022AFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back to Login
          </button>

          {isAdmin() && (
            <button
              onClick={handleAdminPage}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ⚙️ Admin
            </button>
          )}
        </div>

        <h2 style={{
          color: '#fff',
          margin: 0,
          fontWeight: 700
        }}>
          Dashboard
        </h2>

        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Logout
        </button>
      </div>

      {/* Main content with scrollable area */}
      <div style={{ 
        paddingTop: '80px',
        paddingBottom: '40px',
        minHeight: '100vh'
      }}>
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            margin: 'auto',
            padding: '20px',
            maxWidth: '800px',
            textAlign: 'center',
            background: 'rgba(230,230,240,0.92)',
            borderRadius: '18px',
            boxShadow: '0 8px 32px 0 rgba(2,42,255,0.18), 0 0 32px 8px rgba(255,255,255,0.10)',
            marginTop: '20px',
          }}
        >
      <button
        style={{
          marginBottom: 24,
          padding: '10px 24px',
          borderRadius: '8px',
          background: '#022AFF',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.1rem',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={() => setShowCreate(true)}
      >
        + Create Project
      </button>

      {showCreate && (
        <EditFanout
          createNode={{
            type: 'project',
            parentIds: {}
          }}
          mode="create"
          onClose={() => {
            setShowCreate(false);
            fetchProjects(); // Refresh after closing the fanout
          }}
          onSave={() => {}} // Not needed, EditFanout handles everything
        />
      )}

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'center',
        }}>
          {projects.map(project => (
            <div key={project.id} style={{ position: 'relative', display: 'inline-block' }}>
              <button
                style={{
                  minWidth: '160px',
                  minHeight: '80px',
                  background: '#fff',
                  border: '2px solid #022AFF',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(2,42,255,0.08)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#022AFF',
                  cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  padding: '16px',
                  width: '100%',
                }}
                onClick={() => window.location.href = `/project?id=${project.id}`}
              >
                {project.name}
              </button>
              <span
                title="Delete project"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: '#d11a2a',
                  background: '#fff',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  cursor: 'pointer',
                  border: '1px solid #d11a2a',
                  boxShadow: '0 1px 4px rgba(2,42,255,0.08)',
                  zIndex: 2,
                }}
                onClick={e => {
                  e.stopPropagation();
                  handleDelete(project.id);
                }}
              >
                🗑
              </span>
            </div>
          ))}
        </div>
      )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;