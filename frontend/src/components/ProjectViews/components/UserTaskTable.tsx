import React, { useMemo } from 'react';
import PDFExportButton from '../../PDFExportButton';
import { TaskForPDF } from '../../../utils/pdfExport';

interface TaskWithUsers {
  taskId: string;
  taskTitle: string;
  taskStatus: string;
  assignedUsers: { id: string; username: string }[];
  epicTitle: string;
  featureTitle: string;
}

interface UserTaskTableProps {
  project: any;
}

const UserTaskTable: React.FC<UserTaskTableProps> = ({ project }) => {
  // Extract all tasks with their assigned users
  const taskUserData = useMemo(() => {
    const tasks: TaskWithUsers[] = [];
    
    if (!project?.epics) return tasks;

    project.epics.forEach((epic: any) => {
      if (epic.features) {
        epic.features.forEach((feature: any) => {
          if (feature.tasks) {
            feature.tasks.forEach((task: any) => {
              // Only include tasks with "Done" status
              if (task.status === 'Done') {
                tasks.push({
                  taskId: task.id,
                  taskTitle: task.title,
                  taskStatus: task.status,
                  assignedUsers: task.users || [],
                  epicTitle: epic.title || 'Unknown Epic',
                  featureTitle: feature.title || 'Unknown Feature'
                });
              }
            });
          }
        });
      }
    });

    return tasks;
  }, [project]);

  // Prepare tasks data for PDF export
  const tasksForPDF: TaskForPDF[] = useMemo(() => {
    return taskUserData.map(task => ({
      id: task.taskId || '',
      title: task.taskTitle || 'Untitled',
      status: task.taskStatus,
      assignedUsers: task.assignedUsers.map(user => user.username || 'Unknown'),
      epicTitle: task.epicTitle,
      featureTitle: task.featureTitle,
      description: undefined
    }));
  }, [taskUserData]);

  return (
    <div style={{ 
      background: 'rgba(230,230,240,0.96)', 
      borderRadius: 12, 
      padding: '20px',
      margin: '20px 0'
    }}>
      {/* Header with export button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#022AFF',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          Completed Task Assignments
        </h3>
        
        <PDFExportButton
          tasks={tasksForPDF}
          projectTitle={project.title || project.name || 'Project'}
          tableElementId="completed-tasks-table"
        />
      </div>

      {taskUserData.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          fontStyle: 'italic'
        }}>
          No completed tasks found in this project
        </div>
      ) : (
        <div 
          id="completed-tasks-table"
          style={{ 
            overflowX: 'auto',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e0e6ed'
          }}
        >
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: '#fff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#022AFF', color: '#fff' }}>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '14px',
                  width: '35%'
                }}>
                  Task Title
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '14px',
                  width: '12%'
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '14px',
                  width: '28%'
                }}>
                  Users
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '14px',
                  width: '25%'
                }}>
                  Part Of
                </th>
              </tr>
            </thead>
            <tbody>
              {taskUserData.map((task, index) => (
                <tr key={task.taskId} style={{ 
                  backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#fff'
                }}>
                  <td style={{ 
                    padding: '12px 16px', 
                    verticalAlign: 'top',
                    textAlign: 'left',
                    borderBottom: '1px solid #eee',
                    fontSize: '14px',
                    color: '#333'
                  }}>
                    {task.taskTitle}
                  </td>
                  <td style={{ 
                    padding: '12px 16px', 
                    verticalAlign: 'top',
                    textAlign: 'left',
                    borderBottom: '1px solid #eee'
                  }}>
                    <span style={{
                      backgroundColor: '#4caf50',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      display: 'inline-block'
                    }}>
                      {task.taskStatus}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '12px 16px',
                    verticalAlign: 'top',
                    textAlign: 'left',
                    borderBottom: '1px solid #eee'
                  }}>
                    {task.assignedUsers.length === 0 ? (
                      <span style={{ 
                        color: '#999', 
                        fontStyle: 'italic',
                        fontSize: '13px'
                      }}>
                        Unassigned
                      </span>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#555' }}>
                        {task.assignedUsers.map((user, idx) => (
                          <span key={user.id}>
                            {user.username}
                            {idx < task.assignedUsers.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ 
                    padding: '12px 16px',
                    verticalAlign: 'top',
                    textAlign: 'left',
                    borderBottom: '1px solid #eee',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    {task.epicTitle}
                    {task.featureTitle && (
                      <span style={{ color: '#999' }}> / {task.featureTitle}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ 
        marginTop: '16px', 
        fontSize: '14px', 
        color: '#666',
        textAlign: 'center'
      }}>
        Total: {taskUserData.length} completed tasks
      </div>
    </div>
  );
};

export default UserTaskTable;