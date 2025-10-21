import React, { useState, useEffect } from 'react';
import { getCourseLevelConfig, updateCourseLevelConfig, getAllNonSuperAdminUsers, updateUserRole } from '../utils/graphqlMutations';
import { isSuperAdmin } from '../utils/jwt';

interface FeatureConfig {
  key: string;
  enabled: boolean;
}

interface CourseLevelConfig {
  id: string;
  courseLevel: number;
  features: FeatureConfig[];
}

interface User {
  id: string;
  username: string;
  role: string;
}

const Admin: React.FC = () => {
  const [selectedCourseLevel, setSelectedCourseLevel] = useState<number>(1);
  const [config, setConfig] = useState<CourseLevelConfig | null>(null);
  const [taskUserAssignmentEnabled, setTaskUserAssignmentEnabled] = useState<boolean>(true);
  const [epicCreateDeleteEnabled, setEpicCreateDeleteEnabled] = useState<boolean>(true);
  const [featureCreateDeleteEnabled, setFeatureCreateDeleteEnabled] = useState<boolean>(true);
  const [taskCreateDeleteEnabled, setTaskCreateDeleteEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  
  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>('');
  const [isUserSuperAdmin] = useState<boolean>(isSuperAdmin());

  // Load configuration when course level changes
  useEffect(() => {
    loadConfig();
  }, [selectedCourseLevel]);

  // Load users for SuperAdmin
  useEffect(() => {
    if (isUserSuperAdmin) {
      loadUsers();
    }
  }, [isUserSuperAdmin]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setMessage(''); // Clear any previous messages
      const configData = await getCourseLevelConfig(selectedCourseLevel);
      setConfig(configData);
      
      // Find task user assignment feature
      const taskUserFeature = configData.features.find((f: FeatureConfig) => f.key === 'TASK_USER_ASSIGNMENT');
      setTaskUserAssignmentEnabled(taskUserFeature ? taskUserFeature.enabled : true);
      
      // Find epic create/delete feature
      const epicCreateDeleteFeature = configData.features.find((f: FeatureConfig) => f.key === 'EPIC_CREATE_DELETE');
      setEpicCreateDeleteEnabled(epicCreateDeleteFeature ? epicCreateDeleteFeature.enabled : true);
      
      // Find feature create/delete feature
      const featureCreateDeleteFeature = configData.features.find((f: FeatureConfig) => f.key === 'FEATURE_CREATE_DELETE');
      setFeatureCreateDeleteEnabled(featureCreateDeleteFeature ? featureCreateDeleteFeature.enabled : true);
      
      // Find task create/delete feature
      const taskCreateDeleteFeature = configData.features.find((f: FeatureConfig) => f.key === 'TASK_CREATE_DELETE');
      setTaskCreateDeleteEnabled(taskCreateDeleteFeature ? taskCreateDeleteFeature.enabled : true);
    } catch (error) {
      console.error('Failed to load config:', error);
      
      // Create a default configuration if loading fails
      const defaultConfig: CourseLevelConfig = {
        id: `default-${selectedCourseLevel}`,
        courseLevel: selectedCourseLevel,
        features: [
          { key: 'TASK_USER_ASSIGNMENT', enabled: true },
          { key: 'EPIC_CREATE_DELETE', enabled: true },
          { key: 'FEATURE_CREATE_DELETE', enabled: true },
          { key: 'TASK_CREATE_DELETE', enabled: true }
        ]
      };
      
      setConfig(defaultConfig);
      setTaskUserAssignmentEnabled(true);
      setEpicCreateDeleteEnabled(true);
      setFeatureCreateDeleteEnabled(true);
      setTaskCreateDeleteEnabled(true);
      setMessage(`Using default configuration for Course Level ${selectedCourseLevel}. Configuration will be created when you save.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const updatedConfig = await updateCourseLevelConfig(selectedCourseLevel, [
        { key: 'TASK_USER_ASSIGNMENT', enabled: taskUserAssignmentEnabled },
        { key: 'EPIC_CREATE_DELETE', enabled: epicCreateDeleteEnabled },
        { key: 'FEATURE_CREATE_DELETE', enabled: featureCreateDeleteEnabled },
        { key: 'TASK_CREATE_DELETE', enabled: taskCreateDeleteEnabled }
      ]);
      setConfig(updatedConfig);
      setMessage('Configuration saved successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setMessage('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const loadUsers = async () => {
    try {
      setUserLoading(true);
      setUserMessage('');
      const usersData = await getAllNonSuperAdminUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUserMessage('Failed to load users');
    } finally {
      setUserLoading(false);
    }
  };

  const handleRoleChange = async (username: string, newRole: string) => {
    try {
      setUserLoading(true);
      setUserMessage('');
      await updateUserRole(username, newRole);
      setUserMessage(`Successfully updated ${username}'s role to ${newRole}`);
      
      // Refresh the users list
      await loadUsers();
      
      // Clear message after 3 seconds
      setTimeout(() => setUserMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update user role:', error);
      setUserMessage(`Failed to update ${username}'s role`);
    } finally {
      setUserLoading(false);
    }
  };

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
        <button
          onClick={handleBackToDashboard}
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
          ← Back to Dashboard
        </button>

        <h2 style={{
          color: '#fff',
          margin: 0,
          fontWeight: 700
        }}>
          Admin Panel
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

      {/* Main content */}
      <div style={{ 
        padding: '20px', 
        maxWidth: '800px', 
        margin: '0 auto', 
        position: 'relative', 
        zIndex: 20, 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        borderRadius: '8px', 
        marginTop: '80px', 
        marginBottom: '20px', 
        maxHeight: 'calc(100vh - 120px)', // Restored scrollable area
        overflowY: 'auto', // Enable scrolling
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
      }}>
      <h1 style={{ color: '#333', marginTop: '0' }}>
        Admin Panel - {isUserSuperAdmin ? 'User Management & Course Configuration' : 'Course Level Configuration'}
      </h1>
      
      {/* User Management Section - Only for SuperAdmin */}
      {isUserSuperAdmin && (
        <div style={{ 
          marginBottom: '40px', 
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ color: '#333', marginTop: '0', marginBottom: '20px' }}>User Management</h2>
          
          {userMessage && (
            <div style={{
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: userMessage.includes('Failed') ? '#f8d7da' : '#d4edda',
              color: userMessage.includes('Failed') ? '#721c24' : '#155724',
              border: `1px solid ${userMessage.includes('Failed') ? '#f5c6cb' : '#c3e6cb'}`,
              marginBottom: '15px'
            }}>
              {userMessage}
            </div>
          )}
          
          {userLoading ? (
            <div style={{ textAlign: 'center', fontSize: '16px', color: '#666' }}>
              Loading users...
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: '15px', color: '#666' }}>
                Manage user roles. You can promote users to Admin or demote them back to regular users.
              </p>
              
              <div style={{ 
                maxHeight: '250px', // Reduced height
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}> {/* Smaller font */}
                  <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                      <th style={{ 
                        padding: '8px', // Reduced padding
                        textAlign: 'left', 
                        borderBottom: '1px solid #ddd',
                        fontWeight: 'bold'
                      }}>Username</th>
                      <th style={{ 
                        padding: '8px', // Reduced padding
                        textAlign: 'left', 
                        borderBottom: '1px solid #ddd',
                        fontWeight: 'bold'
                      }}>Current Role</th>
                      <th style={{ 
                        padding: '8px', // Reduced padding
                        textAlign: 'left', 
                        borderBottom: '1px solid #ddd',
                        fontWeight: 'bold'
                      }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id} style={{ 
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa'
                      }}>
                        <td style={{ 
                          padding: '8px', // Reduced padding
                          borderBottom: '1px solid #ddd'
                        }}>
                          {user.username}
                        </td>
                        <td style={{ 
                          padding: '8px', // Reduced padding
                          borderBottom: '1px solid #ddd'
                        }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: user.role === 'ADMIN' ? '#007bff' : '#6c757d',
                            color: 'white'
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '8px', // Reduced padding
                          borderBottom: '1px solid #ddd'
                        }}>
                          {user.role === 'USER' ? (
                            <button
                              onClick={() => handleRoleChange(user.username, 'ADMIN')}
                              disabled={userLoading}
                              style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: userLoading ? 'not-allowed' : 'pointer',
                                opacity: userLoading ? 0.6 : 1
                              }}
                            >
                              Promote to Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(user.username, 'USER')}
                              disabled={userLoading}
                              style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: userLoading ? 'not-allowed' : 'pointer',
                                opacity: userLoading ? 0.6 : 1
                              }}
                            >
                              Demote to User
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {users.length === 0 && (
                <p style={{ textAlign: 'center', color: '#666', margin: '20px 0' }}>
                  No users found.
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Course Level Configuration Section */}
      <div style={{ 
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ color: '#333', marginTop: '0', marginBottom: '20px' }}>Course Level Configuration</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
          Select Course Level:
        </label>
        <select
          value={selectedCourseLevel}
          onChange={(e) => setSelectedCourseLevel(Number(e.target.value))}
          style={{
            padding: '8px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            minWidth: '100px',
            backgroundColor: 'white',
            color: '#333'
          }}
        >
          {[1, 2, 3, 4, 5, 6].map(level => (
            <option key={level} value={level}>
              Course Level {level}
            </option>
          ))}
        </select>
      </div>

      {config && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#333' }}>Configuration for Course Level {selectedCourseLevel}</h2>
          
          <div style={{ 
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {/* Task User Assignment Section */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '10px', marginTop: '0' }}>
                Task Assignment
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#333', fontWeight: '500' }}>
                <input
                  type="checkbox"
                  checked={taskUserAssignmentEnabled}
                  onChange={(e) => setTaskUserAssignmentEnabled(e.target.checked)}
                  style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                />
                Enable Task User Assignment
              </label>
              <p style={{ 
                fontSize: '14px', 
                color: '#666', 
                marginLeft: '30px',
                marginTop: '5px',
                marginBottom: '0'
              }}>
                When enabled, users can assign team members to specific tasks within projects.
              </p>
            </div>

            {/* Divider */}
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />

            {/* Create and Delete Rights Section */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '10px', marginTop: '0' }}>
                Create and Delete Rights
              </h3>
              
              {/* Epic Create/Delete */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#333', fontWeight: '500' }}>
                  <input
                    type="checkbox"
                    checked={epicCreateDeleteEnabled}
                    onChange={(e) => setEpicCreateDeleteEnabled(e.target.checked)}
                    style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                  />
                  Enable Epic Create/Delete
                </label>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666', 
                  marginLeft: '30px',
                  marginTop: '5px',
                  marginBottom: '0'
                }}>
                  When enabled, users can create and delete epics in projects.
                </p>
              </div>

              {/* Feature Create/Delete */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#333', fontWeight: '500' }}>
                  <input
                    type="checkbox"
                    checked={featureCreateDeleteEnabled}
                    onChange={(e) => setFeatureCreateDeleteEnabled(e.target.checked)}
                    style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                  />
                  Enable Feature Create/Delete
                </label>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666', 
                  marginLeft: '30px',
                  marginTop: '5px',
                  marginBottom: '0'
                }}>
                  When enabled, users can create and delete features within epics.
                </p>
              </div>

              {/* Task Create/Delete */}
              <div style={{ marginBottom: '0' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#333', fontWeight: '500' }}>
                  <input
                    type="checkbox"
                    checked={taskCreateDeleteEnabled}
                    onChange={(e) => setTaskCreateDeleteEnabled(e.target.checked)}
                    style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                  />
                  Enable Task Create/Delete
                </label>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666', 
                  marginLeft: '30px',
                  marginTop: '5px',
                  marginBottom: '0'
                }}>
                  When enabled, users can create and delete tasks within features.
                </p>
              </div>
            </div>

            {/* Divider */}
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />

            <button
              onClick={handleSaveConfig}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}
      </div> {/* Close course level configuration section */}

      {/* Added floating notification for confirmation/error messages */}
      {message && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          borderRadius: '8px',
          backgroundColor: message.includes('Failed') ? '#f8d7da' : 
                          message.includes('default') ? '#fff3cd' : '#d4edda',
          color: message.includes('Failed') ? '#721c24' : 
                message.includes('default') ? '#856404' : '#155724',
          border: `1px solid ${message.includes('Failed') ? '#f5c6cb' : 
                   message.includes('default') ? '#ffeaa7' : '#c3e6cb'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000,
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {message}
        </div>
      )}

      {loading && !message && (
        <div style={{ textAlign: 'center', fontSize: '16px', color: '#666' }}>
          Loading...
        </div>
      )}
      </div>
    </>
  );
};

export default Admin;