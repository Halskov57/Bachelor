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
              if (task.status === 'DONE' || task.status === 'Done') {
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
    <div className="bg-card rounded-xl p-5 my-5 border">
      {/* Header with export button */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-bold text-primary m-0">
          Completed Task Assignments
        </h3>
        
        <PDFExportButton
          tasks={tasksForPDF}
          projectTitle={project.title || project.name || 'Project'}
          tableElementId="completed-tasks-table"
        />
      </div>

      {taskUserData.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground italic">
          No completed tasks found in this project
        </div>
      ) : (
        <div 
          id="completed-tasks-table"
          className="overflow-x-auto bg-background rounded-lg border"
        >
          <table className="w-full border-collapse bg-background rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="p-3 text-left font-semibold text-sm w-[35%]">
                  Task Title
                </th>
                <th className="p-3 text-left font-semibold text-sm w-[12%]">
                  Status
                </th>
                <th className="p-3 text-left font-semibold text-sm w-[28%]">
                  Users
                </th>
                <th className="p-3 text-left font-semibold text-sm w-[25%]">
                  Part Of
                </th>
              </tr>
            </thead>
            <tbody>
              {taskUserData.map((task, index) => (
                <tr key={task.taskId} className={index % 2 === 0 ? 'bg-muted/50' : 'bg-background'}>
                  <td className="p-3 align-top text-left border-b border-border text-sm text-foreground">
                    {task.taskTitle}
                  </td>
                  <td className="p-3 align-top text-left border-b border-border">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium inline-block">
                      {task.taskStatus}
                    </span>
                  </td>
                  <td className="p-3 align-top text-left border-b border-border">
                    {task.assignedUsers.length === 0 ? (
                      <span className="text-muted-foreground italic text-xs">
                        Unassigned
                      </span>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        {task.assignedUsers.map((user, idx) => (
                          <span key={user.id}>
                            {user.username}
                            {idx < task.assignedUsers.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-3 align-top text-left border-b border-border text-xs text-muted-foreground">
                    {task.epicTitle}
                    {task.featureTitle && (
                      <span className="text-muted-foreground/70"> / {task.featureTitle}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground text-center">
        Total: {taskUserData.length} completed tasks
      </div>
    </div>
  );
};

export default UserTaskTable;