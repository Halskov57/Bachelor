package bachelor.projectmanagement.service;

import bachelor.projectmanagement.model.*;
import bachelor.projectmanagement.repository.ProjectRepository;
import bachelor.projectmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

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

        assignIdsToEmbeddedObjects(project);

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

    public Epic updateEpic(String projectId, Epic updatedEpic) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        Epic epic = project.getEpics().stream()
                .filter(e -> e.getEpicId().equals(updatedEpic.getEpicId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Epic not found: " + updatedEpic.getEpicId()));

        epic.setTitle(updatedEpic.getTitle());
        epic.setDescription(updatedEpic.getDescription());
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

    public Feature updateFeature(String projectId, String epicId, Feature updatedFeature) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        Epic epic = project.getEpics().stream()
                .filter(e -> e.getEpicId().equals(epicId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Epic not found: " + epicId));

        Feature feature = epic.getFeatures().stream()
                .filter(f -> f.getFeatureId().equals(updatedFeature.getFeatureId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Feature not found: " + updatedFeature.getFeatureId()));

        feature.setTitle(updatedFeature.getTitle());
        feature.setDescription(updatedFeature.getDescription());
        projectRepository.save(project);
        return feature;
    }

    public Task addTaskToFeature(String projectId, String epicId, String featureId, Task task) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        Epic epic = project.getEpics().stream()
                .filter(e -> e.getEpicId().equals(epicId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Epic not found: " + epicId));

        Feature feature = epic.getFeatures().stream()
                .filter(f -> f.getFeatureId().equals(featureId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Feature not found: " + featureId));

        feature.getTasks().add(task);
        projectRepository.save(project);
        return task;
    }

    public Task updateTask(String projectId, String epicId, String featureId, Task updatedTask) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        Epic epic = project.getEpics().stream()
                .filter(e -> e.getEpicId().equals(epicId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Epic not found: " + epicId));

        Feature feature = epic.getFeatures().stream()
                .filter(f -> f.getFeatureId().equals(featureId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Feature not found: " + featureId));

        Task task = feature.getTasks().stream()
                .filter(t -> t.getTaskId().equals(updatedTask.getTaskId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Task not found: " + updatedTask.getTaskId()));

        task.setTitle(updatedTask.getTitle());
        task.setDescription(updatedTask.getDescription());
        task.setStatus(updatedTask.getStatus());
        projectRepository.save(project);
        return task;
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

    public void deleteTaskFromFeature(String projectId, String epicId, String featureId, String taskId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        Epic epic = project.getEpics().stream()
                .filter(e -> e.getEpicId().equals(epicId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Epic not found: " + epicId));

        Feature feature = epic.getFeatures().stream()
                .filter(f -> f.getFeatureId().equals(featureId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Feature not found: " + featureId));

        boolean removed = feature.getTasks().removeIf(t -> t.getTaskId().equals(taskId));
        if (removed) {
            projectRepository.save(project);
        } else {
            throw new RuntimeException("Task not found: " + taskId);
        }
    }

    public Project getProjectById(String id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
    }

    public Project save(Project project) {
        return projectRepository.save(project);
    }

    private void assignIdsToEmbeddedObjects(Project project) {
        if (project.getEpics() != null) {
            for (Epic epic : project.getEpics()) {
                if (epic.getEpicId() == null) {
                    epic.setEpicId(UUID.randomUUID().toString());
                }
                if (epic.getFeatures() != null) {
                    for (Feature feature : epic.getFeatures()) {
                        if (feature.getFeatureId() == null) {
                            feature.setFeatureId(UUID.randomUUID().toString());
                        }
                        if (feature.getTasks() != null) {
                            for (Task task : feature.getTasks()) {
                                if (task.getTaskId() == null) {
                                    task.setTaskId(UUID.randomUUID().toString());
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
