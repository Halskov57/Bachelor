package bachelor.projectmanagement.service;

import bachelor.projectmanagement.model.*;
import bachelor.projectmanagement.repository.ProjectRepository;
import bachelor.projectmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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

        if (project.getOwners() == null) {
            project.setOwners(new ArrayList<>());
        }
        project.getOwners().add(owner);

        assignIdsToEmbeddedObjects(project);

        Project savedProject = projectRepository.save(project);

        owner.getProjects().add(savedProject);
        userRepository.save(owner);

        return savedProject;
    }

    public List<Project> getProjectsByUsername(String username) {
        // Fetch the user by username to get their String ID
        Optional<User> userOptional = userRepository.findByUsername(username);
        
        // If user doesn't exist, return empty list instead of throwing exception
        if (userOptional.isEmpty()) {
            return new ArrayList<>();
        }
        
        User user = userOptional.get();
        return projectRepository.findByOwnersContaining(user.getId());
    }

    public Epic addEpicToProject(String projectId, Epic epic) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        if (epic.getEpicId() == null) {
            epic.setEpicId(UUID.randomUUID().toString());
        }

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

        // Only update fields that are not null
        if (updatedEpic.getTitle() != null) {
            epic.setTitle(updatedEpic.getTitle());
        }
        if (updatedEpic.getDescription() != null) {
            epic.setDescription(updatedEpic.getDescription());
        }
        // Add more fields as needed

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

        if (feature.getFeatureId() == null) {
            feature.setFeatureId(UUID.randomUUID().toString());
        }
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

        if (updatedFeature.getTitle() != null) {
            feature.setTitle(updatedFeature.getTitle());
        }
        if (updatedFeature.getDescription() != null) {
            feature.setDescription(updatedFeature.getDescription());
        }
        // Add more fields as needed

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

        if (task.getTaskId() == null) {
            task.setTaskId(UUID.randomUUID().toString());
        }
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.TODO);
        }
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

        if (updatedTask.getTitle() != null) {
            task.setTitle(updatedTask.getTitle());
        }
        if (updatedTask.getDescription() != null) {
            task.setDescription(updatedTask.getDescription());
        }
        if (updatedTask.getStatus() != null) {
            task.setStatus(updatedTask.getStatus());
        }
        // Add more fields as needed

        projectRepository.save(project);
        return task;
    }

    public void deleteProject(String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        if (project.getOwners() != null) {
            for (User owner : project.getOwners()) {
                owner.getProjects().removeIf(p -> p.getProjectId().equals(projectId));
                userRepository.save(owner);
            }
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

    public Epic getEpicById(String projectId, String epicId) {
        Project project = getProjectById(projectId);
        return project.getEpics().stream()
            .filter(e -> e.getEpicId().equals(epicId))
            .findFirst()
            .orElse(null);
    }

    public Feature getFeatureById(String projectId, String epicId, String featureId) {
        Epic epic = getEpicById(projectId, epicId);
        if (epic == null) return null;
        return epic.getFeatures().stream()
            .filter(f -> f.getFeatureId().equals(featureId))
            .findFirst()
            .orElse(null);
    }

    public Task getTaskById(String projectId, String epicId, String featureId, String taskId) {
        Feature feature = getFeatureById(projectId, epicId, featureId);
        if (feature == null) return null;
        return feature.getTasks().stream()
            .filter(t -> t.getTaskId().equals(taskId))
            .findFirst()
            .orElse(null);
    }

    public Project save(Project project) {
        return projectRepository.save(project);
    }

    public Epic saveEpic(String projectId, Epic updatedEpic) {
        Project project = getProjectById(projectId);
        for (Epic epic : project.getEpics()) {
            if (epic.getEpicId().equals(updatedEpic.getEpicId())) {
                // Update fields in-place (partial update)
                if (updatedEpic.getTitle() != null) {
                    epic.setTitle(updatedEpic.getTitle());
                }
                if (updatedEpic.getDescription() != null) {
                    epic.setDescription(updatedEpic.getDescription());
                }
                if (updatedEpic.getStatus() != null) {
                    epic.setStatus(updatedEpic.getStatus());
                }
                // Save the whole project
                projectRepository.save(project);
                return epic;
            }
        }
        return null;
    }

    public Feature saveFeature(String projectId, String epicId, Feature updatedFeature) {
        Project project = getProjectById(projectId);
        if (project == null) return null;

        for (Epic epic : project.getEpics()) {
            if (epic.getEpicId().equals(epicId)) {
                for (Feature feature : epic.getFeatures()) {
                    if (feature.getFeatureId().equals(updatedFeature.getFeatureId())) {
                        // Update fields in-place
                        if (updatedFeature.getTitle() != null) {
                            feature.setTitle(updatedFeature.getTitle());
                        }
                        if (updatedFeature.getDescription() != null) {
                            feature.setDescription(updatedFeature.getDescription());
                        }
                        // Save the whole project
                        projectRepository.save(project);
                        return feature;
                    }
                }
            }
        }
            return null;
        }

    public Task saveTask(String projectId, String epicId, String featureId, Task updatedTask) {
        Project project = getProjectById(projectId);
        if (project == null) return null;
        for (Epic epic : project.getEpics()) {
            if (epic.getEpicId().equals(epicId)) {
                for (Feature feature : epic.getFeatures()) {
                    if (feature.getFeatureId().equals(featureId)) {
                        for (Task task : feature.getTasks()) {
                            if (task.getTaskId().equals(updatedTask.getTaskId())) {
                                // Only update fields that are not null
                                if (updatedTask.getTitle() != null) {
                                    task.setTitle(updatedTask.getTitle());
                                }
                                if (updatedTask.getDescription() != null) {
                                    task.setDescription(updatedTask.getDescription());
                                }
                                if (updatedTask.getStatus() != null) {
                                    task.setStatus(updatedTask.getStatus());
                                }
                                if (updatedTask.getUsers() != null) {
                                    System.out.println("Updating task users from: " + task.getUsers() + " to: " + updatedTask.getUsers());
                                    task.setUsers(updatedTask.getUsers());
                                }
                                // Add more fields as needed
                                projectRepository.save(project);
                                return task;
                        }
                    }
                }
            }
        }
    }
        return null;
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

    public void addUserToProject(String projectId, String username) {
        // Fetch the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        // Fetch the user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Add the user to the project's owners list if not already present
        if (!project.getOwners().contains(user)) {
            project.getOwners().add(user);
            projectRepository.save(project);
        }

        // Add the project to the user's projects list if not already present
        if (!user.getProjects().contains(project)) {
            user.getProjects().add(project);
            userRepository.save(user);
        }
    }

    public String getId(Project project) {
        return project.getProjectId();
    }
}
