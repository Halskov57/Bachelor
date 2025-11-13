import React, { useState, useEffect, useCallback } from 'react';
import { getCourseLevelConfig, updateCourseLevelConfig, getAllNonSuperAdminUsers, updateUserRole, setTemplateProject, getProjectsByCurrentUser } from '../utils/graphqlMutations';
import { isSuperAdmin } from '../utils/jwt';
import { FeatureConfig, Project, CourseLevelConfig, User } from '../utils/types';

const Admin: React.FC = () => {
  const [selectedCourseLevel, setSelectedCourseLevel] = useState<number>(1);
  const [config, setConfig] = useState<CourseLevelConfig | null>(null);
  const [taskUserAssignmentEnabled, setTaskUserAssignmentEnabled] = useState<boolean>(true);
  const [epicCreateDeleteEnabled, setEpicCreateDeleteEnabled] = useState<boolean>(true);
  const [featureCreateDeleteEnabled, setFeatureCreateDeleteEnabled] = useState<boolean>(true);
  const [taskCreateDeleteEnabled, setTaskCreateDeleteEnabled] = useState<boolean>(true);
  const [taskDueDateEnabled, setTaskDueDateEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  
  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>('');
  const [isUserSuperAdmin] = useState<boolean>(isSuperAdmin());
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');

  // Template management state
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [showProjectSelection, setShowProjectSelection] = useState<boolean>(false);
  const [templateMessage, setTemplateMessage] = useState<string>('');

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(''); // Clear any previous messages
      const configData = await getCourseLevelConfig(selectedCourseLevel);

      if (configData) {
        setConfig(configData);
        
        // Find task user assignment feature
        const taskUserFeature = configData.features?.find((f: FeatureConfig) => f.key === 'TASK_USER_ASSIGNMENT');
        setTaskUserAssignmentEnabled(taskUserFeature ? taskUserFeature.enabled : true);
        
        // Find epic create/delete feature
        const epicCreateDeleteFeature = configData.features?.find((f: FeatureConfig) => f.key === 'EPIC_CREATE_DELETE');
        setEpicCreateDeleteEnabled(epicCreateDeleteFeature ? epicCreateDeleteFeature.enabled : true);
        
        // Find feature create/delete feature
        const featureCreateDeleteFeature = configData.features?.find((f: FeatureConfig) => f.key === 'FEATURE_CREATE_DELETE');
        setFeatureCreateDeleteEnabled(featureCreateDeleteFeature ? featureCreateDeleteFeature.enabled : true);
        
        // Find task create/delete feature
        const taskCreateDeleteFeature = configData.features?.find((f: FeatureConfig) => f.key === 'TASK_CREATE_DELETE');
        setTaskCreateDeleteEnabled(taskCreateDeleteFeature ? taskCreateDeleteFeature.enabled : true);
        
        // Find task due date feature
        const taskDueDateFeature = configData.features?.find((f: FeatureConfig) => f.key === 'TASK_DUE_DATE');
        setTaskDueDateEnabled(taskDueDateFeature ? taskDueDateFeature.enabled : true);
      } else {
        // Config is null, create default
        throw new Error('No configuration found');
      }
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
          { key: 'TASK_CREATE_DELETE', enabled: true },
          { key: 'TASK_DUE_DATE', enabled: true }
        ]
      };
      
      setConfig(defaultConfig);
      setTaskUserAssignmentEnabled(true);
      setEpicCreateDeleteEnabled(true);
      setFeatureCreateDeleteEnabled(true);
      setTaskCreateDeleteEnabled(true);
      setTaskDueDateEnabled(true);
      setMessage(`Using default configuration for Course Level ${selectedCourseLevel}. Configuration will be created when you save.`);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseLevel]);

  // Load configuration when course level changes
  useEffect(() => {
    loadConfig();
  }, [selectedCourseLevel, loadConfig]);

  // Load users for SuperAdmin
  useEffect(() => {
    if (isUserSuperAdmin) {
      loadUsers();
    }
  }, [isUserSuperAdmin]);

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const updatedConfig = await updateCourseLevelConfig(selectedCourseLevel, [
        { key: 'TASK_USER_ASSIGNMENT', enabled: taskUserAssignmentEnabled },
        { key: 'EPIC_CREATE_DELETE', enabled: epicCreateDeleteEnabled },
        { key: 'FEATURE_CREATE_DELETE', enabled: featureCreateDeleteEnabled },
        { key: 'TASK_CREATE_DELETE', enabled: taskCreateDeleteEnabled },
        { key: 'TASK_DUE_DATE', enabled: taskDueDateEnabled }
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

  // Template management functions
  const loadAllProjects = async () => {
    try {
      const projects = await getProjectsByCurrentUser();
      // Get projects owned by the current user
      setAllProjects(projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setTemplateMessage('Failed to load projects');
    }
  };

  const handleSetTemplate = async (projectId: string) => {
    try {
      setLoading(true);
      setTemplateMessage('');
      await setTemplateProject(selectedCourseLevel, projectId);
      setTemplateMessage('Template project set successfully!');
      setShowProjectSelection(false);
      
      // Refresh the config to show the new template
      await loadConfig();
      
      // Clear message after 3 seconds
      setTimeout(() => setTemplateMessage(''), 3000);
    } catch (error) {
      console.error('Failed to set template:', error);
      setTemplateMessage('Failed to set template project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    // Simply navigate to dashboard where they can create projects normally
    window.location.href = '/dashboard';
  };



  // Filter users based on search term
  const getFilteredUsers = () => {
    if (!userSearchTerm.trim()) {
      return users;
    }

    const searchLower = userSearchTerm.toLowerCase();
    
    // Calculate similarity score for each user
    const usersWithScore = users.map(user => {
      const usernameLower = user.username.toLowerCase();
      let score = 0;

      // Exact match gets highest score
      if (usernameLower === searchLower) {
        score = 1000;
      }
      // Starts with search term gets high score
      else if (usernameLower.startsWith(searchLower)) {
        score = 500;
      }
      // Contains search term gets medium score
      else if (usernameLower.includes(searchLower)) {
        score = 250;
      }
      // Calculate Levenshtein distance for fuzzy matching
      else {
        const distance = levenshteinDistance(searchLower, usernameLower);
        score = Math.max(0, 100 - distance * 10);
      }

      return { user, score };
    });

    // Sort by score (highest first) and take top 5
    return usersWithScore
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.user);
  };

  // Simple Levenshtein distance implementation
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const filteredUsers = getFilteredUsers();

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
              
              {/* Search input */}
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Search users by username..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
                {userSearchTerm && (
                  <div style={{ 
                    marginTop: '5px', 
                    fontSize: '12px', 
                    color: '#6c757d' 
                  }}>
                    Showing top {Math.min(filteredUsers.length, 5)} result{filteredUsers.length !== 1 ? 's' : ''} for "{userSearchTerm}"
                  </div>
                )}
              </div>
              
              {!userSearchTerm ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: '#666',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    Search for users
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    Type a username in the search box above to find and manage users
                  </div>
                </div>
              ) : (
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
                    {filteredUsers.map((user, index) => (
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
              )}
              
              {userSearchTerm && filteredUsers.length === 0 && (
                <p style={{ textAlign: 'center', color: '#666', margin: '20px 0' }}>
                  No users found matching "{userSearchTerm}".
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
          <h2 style={{ color: '#333' }}>Configuration for {selectedCourseLevel === 0 ? 'Default Template (All Course Levels)' : `Course Level ${selectedCourseLevel}`}</h2>
          
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
              <div style={{ marginBottom: '15px' }}>
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

              {/* Task Due Date */}
              <div style={{ marginBottom: '0' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#333', fontWeight: '500' }}>
                  <input
                    type="checkbox"
                    checked={taskDueDateEnabled}
                    onChange={(e) => setTaskDueDateEnabled(e.target.checked)}
                    style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                  />
                  Enable Task Due Date
                </label>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666', 
                  marginLeft: '30px',
                  marginTop: '5px',
                  marginBottom: '0'
                }}>
                  When enabled, users can set and view due dates for tasks.
                </p>
              </div>
            </div>

            {/* Template Project Section */}
            <div style={{ marginTop: '25px' }}>
              <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>Template Project</h3>
              
              {templateMessage && (
                <div style={{
                  padding: '10px',
                  borderRadius: '4px',
                  backgroundColor: templateMessage.includes('Failed') ? '#f8d7da' : '#d4edda',
                  color: templateMessage.includes('Failed') ? '#721c24' : '#155724',
                  border: `1px solid ${templateMessage.includes('Failed') ? '#f5c6cb' : '#c3e6cb'}`,
                  marginBottom: '15px'
                }}>
                  {templateMessage}
                </div>
              )}

              {config?.templateProject ? (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#e8f4fd',
                  border: '1px solid #bee5eb',
                  borderRadius: '6px',
                  marginBottom: '15px'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#0c5460' }}>Current Template:</h4>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#0c5460' }}>
                    {config.templateProject.title}
                  </p>
                  <p style={{ margin: '0', color: '#0c5460', fontSize: '14px' }}>
                    {config.templateProject.description}
                  </p>
                </div>
              ) : (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  marginBottom: '15px'
                }}>
                  <p style={{ margin: '0', color: '#666', fontStyle: 'italic' }}>
                    No template project set for {selectedCourseLevel === 0 ? 'Default Template (All Course Levels)' : `Course Level ${selectedCourseLevel}`}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCreateTemplate}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Create New Template
                </button>
                
                <button
                  onClick={() => {
                    setShowProjectSelection(!showProjectSelection);
                    if (!showProjectSelection) loadAllProjects();
                  }}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {showProjectSelection ? 'Cancel' : 'Set Existing Project as Template'}
                </button>
              </div>

              {showProjectSelection && (
                <div style={{
                  marginTop: '15px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Select a Project to Use as Template:</h4>
                  {allProjects.length > 0 ? (
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {allProjects.map(project => (
                        <div
                          key={project.id}
                          style={{
                            padding: '10px',
                            margin: '5px 0',
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onClick={() => handleSetTemplate(project.id)}
                        >
                          <div>
                            <strong>{project.title}</strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#666' }}>
                              {project.description || 'No description'}
                            </p>
                          </div>
                          <button
                            style={{
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '3px',
                              fontSize: '12px'
                            }}
                          >
                            Select
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: '0', color: '#666', fontStyle: 'italic' }}>
                      No projects found. Create a project first.
                    </p>
                  )}
                </div>
              )}
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