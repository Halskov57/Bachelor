package bachelor.projectmanagement.graphql;

import bachelor.projectmanagement.model.*;
import bachelor.projectmanagement.service.ProjectService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

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
    public Project projectById(@Argument String projectId) {
        return projectService.getProjectById(projectId);
    }

    @MutationMapping
    public Project createProject(@Argument String username, @Argument String title, @Argument String description) {
        Project project = new Project();
        project.setTitle(title);
        project.setDescription(description);
        return projectService.createProject(project, username);
    }

    @MutationMapping
    public Epic addEpicToProject(@Argument String projectId, @Argument String title, @Argument String description) {
        Epic epic = new Epic();
        epic.setTitle(title);
        epic.setDescription(description);
        return projectService.addEpicToProject(projectId, epic);
    }

    @MutationMapping
    public Epic updateEpic(@Argument String projectId, @Argument String epicId, @Argument String title, @Argument String description) {
        Epic epic = new Epic();
        epic.setEpicId(epicId);
        epic.setTitle(title);
        epic.setDescription(description);
        return projectService.updateEpic(projectId, epic);
    }

    @MutationMapping
    public Feature addFeatureToEpic(@Argument String projectId, @Argument String epicId, @Argument String title, @Argument String description) {
        Feature feature = new Feature();
        feature.setTitle(title);
        feature.setDescription(description);
        return projectService.addFeatureToEpic(projectId, epicId, feature);
    }

    @MutationMapping
    public Feature updateFeature(@Argument String projectId, @Argument String epicId, @Argument String featureId, @Argument String title, @Argument String description) {
        Feature feature = new Feature();
        feature.setFeatureId(featureId);
        feature.setTitle(title);
        feature.setDescription(description);
        return projectService.updateFeature(projectId, epicId, feature);
    }

    @MutationMapping
    public Task addTaskToFeature(@Argument String projectId, @Argument String epicId, @Argument String featureId, @Argument String title, @Argument String description, @Argument String status) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setStatus(status);
        return projectService.addTaskToFeature(projectId, epicId, featureId, task);
    }

    @MutationMapping
    public Task updateTask(@Argument String projectId, @Argument String epicId, @Argument String featureId, @Argument String taskId, @Argument String title, @Argument String description, @Argument String status) {
        Task task = new Task();
        task.setTaskId(taskId);
        task.setTitle(title);
        task.setDescription(description);
        task.setStatus(status);
        return projectService.updateTask(projectId, epicId, featureId, task);
    }

    @MutationMapping
    public void deleteProject(@Argument String projectId) {
        projectService.deleteProject(projectId);
    }

    @MutationMapping
    public void deleteEpic(@Argument String projectId, @Argument String epicId) {
        projectService.deleteEpicFromProject(projectId, epicId);
    }

    @MutationMapping
    public void deleteFeature(@Argument String projectId, @Argument String epicId, @Argument String featureId) {
        projectService.deleteFeatureFromEpic(projectId, epicId, featureId);
    }

    @MutationMapping
    public void deleteTask(@Argument String projectId, @Argument String epicId, @Argument String featureId, @Argument String taskId) {
        projectService.deleteTaskFromFeature(projectId, epicId, featureId, taskId);
    }
}
