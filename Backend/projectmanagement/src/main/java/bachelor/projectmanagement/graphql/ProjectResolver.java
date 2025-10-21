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
import bachelor.projectmanagement.service.ProjectService;
import bachelor.projectmanagement.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Controller
public class ProjectResolver {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    public ProjectResolver(ProjectService projectService, UserRepository userRepository) {
        this.projectService = projectService;
        this.userRepository = userRepository;
    }

    @QueryMapping
    public List<Project> projectsByUsername(@Argument String username) {
        return projectService.getProjectsByUsername(username);
    }

    @QueryMapping
    public Project projectById(@Argument String id) {
        return projectService.getProjectById(id);
    }

    @MutationMapping
    public Project updateProjectTitle(@Argument String projectId, @Argument String newTitle) {
        Project project = projectService.getProjectById(projectId);
        if (project == null) throw new RuntimeException("Project not found for id: " + projectId);
        project.setTitle(newTitle);
        return projectService.save(project);
    }

    @MutationMapping
    public Project updateProjectDescription(@Argument String projectId, @Argument String newDescription) {
        Project project = projectService.getProjectById(projectId);
        if (project == null) throw new RuntimeException("Project not found for id: " + projectId);
        project.setDescription(newDescription);
        return projectService.save(project);
    }

    @MutationMapping
    public Project updateProjectCourseLevel(@Argument String projectId, @Argument int newCourseLevel) {
        Project project = projectService.getProjectById(projectId);
        if (project == null) throw new RuntimeException("Project not found for id: " + projectId);
        project.setCourseLevel(newCourseLevel);
        return projectService.save(project);
    }

    @MutationMapping
    public Epic updateEpicTitle(@Argument String projectId, @Argument String epicId, @Argument String newTitle) {
        Epic epic = projectService.getEpicById(projectId, epicId);
        if (epic == null) throw new RuntimeException("Epic not found: " + epicId);
        epic.setTitle(newTitle);
        return projectService.saveEpic(projectId, epic);
    }

    @MutationMapping
    public Epic updateEpicDescription(@Argument String projectId, @Argument String epicId, @Argument String newDescription) {
        Epic epic = projectService.getEpicById(projectId, epicId);
        if (epic == null) throw new RuntimeException("Epic not found: " + epicId);
        epic.setDescription(newDescription);
        return projectService.saveEpic(projectId, epic);
    }

    @MutationMapping
    public Feature updateFeatureTitle(@Argument String projectId, @Argument String epicId, @Argument String featureId, @Argument String newTitle) {
        System.out.println("updateFeatureTitle called with:");
        System.out.println("projectId: " + projectId + ", epicId: " + epicId + ", featureId: " + featureId + ", newTitle: " + newTitle);

        Feature feature = projectService.getFeatureById(projectId, epicId, featureId);
        if (feature == null) throw new RuntimeException("Feature not found: " + featureId);

        System.out.println("Before update: " + feature.getTitle());

        feature.setTitle(newTitle);

        Feature updated = projectService.saveFeature(projectId, epicId, feature);

        System.out.println("After update: " + updated.getTitle());

        return updated;
    }

    @MutationMapping
    public Feature updateFeatureDescription(@Argument String projectId, @Argument String epicId, @Argument String featureId, @Argument String newDescription) {
        Feature feature = projectService.getFeatureById(projectId, epicId, featureId);
        if (feature == null) throw new RuntimeException("Feature not found: " + featureId);
        feature.setDescription(newDescription);
        return projectService.saveFeature(projectId, epicId, feature);
    }

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
        return projectService.saveTask(projectId, epicId, featureId, task);
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
        return projectService.saveTask(projectId, epicId, featureId, task);
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
        return projectService.saveTask(projectId, epicId, featureId, task);
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

        // Convert usernames to user IDs
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
        return projectService.saveTask(projectId, epicId, featureId, task);
    }

    @MutationMapping
    public Boolean deleteEpic(@Argument String projectId, @Argument String epicId) {
        try {
            projectService.deleteEpicFromProject(projectId, epicId);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete epic: " + e.getMessage());
        }
    }

    @MutationMapping
    public Boolean deleteFeature(@Argument String projectId, @Argument String epicId, @Argument String featureId) {
        try {
            projectService.deleteFeatureFromEpic(projectId, epicId, featureId);
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
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete task: " + e.getMessage());
        }
    }

    @MutationMapping
    public Epic addEpic(@Argument String projectId, @Argument String title, @Argument String description) {
        try {
            Epic epic = new Epic();
            epic.setTitle(title);
            epic.setDescription(description);
            return projectService.addEpicToProject(projectId, epic);
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
            return projectService.addFeatureToEpic(projectId, epicId, feature);
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
            return projectService.addTaskToFeature(projectId, epicId, featureId, task);
        } catch (Exception e) {
            throw new RuntimeException("Failed to add task: " + e.getMessage());
        }
    }
}
