package bachelor.projectmanagement.graphql;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import bachelor.projectmanagement.model.Project;
import bachelor.projectmanagement.model.Epic;
import bachelor.projectmanagement.model.Feature;
import bachelor.projectmanagement.model.Task;
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
        if (project == null) return null;
        project.setTitle(newTitle);
        Project result = projectService.save(project);
        if (result.getProjectId() == null) result.setProjectId(projectId);
        return result;
    }

    @MutationMapping
    public Project updateProjectDescription(@Argument String projectId, @Argument String newDescription) {
        Project project = projectService.getProjectById(projectId);
        if (project == null) return null;
        project.setDescription(newDescription);
        Project result = projectService.save(project);
        if (result.getProjectId() == null) result.setProjectId(projectId);
        return result;
    }

    @MutationMapping
    public Epic updateEpicTitle(@Argument String projectId, @Argument String epicId, @Argument String newTitle) {
        Epic epic = new Epic(newTitle, null, 0, null);
        epic.setEpicId(epicId);
        Epic result = projectService.updateEpic(projectId, epic);
        if (result.getEpicId() == null) result.setEpicId(epicId);
        return result;
    }

    @MutationMapping
    public Epic updateEpicDescription(@Argument String projectId, @Argument String epicId, @Argument String newDescription) {
        Epic epic = new Epic(null, newDescription, 0, null);
        epic.setEpicId(epicId);
        Epic result = projectService.updateEpic(projectId, epic);
        if (result.getEpicId() == null) result.setEpicId(epicId);
        return result;
    }

    @MutationMapping
    public Feature updateFeatureTitle(@Argument String projectId, @Argument String epicId, @Argument String featureId, @Argument String newTitle) {
        Feature feature = new Feature(newTitle, null, 0);
        feature.setFeatureId(featureId);
        Feature result = projectService.updateFeature(projectId, epicId, feature);
        if (result.getFeatureId() == null) result.setFeatureId(featureId);
        return result;
    }

    @MutationMapping
    public Feature updateFeatureDescription(@Argument String projectId, @Argument String epicId, @Argument String featureId, @Argument String newDescription) {
        Feature feature = new Feature(null, newDescription, 0);
        feature.setFeatureId(featureId);
        Feature result = projectService.updateFeature(projectId, epicId, feature);
        if (result.getFeatureId() == null) result.setFeatureId(featureId);
        return result;
    }

    @MutationMapping
    public Task updateTaskTitle(
            @Argument String projectId,
            @Argument String epicId,
            @Argument String featureId,
            @Argument String taskId,
            @Argument String newTitle) {

        Task updatedTask = new Task(newTitle, null, 0, null, null);
        updatedTask.setTaskId(taskId);

        Task result = projectService.updateTask(projectId, epicId, featureId, updatedTask);

        if (result.getTaskId() == null) result.setTaskId(taskId);
        if (result.getStatus() == null) result.setStatus("TODO");

        return result;
    }

    @MutationMapping
    public Task updateTaskDescription(
            @Argument String projectId,
            @Argument String epicId,
            @Argument String featureId,
            @Argument String taskId,
            @Argument String newDescription) {

        Task updatedTask = new Task(null, newDescription, 0, null, null);
        updatedTask.setTaskId(taskId);

        Task result = projectService.updateTask(projectId, epicId, featureId, updatedTask);

        if (result.getTaskId() == null) result.setTaskId(taskId);
        if (result.getStatus() == null) result.setStatus("TODO");

        return result;
    }

    @MutationMapping
    public Task updateTaskStatus(
            @Argument String projectId,
            @Argument String epicId,
            @Argument String featureId,
            @Argument String taskId,
            @Argument String newStatus) {

        Task updatedTask = new Task(null, null, 0, null, newStatus);
        updatedTask.setTaskId(taskId);

        Task result = projectService.updateTask(projectId, epicId, featureId, updatedTask);

        if (result.getTaskId() == null) result.setTaskId(taskId);
        if (result.getStatus() == null) result.setStatus(newStatus);

        return result;
    }
}
