package bachelor.projectmanagement.graphql;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import bachelor.projectmanagement.model.Project;
import bachelor.projectmanagement.model.Epic;
import bachelor.projectmanagement.model.Feature;
import bachelor.projectmanagement.model.Task;
import bachelor.projectmanagement.model.TaskStatus;
import bachelor.projectmanagement.model.User;
import bachelor.projectmanagement.model.TaskStatusUpdate;
import bachelor.projectmanagement.model.TaskAssignmentUpdate;
import bachelor.projectmanagement.service.PubSubService;
import bachelor.projectmanagement.service.ProjectService;
import bachelor.projectmanagement.service.SSEService;
import bachelor.projectmanagement.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Controller
public class ProjectResolver {

    private final ProjectService projectService;
    private final UserRepository userRepository;
    private final PubSubService pubSubService;
    private final SSEService sseService;

    public ProjectResolver(ProjectService projectService, UserRepository userRepository, PubSubService pubSubService, SSEService sseService) {
        this.projectService = projectService;
        this.userRepository = userRepository;
        this.pubSubService = pubSubService;
        this.sseService = sseService;
    }

    @QueryMapping
    public List<Project> projectsByUsername(@Argument String username) {
        return projectService.getProjectsByUsername(username);
    }

    @QueryMapping
    public Project projectById(@Argument String id) {
        return projectService.getProjectById(id);
    }

    // --- Project Update Mutations ---

    @MutationMapping
    public Project updateProjectTitle(@Argument String projectId, @Argument String newTitle) {
        System.out.println("🔧 updateProjectTitle called - projectId: " + projectId + ", newTitle: " + newTitle);
        Project project = projectService.getProjectById(projectId);
        if (project == null) throw new RuntimeException("Project not found for id: " + projectId);
        project.setTitle(newTitle);
        Project updatedProject = projectService.save(project);
        
        pubSubService.publishProjectChange(updatedProject); // PUBLISH
        
        // Send minimal update with just the changed fields
        java.util.Map<String, Object> projectUpdate = new java.util.HashMap<>();
        projectUpdate.put("id", updatedProject.getProjectId());
        projectUpdate.put("title", updatedProject.getTitle());
        System.out.println("📡 Sending SSE projectUpdate: " + projectUpdate);
        sseService.sendProjectUpdate(projectId, projectUpdate); // SSE BROADCAST
        
        return updatedProject;
    }

    @MutationMapping
    public Project updateProjectDescription(@Argument String projectId, @Argument String newDescription) {
        System.out.println("🔧 updateProjectDescription called - projectId: " + projectId + ", newDescription: " + newDescription);
        Project project = projectService.getProjectById(projectId);
        if (project == null) throw new RuntimeException("Project not found for id: " + projectId);
        project.setDescription(newDescription);
        Project updatedProject = projectService.save(project);
        
        pubSubService.publishProjectChange(updatedProject); // PUBLISH
        
        // Send minimal update with just the changed fields
        java.util.Map<String, Object> projectUpdate = new java.util.HashMap<>();
        projectUpdate.put("id", updatedProject.getProjectId());
        projectUpdate.put("description", updatedProject.getDescription());
        System.out.println("📡 Sending SSE projectUpdate: " + projectUpdate);
        sseService.sendProjectUpdate(projectId, projectUpdate); // SSE BROADCAST
        
        return updatedProject;
    }

    @MutationMapping
    public Project updateProjectCourseLevel(@Argument String projectId, @Argument int newCourseLevel) {
        Project project = projectService.getProjectById(projectId);
        if (project == null) throw new RuntimeException("Project not found for id: " + projectId);
        project.setCourseLevel(newCourseLevel);
        Project updatedProject = projectService.save(project);
        
        pubSubService.publishProjectChange(updatedProject); // PUBLISH
        
        // Send minimal update with just the changed fields
        java.util.Map<String, Object> projectUpdate = new java.util.HashMap<>();
        projectUpdate.put("id", updatedProject.getProjectId());
        projectUpdate.put("courseLevel", updatedProject.getCourseLevel());
        sseService.sendProjectUpdate(projectId, projectUpdate); // SSE BROADCAST
        
        return updatedProject;
    }

    // --- Epic Update Mutations ---

    @MutationMapping
    public Epic updateEpicTitle(@Argument String projectId, @Argument String epicId, @Argument String newTitle) {
        Epic epic = projectService.getEpicById(projectId, epicId);
        if (epic == null) throw new RuntimeException("Epic not found: " + epicId);
        epic.setTitle(newTitle);
        Epic updatedEpic = projectService.saveEpic(projectId, epic);
        
        pubSubService.publishEpicChange(updatedEpic); // PUBLISH
        
        // Send with correct field mapping (epicId -> id)
        java.util.Map<String, Object> epicUpdate = new java.util.HashMap<>();
        epicUpdate.put("id", updatedEpic.getEpicId());
        epicUpdate.put("title", updatedEpic.getTitle());
        sseService.sendEpicUpdate(projectId, epicUpdate); // SSE BROADCAST
        
        return updatedEpic;
    }

    @MutationMapping
    public Epic updateEpicDescription(@Argument String projectId, @Argument String epicId, @Argument String newDescription) {
        Epic epic = projectService.getEpicById(projectId, epicId);
        if (epic == null) throw new RuntimeException("Epic not found: " + epicId);
        epic.setDescription(newDescription);
        Epic updatedEpic = projectService.saveEpic(projectId, epic);
        
        pubSubService.publishEpicChange(updatedEpic); // PUBLISH
        
        // Send with correct field mapping (epicId -> id)
        java.util.Map<String, Object> epicUpdate = new java.util.HashMap<>();
        epicUpdate.put("id", updatedEpic.getEpicId());
        epicUpdate.put("description", updatedEpic.getDescription());
        sseService.sendEpicUpdate(projectId, epicUpdate); // SSE BROADCAST
        
        return updatedEpic;
    }

    // --- Feature Update Mutations ---

    @MutationMapping
    public Feature updateFeatureTitle(@Argument String projectId, @Argument String epicId, @Argument String featureId, @Argument String newTitle) {
        System.out.println("updateFeatureTitle called with:");
        System.out.println("projectId: " + projectId + ", epicId: " + epicId + ", featureId: " + featureId + ", newTitle: " + newTitle);

        Feature feature = projectService.getFeatureById(projectId, epicId, featureId);
        if (feature == null) throw new RuntimeException("Feature not found: " + featureId);

        System.out.println("Before update: " + feature.getTitle());

        feature.setTitle(newTitle);

        Feature updatedFeature = projectService.saveFeature(projectId, epicId, feature);

        System.out.println("After update: " + updatedFeature.getTitle());
        
        pubSubService.publishFeatureChange(updatedFeature); // PUBLISH
        
        // Send with correct field mapping (featureId -> id)
        java.util.Map<String, Object> featureUpdate = new java.util.HashMap<>();
        featureUpdate.put("id", updatedFeature.getFeatureId());
        featureUpdate.put("title", updatedFeature.getTitle());
        sseService.sendFeatureUpdate(projectId, featureUpdate); // SSE BROADCAST
        
        return updatedFeature;
    }

    @MutationMapping
    public Feature updateFeatureDescription(@Argument String projectId, @Argument String epicId, @Argument String featureId, @Argument String newDescription) {
        System.out.println("🔧 updateFeatureDescription called - featureId: " + featureId + ", newDescription: " + newDescription);
        
        Feature feature = projectService.getFeatureById(projectId, epicId, featureId);
        if (feature == null) throw new RuntimeException("Feature not found: " + featureId);
        feature.setDescription(newDescription);
        Feature updatedFeature = projectService.saveFeature(projectId, epicId, feature);
        
        pubSubService.publishFeatureChange(updatedFeature); // PUBLISH
        
        // Send with correct field mapping (featureId -> id)
        java.util.Map<String, Object> featureUpdate = new java.util.HashMap<>();
        featureUpdate.put("id", updatedFeature.getFeatureId());
        featureUpdate.put("description", updatedFeature.getDescription());
        System.out.println("📡 Sending SSE featureUpdate: " + featureUpdate);
        sseService.sendFeatureUpdate(projectId, featureUpdate); // SSE BROADCAST
        
        return updatedFeature;
    }

    // --- Task Update Mutations ---

    @MutationMapping
    public Task updateTaskTitle(
            @Argument String projectId,
            @Argument String epicId,
            @Argument String featureId,
            @Argument String taskId,
            @Argument String newTitle) {

        Task task = projectService.getTaskById(projectId, epicId, featureId, taskId);
        if (task == null) throw new RuntimeException("Task not found: " + taskId);
        task.setTitle(newTitle);
        Task updatedTask = projectService.saveTask(projectId, epicId, featureId, task);
        
        pubSubService.publishTaskChange(updatedTask); // PUBLISH
        
        // Send with correct field mapping (taskId -> id)
        java.util.Map<String, Object> taskUpdate = new java.util.HashMap<>();
        taskUpdate.put("id", updatedTask.getTaskId());
        taskUpdate.put("title", updatedTask.getTitle());
        sseService.sendTaskUpdate(projectId, taskUpdate); // SSE BROADCAST
        
        return updatedTask;
    }

    @MutationMapping
    public Task updateTaskDescription(
            @Argument String projectId,
            @Argument String epicId,
            @Argument String featureId,
            @Argument String taskId,
            @Argument String newDescription) {

        Task task = projectService.getTaskById(projectId, epicId, featureId, taskId);
        if (task == null) throw new RuntimeException("Task not found: " + taskId);
        task.setDescription(newDescription);
        Task updatedTask = projectService.saveTask(projectId, epicId, featureId, task);
        
        pubSubService.publishTaskChange(updatedTask); // PUBLISH
        
        // Send with correct field mapping (taskId -> id)
        java.util.Map<String, Object> taskUpdate = new java.util.HashMap<>();
        taskUpdate.put("id", updatedTask.getTaskId());
        taskUpdate.put("description", updatedTask.getDescription());
        sseService.sendTaskUpdate(projectId, taskUpdate); // SSE BROADCAST
        
        return updatedTask;
    }

    @MutationMapping
    public Task updateTaskStatus(
            @Argument String projectId,
            @Argument String epicId,
            @Argument String featureId,
            @Argument String taskId,
            @Argument String newStatus) {

        Task task = projectService.getTaskById(projectId, epicId, featureId, taskId);
        if (task == null) throw new RuntimeException("Task not found: " + taskId);
        
        // Convert String to TaskStatus enum
        TaskStatus status = TaskStatus.valueOf(newStatus);
        task.setStatus(status);
        Task updatedTask = projectService.saveTask(projectId, epicId, featureId, task);
        
        // Publish general task change
        pubSubService.publishTaskChange(updatedTask);
        
        // Publish specific task status change event for real-time updates
        TaskStatusUpdate statusUpdate = new TaskStatusUpdate(
            taskId, 
            projectId, 
            newStatus, 
            updatedTask.getTitle(),
            getCurrentUser() // You'll need to implement this method to get current user
        );
        pubSubService.publishTaskStatusUpdate(statusUpdate);
        
        // Send with correct field mapping (taskId -> id)
        java.util.Map<String, Object> taskUpdate = new java.util.HashMap<>();
        taskUpdate.put("id", updatedTask.getTaskId());
        taskUpdate.put("status", updatedTask.getStatus().toString());
        sseService.sendTaskUpdate(projectId, taskUpdate); // SSE BROADCAST
        
        return updatedTask;
    }

    @MutationMapping
    public Task updateTaskUsers(
            @Argument String projectId,
            @Argument String epicId,
            @Argument String featureId,
            @Argument String taskId,
            @Argument List<String> userIds) {

        System.out.println("updateTaskUsers called with:");
        System.out.println("projectId: " + projectId);
        System.out.println("epicId: " + epicId);
        System.out.println("featureId: " + featureId);
        System.out.println("taskId: " + taskId);
        System.out.println("userIds: " + userIds);

        Task task = projectService.getTaskById(projectId, epicId, featureId, taskId);
        if (task == null) throw new RuntimeException("Task not found: " + taskId);

        // Convert usernames to user IDs (assuming userIds here are usernames based on existing logic)
        List<String> resolvedUserIds = userIds.stream()
            .map(username -> {
                System.out.println("Resolving username: " + username);
                return userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username))
                    .getId();
            })
            .collect(Collectors.toList());

        System.out.println("Resolved user IDs: " + resolvedUserIds);

        // Update the users assigned to the task
        task.setUsers(resolvedUserIds);
        Task updatedTask = projectService.saveTask(projectId, epicId, featureId, task);
        
        // Publish general task change
        pubSubService.publishTaskChange(updatedTask);
        
        // Publish specific task assignment update for real-time collaboration
        List<User> assignedUsers = resolvedUserIds.stream()
            .map(userId -> userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId)))
            .collect(Collectors.toList());
            
        TaskAssignmentUpdate assignmentUpdate = new TaskAssignmentUpdate(
            taskId,
            projectId,
            assignedUsers,
            getCurrentUser()
        );
        pubSubService.publishTaskAssignmentUpdate(assignmentUpdate);
        
        // Send with correct field mapping (taskId -> id) and include users
        java.util.Map<String, Object> taskUpdate = new java.util.HashMap<>();
        taskUpdate.put("id", updatedTask.getTaskId());
        taskUpdate.put("users", assignedUsers.stream()
            .map(user -> {
                java.util.Map<String, String> userMap = new java.util.HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("username", user.getUsername());
                return userMap;
            })
            .collect(Collectors.toList()));
        sseService.sendTaskUserAssigned(projectId, taskUpdate); // SSE broadcast for user assignment
        
        return updatedTask;
    }
    
    // --- Deletion Mutations ---
    // For deletion, we publish the updated parent entity (Project) since the children are nested.

    @MutationMapping
    public Boolean deleteEpic(@Argument String projectId, @Argument String epicId) {
        try {
            projectService.deleteEpicFromProject(projectId, epicId);
            // Fetch the updated project after deletion to publish the change
            Project updatedProject = projectService.getProjectById(projectId);
            pubSubService.publishProjectChange(updatedProject); // PUBLISH PARENT CHANGE
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete epic: " + e.getMessage());
        }
    }

    @MutationMapping
    public Boolean deleteFeature(@Argument String projectId, @Argument String epicId, @Argument String featureId) {
        try {
            projectService.deleteFeatureFromEpic(projectId, epicId, featureId);
            // Fetch the updated project after deletion to publish the change
            Project updatedProject = projectService.getProjectById(projectId);
            pubSubService.publishProjectChange(updatedProject); // PUBLISH PARENT CHANGE
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete feature: " + e.getMessage());
        }
    }

    @MutationMapping
    public Boolean deleteTask(
            @Argument String projectId,
            @Argument String epicId,
            @Argument String featureId,
            @Argument String taskId) {
        try {
            projectService.deleteTaskFromFeature(projectId, epicId, featureId, taskId);
            // Fetch the updated project after deletion to publish the change
            Project updatedProject = projectService.getProjectById(projectId);
            pubSubService.publishProjectChange(updatedProject); // PUBLISH PARENT CHANGE
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete task: " + e.getMessage());
        }
    }

    // --- Creation Mutations ---

    @MutationMapping
    public Epic addEpic(@Argument String projectId, @Argument String title, @Argument String description) {
        try {
            Epic epic = new Epic();
            epic.setTitle(title);
            epic.setDescription(description);
            Epic newEpic = projectService.addEpicToProject(projectId, epic);
            
            pubSubService.publishEpicChange(newEpic); // PUBLISH
            sseService.sendEpicCreated(projectId, newEpic); // SSE BROADCAST for creation
            
            // Also publish the parent project change since the structure changed
            Project updatedProject = projectService.getProjectById(projectId);
            pubSubService.publishProjectChange(updatedProject);
            
            return newEpic;
        } catch (Exception e) {
            throw new RuntimeException("Failed to add epic: " + e.getMessage());
        }
    }

    @MutationMapping
    public Feature addFeature(@Argument String projectId, @Argument String epicId, @Argument String title, @Argument String description) {
        try {
            Feature feature = new Feature();
            feature.setTitle(title);
            feature.setDescription(description);
            Feature newFeature = projectService.addFeatureToEpic(projectId, epicId, feature);
            
            pubSubService.publishFeatureChange(newFeature); // PUBLISH
            
            // Create a map with epicId for SSE broadcast (since Feature model doesn't have epicId field)
            java.util.Map<String, Object> featureWithEpicId = new java.util.HashMap<>();
            featureWithEpicId.put("id", newFeature.getFeatureId());
            featureWithEpicId.put("title", newFeature.getTitle());
            featureWithEpicId.put("description", newFeature.getDescription());
            featureWithEpicId.put("epicId", epicId);
            featureWithEpicId.put("tasks", newFeature.getTasks());
            
            sseService.sendFeatureCreated(projectId, featureWithEpicId); // SSE BROADCAST for creation
            
            // Also publish the parent project change since the structure changed
            Project updatedProject = projectService.getProjectById(projectId);
            pubSubService.publishProjectChange(updatedProject);
            
            return newFeature;
        } catch (Exception e) {
            throw new RuntimeException("Failed to add feature: " + e.getMessage());
        }
    }

    @MutationMapping
    public Task addTask(@Argument String projectId, @Argument String epicId, @Argument String featureId, @Argument String title, @Argument String description) {
        try {
            Task task = new Task();
            task.setTitle(title);
            task.setDescription(description);
            Task newTask = projectService.addTaskToFeature(projectId, epicId, featureId, task);
            
            pubSubService.publishTaskChange(newTask); // PUBLISH
            sseService.sendTaskCreated(projectId, newTask); // SSE BROADCAST for creation
            
            // Also publish the parent project change since the structure changed
            Project updatedProject = projectService.getProjectById(projectId);
            pubSubService.publishProjectChange(updatedProject);
            
            return newTask;
        } catch (Exception e) {
            throw new RuntimeException("Failed to add task: " + e.getMessage());
        }
    }
    
    // Helper method to get current authenticated user
    // You'll need to implement this based on your authentication system
    private User getCurrentUser() {
        // For now, return a dummy user - replace with actual authentication logic
        // Example: SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        User currentUser = new User();
        currentUser.setId("current-user-id");
        currentUser.setUsername("current-user");
        return currentUser;
    }

    @MutationMapping
    public Project addUserToProject(@Argument String projectId, @Argument String username) {
        return projectService.addUserToProject(projectId, username);
    }

    @MutationMapping
    public Project removeUserFromProject(@Argument String projectId, @Argument String username) {
        return projectService.removeUserFromProject(projectId, username);
    }
}