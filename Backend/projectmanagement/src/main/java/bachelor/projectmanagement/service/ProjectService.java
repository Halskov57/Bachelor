package bachelor.projectmanagement.service;

import bachelor.projectmanagement.model.*;
import bachelor.projectmanagement.repository.ProjectRepository;
import bachelor.projectmanagement.repository.UserRepository;

import java.util.List;

import org.springframework.stereotype.Service;


@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public Project createProject(Project project, String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        project.setOwner(owner);
        Project savedProject = projectRepository.save(project);

        owner.getProjects().add(savedProject);
        userRepository.save(owner);

        return savedProject;
    }

    public List<Project> getProjectsByUsername(String username) {
        User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return projectRepository.findByOwnerId(user.getId());
    }

    public Epic addEpicToProject(String projectId, Epic epic) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        epic.setOwner(project.getOwner()); 
        project.getEpics().add(epic);
        projectRepository.save(project);

        return epic;
    }

    public Feature addFeatureToEpic(String projectId, String epicId, Feature feature) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        Epic epic = project.getEpics().stream()
                .filter(e -> e.getEpicId().equals(epicId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Epic not found: " + epicId));

        epic.getFeatures().add(feature);
        projectRepository.save(project);

        return feature;
    }

    public void deleteProject(String projectId) {
    Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

    User owner = project.getOwner();
    if (owner != null) {
        owner.getProjects().removeIf(p -> p.getProjectId().equals(projectId));
        userRepository.save(owner);
    }

        projectRepository.deleteById(projectId);
    }

    public void deleteEpicFromProject(String projectId, String epicId) {
    Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

    boolean removed = project.getEpics().removeIf(e -> e.getEpicId().equals(epicId));
    if (removed) {
        projectRepository.save(project);
    } else {
        throw new RuntimeException("Epic not found: " + epicId);
    }
    }

    public void deleteFeatureFromEpic(String projectId, String epicId, String featureId) {
    Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

    Epic epic = project.getEpics().stream()
            .filter(e -> e.getEpicId().equals(epicId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Epic not found: " + epicId));

    boolean removed = epic.getFeatures().removeIf(f -> f.getFeatureId().equals(featureId));
    if (removed) {
        projectRepository.save(project);
    } else {
        throw new RuntimeException("Feature not found: " + featureId);
    }
    }

    public Project getProjectById(String id) {
        return projectRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Project not found: " + id));
    }
}
