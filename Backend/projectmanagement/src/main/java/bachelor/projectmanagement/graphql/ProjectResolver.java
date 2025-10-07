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

import java.util.List;

@Controller
public class ProjectResolver {

    private final ProjectService projectService;

    public ProjectResolver(ProjectService projectService) {
        this.projectService = projectService;
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
}
