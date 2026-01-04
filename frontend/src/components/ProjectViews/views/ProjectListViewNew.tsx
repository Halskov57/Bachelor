import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Plus, X } from 'lucide-react';
import { useProjectViewState } from '../hooks/useProjectViewState';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import EditFanout from '../../EditFanout';
import { getAllTasksWithContext, getUniqueStatuses, getUniqueUsernames, getStatusDisplayName } from '../utils/nodeHelpers';
import PDFExportButton from '../../PDFExportButton';
import { TaskForPDF } from '../../../utils/pdfExport';

type FilterCategory = 'none' | 'status' | 'username' | 'dueDate';

const ProjectListView: React.FC<{ project: any, fetchProjectById: () => void }> = ({ project, fetchProjectById }) => {
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('none');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [selectedDueDate, setSelectedDueDate] = useState<string>('');
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [currentNode, setCurrentNode] = useState<any>(null);

  const {
    handleSave,
  } = useProjectViewState(fetchProjectById);

  const availableStatuses = useMemo(() => getUniqueStatuses(project), [project]);
  const availableUsernames = useMemo(() => getUniqueUsernames(project), [project]);

  const toggleEpic = (epicId: string) => {
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(epicId)) {
      newExpanded.delete(epicId);
    } else {
      newExpanded.add(epicId);
    }
    setExpandedEpics(newExpanded);
  };

  const toggleFeature = (featureId: string) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(featureId)) {
      newExpanded.delete(featureId);
    } else {
      newExpanded.add(featureId);
    }
    setExpandedFeatures(newExpanded);
  };

  const getFilteredTasks = () => {
    const allTasks = getAllTasksWithContext(project);

    if (filterCategory === 'status' && selectedStatus) {
      return allTasks.filter(task => task.status === selectedStatus);
    }

    if (filterCategory === 'username' && selectedUsername) {
      return allTasks.filter(task => {
        const taskUsers = task.users || task.assignedUsers;
        if (!taskUsers || !Array.isArray(taskUsers) || taskUsers.length === 0) {
          return false;
        }
        return taskUsers.some((user: any) => {
          const taskUsername = user.username || user.name;
          return taskUsername === selectedUsername;
        });
      });
    }

    if (filterCategory === 'dueDate' && selectedDueDate) {
      return allTasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDueDate = new Date(task.dueDate);
        const filterDate = new Date(selectedDueDate);
        return taskDueDate <= filterDate;
      });
    }

    return allTasks;
  };

  const handleCategoryChange = (newCategory: FilterCategory) => {
    setFilterCategory(newCategory);
    setSelectedStatus('');
    setSelectedUsername('');
    setSelectedDueDate('');
  };

  const handleNodeClick = (node: any) => {
    setCurrentNode(node);
    if (!editSheetOpen) {
      setEditSheetOpen(true);
    }
  };

  const handleSheetClose = () => {
    setEditSheetOpen(false);
    setCurrentNode(null);
  };

  const handleSaveNode = (data?: any) => {
    if (data?.action === 'create') {
      // Handle create action from Add Child button
      setCurrentNode({
        type: data.nodeType,
        parentIds: {
          projectId: data.parentIds.projectId,
          epicId: data.parentIds.epicId,
          featureId: data.parentIds.featureId,
        }
      });
      setEditSheetOpen(true);
    } else {
      fetchProjectById();
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const upperStatus = status?.toUpperCase();
    if (upperStatus === 'DONE') return 'default';
    if (upperStatus === 'IN_PROGRESS') return 'secondary';
    if (upperStatus === 'TODO') return 'outline';
    return 'secondary';
  };

  const getFilteredTasksForPDF = (): TaskForPDF[] => {
    return getFilteredTasks().map(task => ({
      id: task.id || task._id || '',
      title: task.title || task.name || 'Untitled',
      status: task.status || 'No Status',
      assignedUsers: (task.users || task.assignedUsers || []).map((user: any) => 
        user.username || user.name || 'Unknown'
      ),
      epicTitle: task.epicTitle,
      featureTitle: task.featureTitle,
      description: task.description,
      dueDate: task.dueDate
    }));
  };

  const isFiltering = filterCategory !== 'none' && (selectedStatus || selectedUsername || selectedDueDate);

  return (
    <div className="flex gap-4">
      <div className="flex-1 p-5 bg-background rounded-xl border max-w-4xl">
      {/* Filter Controls */}
      <div className="bg-card p-2 rounded-lg mb-3 border space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Label className="text-xs font-semibold text-primary">Filter tasks by:</Label>
          <Select value={filterCategory} onValueChange={(v) => handleCategoryChange(v as FilterCategory)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="No filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No filter</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="username">Assigned User</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
            </SelectContent>
          </Select>

          {filterCategory === 'status' && (
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map(status => (
                  <SelectItem key={status} value={status}>{getStatusDisplayName(status)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {filterCategory === 'username' && (
            <Select value={selectedUsername} onValueChange={setSelectedUsername}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Select user..." />
              </SelectTrigger>
              <SelectContent>
                {availableUsernames.map((username: string) => (
                  <SelectItem key={username} value={username}>{username}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {filterCategory === 'dueDate' && (
            <div className="flex items-center gap-1.5">
              <Label className="text-xs">Show tasks due before:</Label>
              <Input
                type="date"
                value={selectedDueDate}
                onChange={(e) => setSelectedDueDate(e.target.value)}
                className="w-[140px] h-8 text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Filtered Tasks Table */}
      {isFiltering && (
        <div className="bg-card p-2 rounded-lg mb-3 border-2 border-primary">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-primary">
              Filtered Tasks
              {filterCategory === 'status' && selectedStatus && ` - Status: ${selectedStatus}`}
              {filterCategory === 'username' && selectedUsername && ` - User: ${selectedUsername}`}
              {filterCategory === 'dueDate' && selectedDueDate && ` - Due before: ${new Date(selectedDueDate).toLocaleDateString()}`}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({getFilteredTasks().length} found)
              </span>
            </h3>
            {getFilteredTasks().length > 0 && (
              <PDFExportButton
                tasks={getFilteredTasksForPDF()}
                projectTitle={project.title || project.name || 'Project'}
                filterType={filterCategory === 'status' ? 'Status' : filterCategory === 'username' ? 'User' : filterCategory === 'dueDate' ? 'Due Date' : undefined}
                filterValue={selectedStatus || selectedUsername || (selectedDueDate ? new Date(selectedDueDate).toLocaleDateString() : '')}
              />
            )}
          </div>
          
          {getFilteredTasks().length === 0 ? (
            <p className="text-muted-foreground italic">No tasks found matching the selected filter.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredTasks().map((task: any, index: number) => {
                  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                  const isCompleted = task.status === 'DONE' || task.status === 'Done';
                  const isOverdue = dueDate && dueDate < new Date() && !isCompleted;
                  
                  return (
                    <TableRow
                      key={task.id || task._id || `${task.title}-${index}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleNodeClick({
                        ...task,
                        type: 'task',
                        id: task.id || task.taskId,
                        projectId: task.projectId,
                        epicId: task.epicId,
                        featureId: task.featureId,
                      })}
                    >
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(task.status)}>
                          {getStatusDisplayName(task.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(task.users || task.assignedUsers)?.map((u: any) => u.username).join(', ') || '-'}
                      </TableCell>
                      <TableCell>
                        {dueDate ? (
                          <span className={isOverdue ? 'text-destructive font-semibold' : ''}>
                            {dueDate.toLocaleDateString()}
                            {isOverdue && ' ⚠️'}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {task.epicTitle && task.featureTitle && `${task.epicTitle} → ${task.featureTitle}`}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Hierarchical Tree View */}
      <div className="space-y-2">
        {/* Project Level */}
        <div
          className="bg-primary text-primary-foreground p-1.5 rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
          onClick={() => handleNodeClick({...project, type: 'project'})}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-base">🎓</span>
            <span className="text-xs font-bold">{project.title || project.name}</span>
          </div>
        </div>

        {/* Epics Level */}
        {project.epics && project.epics.map((epic: any) => {
          const epicId = epic.id || epic._id || epic.title;
          const isExpanded = expandedEpics.has(epicId);
          const hasFeatures = Array.isArray(epic.features) && epic.features.length > 0;

          return (
            <div key={epicId} className="ml-4">
              <div
                className="bg-primary/10 border-l-4 border-primary p-1.5 rounded-md cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick({...epic, type: 'epic', projectId: project.id});
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {hasFeatures && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEpic(epicId);
                        }}
                        className="hover:bg-muted rounded p-0.5 transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </button>
                    )}
                    <span className="text-sm">📁</span>
                    <span className="font-medium text-xs">{epic.title || epic.name}</span>
                    <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">
                      {epic.features?.length || 0} features
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Features Level */}
              {isExpanded && hasFeatures && epic.features.map((feature: any) => {
                const featureId = feature.id || feature._id || feature.title;
                const isFeatureExpanded = expandedFeatures.has(featureId);
                const hasTasks = Array.isArray(feature.tasks) && feature.tasks.length > 0;

                return (
                  <div key={featureId} className="ml-4 mt-1">
                    <div
                      className="bg-secondary/30 border-l-4 border-secondary p-1.5 rounded-md cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNodeClick({...feature, type: 'feature', projectId: project.id, epicId: epic.id});
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {hasTasks && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFeature(featureId);
                              }}
                              className="hover:bg-muted rounded p-0.5 transition-colors"
                            >
                              {isFeatureExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </button>
                          )}
                          <span className="text-xs">📂</span>
                          <span className="font-medium text-xs">{feature.title || feature.name}</span>
                          <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">
                            {feature.tasks?.length || 0} tasks
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Tasks Level */}
                    {isFeatureExpanded && hasTasks && (
                      <div className="ml-4 mt-1 space-y-1">
                        {feature.tasks.map((task: any) => {
                          const taskId = task.id || task._id || task.title;
                          const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                          const isCompleted = task.status === 'DONE' || task.status === 'Done';
                          const isOverdue = dueDate && dueDate < new Date() && !isCompleted;

                          return (
                            <div
                              key={taskId}
                              className={`border-l-4 p-1.5 rounded-md cursor-pointer transition-colors ${
                                isCompleted 
                                  ? 'bg-green-50 border-green-500 hover:bg-green-100' 
                                  : isOverdue 
                                  ? 'bg-red-50 border-red-500 hover:bg-red-100'
                                  : 'bg-muted/30 border-muted hover:bg-muted/50'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNodeClick({
                                  ...task,
                                  type: 'task',
                                  id: task.id || task.taskId,
                                  projectId: project.id,
                                  epicId: epic.id,
                                  featureId: feature.id,
                                });
                              }}
                            >
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs">📌</span>
                                  <span className="font-medium text-xs">{task.title}</span>
                                </div>
                                <div className="flex items-center gap-0.5 flex-wrap">
                                  {task.status && (
                                    <Badge variant={getStatusVariant(task.status)} className="text-[10px] px-1 py-0">
                                      {getStatusDisplayName(task.status)}
                                    </Badge>
                                  )}
                                  {dueDate && (
                                    <Badge variant={isOverdue ? 'destructive' : 'outline'} className="text-[10px] px-1 py-0">
                                      📅 {dueDate.toLocaleDateString()}
                                      {isOverdue && ' ⚠️'}
                                    </Badge>
                                  )}
                                  {(task.users || task.assignedUsers)?.length > 0 && (
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                      👤 {(task.users || task.assignedUsers).map((u: any) => u.username).join(', ')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      </div>

      {/* Edit Panel */}
      {editSheetOpen && currentNode && (
        <Card className="w-[400px] max-h-[calc(100vh-12rem)] flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-3">
            <EditFanout
              mode={currentNode.id ? "edit" : "create"}
              node={currentNode.id ? currentNode : undefined}
              createNode={!currentNode.id ? currentNode : undefined}
              project={project}
              onClose={handleSheetClose}
              onSave={handleSaveNode}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectListView;
