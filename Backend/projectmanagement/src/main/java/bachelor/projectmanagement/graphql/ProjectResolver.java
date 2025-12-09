package bachelor.projectmanagement.graphql;

import bachelor.projectmanagement.graphql.input.*;
import bachelor.projectmanagement.model.*;
import bachelor.projectmanagement.repository.UserRepository;
import bachelor.projectmanagement.service.ProjectService;
import bachelor.projectmanagement.service.SSEService;
import bachelor.projectmanagement.service.CourseLevelConfigService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class ProjectResolver {

    private final ProjectService projectService;
    private final UserRepository userRepository;
    private final SSEService sseService;
    private final CourseLevelConfigService courseLevelConfigService;

    public ProjectResolver(ProjectService projectService, UserRepository userRepository, SSEService sseService, CourseLevelConfigService courseLevelConfigService) {
        this.projectService = projectService;
        this.userRepository = userRepository;
        this.sseService = sseService;
        this.courseLevelConfigService = courseLevelConfigService;
    }

    /**
     * Helper method to get the current authenticated username
     */
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return authentication.getName();
    }

    @QueryMapping
    public List<Project> projectsByUsername(@Argument String username) {
        return projectService.getProjectsByUsername(username);
    }

    @QueryMapping
    public Project projectById(@Argument String id) {
        String currentUsername = getCurrentUsername();
        // Verify the user has access to this project
        projectService.verifyProjectAccess(id, currentUsername);
        return projectService.getProjectById(id);
    }

    // ===== PROJECT MUTATIONS =====

    @MutationMapping
    public Project updateProject(@Argument String id, @Argument ProjectInput input) {
        String currentUsername = getCurrentUsername();
        projectService.verifyProjectAccess(id, currentUsername);
        
        Project project = projectService.getProjectById(id);
        if (project == null) {
            throw new RuntimeException("Project not found: " + id);
        }

        // Only update fields that are provided
        boolean changed = false;
        Map<String, Object> updates = new HashMap<>();
        updates.put("id", project.getProjectId());

        if (input.getTitle() != null) {
            project.setTitle(input.getTitle());
            updates.put("title", input.getTitle());
            changed = true;
        }
        if (input.getDescription() != null) {
            project.setDescription(input.getDescription());
            updates.put("description", input.getDescription());
            changed = true;
        }
        if (input.getCourseLevel() != null) {
            project.setCourseLevel(input.getCourseLevel());
            updates.put("courseLevel", input.getCourseLevel());
            changed = true;
        }

        if (changed) {
            Project updatedProject = projectService.save(project);
            sseService.sendProjectUpdate(id, updates);
            return updatedProject;
        }

        return project;
    }

    // ===== EPIC MUTATIONS =====

    @MutationMapping
    public Epic updateEpic(@Argument String projectId, @Argument String epicId, @Argument EpicInput input) {
        String currentUsername = getCurrentUsername();
        projectService.verifyProjectAccess(projectId, currentUsername);
        
        Epic epic = projectService.getEpicById(projectId, epicId);
        if (epic == null) {
            throw new RuntimeException("Epic not found: " + epicId);
        }

        boolean changed = false;
        Map<String, Object> updates = new HashMap<>();
        updates.put("id", epic.getEpicId());

        if (input.getTitle() != null) {
            epic.setTitle(input.getTitle());
            updates.put("title", input.getTitle());
            changed = true;
        }
        if (input.getDescription() != null) {
            epic.setDescription(input.getDescription());
            updates.put("description", input.getDescription());
            changed = true;
        }

        if (changed) {
            Epic updatedEpic = projectService.saveEpic(projectId, epic);
            sseService.sendEpicUpdate(projectId, updates);
            return updatedEpic;
        }

        return epic;
    }

    // ===== FEATURE MUTATIONS =====

    @MutationMapping
    public Feature updateFeature(@Argument String projectId, @Argument String epicId, 
                                 @Argument String featureId, @Argument FeatureInput input) {
        String currentUsername = getCurrentUsername();
        projectService.verifyProjectAccess(projectId, currentUsername);
        
        Feature feature = projectService.getFeatureById(projectId, epicId, featureId);
        if (feature == null) {
            throw new RuntimeException("Feature not found: " + featureId);
        }

        boolean changed = false;
        Map<String, Object> updates = new HashMap<>();
        updates.put("id", feature.getFeatureId());

        if (input.getTitle() != null) {
            feature.setTitle(input.getTitle());
            updates.put("title", input.getTitle());
            changed = true;
        }
        if (input.getDescription() != null) {
            feature.setDescription(input.getDescription());
            updates.put("description", input.getDescription());
            changed = true;
        }

        if (changed) {
            Feature updatedFeature = projectService.saveFeature(projectId, epicId, feature);
            sseService.sendFeatureUpdate(projectId, updates);
            return updatedFeature;
        }

        return feature;
    }

    // ===== TASK MUTATIONS =====

    @MutationMapping
    public Task updateTask(@Argument String projectId, @Argument String epicId, 
                          @Argument String featureId, @Argument String taskId, 
                          @Argument TaskInput input) {
        String currentUsername = getCurrentUsername();
        projectService.verifyProjectAccess(projectId, currentUsername);

        Task task = projectService.getTaskById(projectId, epicId, featureId, taskId);
        if (task == null) {
            throw new RuntimeException("Task not found: " + taskId);
        }

        boolean changed = false;
        Map<String, Object> updates = new HashMap<>();
        updates.put("id", task.getTaskId());

        if (input.getTitle() != null) {
            task.setTitle(input.getTitle());
            updates.put("title", input.getTitle());
            changed = true;
        }
        if (input.getDescription() != null) {
            task.setDescription(input.getDescription());
            updates.put("description", input.getDescription());
            changed = true;
        }
        if (input.getStatus() != null) {
            task.setStatus(TaskStatus.valueOf(input.getStatus()));
            updates.put("status", input.getStatus());
            changed = true;
        }
        if (input.getDueDate() != null) {
            LocalDate dueDate = input.getDueDate().isEmpty() ? null : LocalDate.parse(input.getDueDate());
            task.setDueDate(dueDate);
            updates.put("dueDate", input.getDueDate().isEmpty() ? null : input.getDueDate());
            changed = true;
        }
        if (input.getUserIds() != null) {
            // Check if task user assignment is enabled
            Project project = projectService.getProjectById(projectId);
            if (!courseLevelConfigService.isTaskUserAssignmentEnabled(project.getCourseLevel())) {
                throw new RuntimeException("Task user assignment is not enabled for this course level");
            }

            List<String> resolvedUserIds = input.getUserIds().stream()
                .map(username -> userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username))
                    .getId())
                .collect(Collectors.toList());

            task.setUsers(resolvedUserIds);
            
            List<User> assignedUsers = resolvedUserIds.stream()
                .map(userId -> userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId)))
                .collect(Collectors.toList());
            
            updates.put("users", assignedUsers.stream()
                .map(user -> {
                    Map<String, String> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername());
                    return userMap;
                })
                .collect(Collectors.toList()));
            changed = true;
        }

        if (changed) {
            Task updatedTask = projectService.saveTask(projectId, epicId, featureId, task);
            sseService.sendTaskUpdate(projectId, updates);
            return updatedTask;
        }

        return task;
    }
    
    @MutationMapping
    public Boolean deleteEpic(@Argument String projectId, @Argument String epicId) {
        String currentUsername = getCurrentUsername();
        projectService.verifyProjectAccess(projectId, currentUsername);
        
        try {
            projectService.deleteEpicFromProject(projectId, epicId);
            
            // Send SSE event for epic deletion
            java.util.Map<String, String> deletionData = new java.util.HashMap<>();
            deletionData.put("epicId", epicId);
            deletionData.put("projectId", projectId);
            sseService.sendEpicDeleted(projectId, deletionData);
            
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete epic: " + e.getMessage());
        }
    }

    @MutationMapping
    public Boolean deleteFeature(@Argument String projectId, @Argument String epicId, @Argument String featureId) {
        String currentUsername = getCurrentUsername();
        projectService.verifyProjectAccess(projectId, currentUsername);
        
        try {
            projectService.deleteFeatureFromEpic(projectId, epicId, featureId);
            
            // Send SSE event for feature deletion
            java.util.Map<String, String> deletionData = new java.util.HashMap<>();
            deletionData.put("featureId", featureId);
            deletionData.put("epicId", epicId);
            deletionData.put("projectId", projectId);
            sseService.sendFeatureDeleted(projectId, deletionData);
            
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
        String currentUsername = getCurrentUsername();
        projectService.verifyProjectAccess(projectId, currentUsername);
        
        try {
            projectService.deleteTaskFromFeature(projectId, epicId, featureId, taskId);
            
            // Send SSE event for task deletion
            java.util.Map<String, String> deletionData = new java.util.HashMap<>();
            deletionData.put("taskId", taskId);
            deletionData.put("featureId", featureId);
            deletionData.put("epicId", epicId);
            deletionData.put("projectId", projectId);
            sseService.sendTaskDeleted(projectId, deletionData);
            
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete task: " + e.getMessage());
        }
    }

    // ===== CREATE MUTATIONS =====

    @MutationMapping
    public Epic createEpic(@Argument String projectId, @Argument CreateEpicInput input) {
        String currentUsername = getCurrentUsername();
        projectService.verifyProjectAccess(projectId, currentUsername);
        
        Epic epic = new Epic();
        epic.setTitle(input.getTitle());
        epic.setDescription(input.getDescription());
        
        Epic newEpic = projectService.addEpicToProject(projectId, epic);
        sseService.sendEpicCreated(projectId, newEpic);
        
        return newEpic;
    }

    @MutationMapping
    public Feature createFeature(@Argument String projectId, @Argument String epicId, 
                                 @Argument CreateFeatureInput input) {
        String currentUsername = getCurrentUsername();
        projectService.verifyProjectAccess(projectId, currentUsername);
        
        Feature feature = new Feature();
        feature.setTitle(input.getTitle());
        feature.setDescription(input.getDescription());
        
        Feature newFeature = projectService.addFeatureToEpic(projectId, epicId, feature);
        
        Map<String, Object> featureWithEpicId = new HashMap<>();
        featureWithEpicId.put("id", newFeature.getFeatureId());
        featureWithEpicId.put("title", newFeature.getTitle());
        featureWithEpicId.put("description", newFeature.getDescription());
        featureWithEpicId.put("epicId", epicId);
        featureWithEpicId.put("tasks", newFeature.getTasks());
        
        sseService.sendFeatureCreated(projectId, featureWithEpicId);
        
        return newFeature;
    }

    @MutationMapping
    public Task createTask(@Argument String projectId, @Argument String epicId, 
                          @Argument String featureId, @Argument CreateTaskInput input) {
        String currentUsername = getCurrentUsername();
        projectService.verifyProjectAccess(projectId, currentUsername);
        
        Task task = new Task();
        task.setTitle(input.getTitle());
        task.setDescription(input.getDescription());
        task.setStatus(input.getStatus() != null ? TaskStatus.valueOf(input.getStatus()) : TaskStatus.TODO);
        
        if (input.getDueDate() != null && !input.getDueDate().isEmpty()) {
            task.setDueDate(LocalDate.parse(input.getDueDate()));
        }
        
        if (input.getUserIds() != null && !input.getUserIds().isEmpty()) {
            Project project = projectService.getProjectById(projectId);
            if (!courseLevelConfigService.isTaskUserAssignmentEnabled(project.getCourseLevel())) {
                throw new RuntimeException("Task user assignment is not enabled for this course level");
            }

            List<String> resolvedUserIds = input.getUserIds().stream()
                .map(username -> userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username))
                    .getId())
                .collect(Collectors.toList());
            task.setUsers(resolvedUserIds);
        }
        
        Task newTask = projectService.addTaskToFeature(projectId, epicId, featureId, task);
        sseService.sendTaskCreated(projectId, newTask);
        
        return newTask;
    }
    
    @MutationMapping
    public Project addUserToProject(@Argument String projectId, @Argument String username) {
        String currentUsername = getCurrentUsername();
        projectService.verifyProjectAccess(projectId, currentUsername);
        
        return projectService.addUserToProject(projectId, username);
    }

    @MutationMapping
    public Project removeUserFromProject(@Argument String projectId, @Argument String username) {
        String currentUsername = getCurrentUsername();
        projectService.verifyProjectAccess(projectId, currentUsername);
        
        return projectService.removeUserFromProject(projectId, username);
    }
}