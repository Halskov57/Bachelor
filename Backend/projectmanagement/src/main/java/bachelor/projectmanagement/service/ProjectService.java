package bachelor.projectmanagement.service;

import bachelor.projectmanagement.exception.UnauthorizedException;
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
        
        // Set parent IDs for subscription filtering
        task.setProjectId(projectId);
        task.setEpicId(epicId);
        task.setFeatureId(featureId);
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
        Task task = feature.getTasks().stream()
            .filter(t -> t.getTaskId().equals(taskId))
            .findFirst()
            .orElse(null);
        
        // Ensure parent IDs are set for subscription filtering
        if (task != null) {
            task.setProjectId(projectId);
            task.setEpicId(epicId);
            task.setFeatureId(featureId);
        }
        
        return task;
    }

    public Project save(Project project) {
        return projectRepository.save(project);
    }

    public Epic saveEpic(String projectId, Epic updatedEpic) {
        Project project = getProjectById(projectId);
        for (Epic epic : project.getEpics()) {
            if (epic.getEpicId().equals(updatedEpic.getEpicId())) {
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
                                // Update dueDate - allow null to clear the date
                                task.setDueDate(updatedTask.getDueDate());
                                
                                // Ensure parent IDs are set for subscription filtering
                                task.setProjectId(projectId);
                                task.setEpicId(epicId);
                                task.setFeatureId(featureId);
                                
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

    public Project addUserToProject(String projectId, String username) {
        // Fetch the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        // Fetch the user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new bachelor.projectmanagement.exception.UserNotFoundException("User '" + username + "' does not exist"));

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

        return project;
    }

    public Project removeUserFromProject(String projectId, String username) {
        // Fetch the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        // Fetch the user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new bachelor.projectmanagement.exception.UserNotFoundException("User '" + username + "' does not exist"));

        // Remove the user from the project's owners list
        project.getOwners().remove(user);
        projectRepository.save(project);

        // Remove the project from the user's projects list
        user.getProjects().removeIf(p -> p.getProjectId().equals(projectId));
        userRepository.save(user);

        return project;
    }

    /**
     * Check if a user has access to a project (is an owner)
     * @param projectId The project ID to check
     * @param username The username to check
     * @return true if user is an owner or superadmin, false otherwise
     */
    public boolean hasProjectAccess(String projectId, String username) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        // SuperAdmins have access to all projects
        if ("SUPERADMIN".equals(user.getRole())) {
            return true;
        }
        
        // Check if user is in the project's owners list
        return project.getOwners().stream()
                .anyMatch(owner -> owner.getUsername().equals(username));
    }

    /**
     * Verify that a user has access to a project, throws exception if not
     * @param projectId The project ID to check
     * @param username The username to check
     * @throws RuntimeException if user does not have access
     */
    public void verifyProjectAccess(String projectId, String username) {
        if (!hasProjectAccess(projectId, username)) {
            throw new UnauthorizedException("Access denied: You are not authorized to access this project");
        }
    }

    public String getId(Project project) {
        return project.getProjectId();
    }

    public Project copyProjectStructure(Project template, String newTitle, String newDescription, int courseLevel, String username) {
        System.out.println("DEBUG: Copying project structure from template: " + template.getTitle());
        
        // Create new project with basic info
        Project newProject = new Project();
        newProject.setTitle(newTitle);
        newProject.setDescription(newDescription);
        newProject.setCourseLevel(courseLevel);
        
        // Copy epics structure
        List<Epic> newEpics = new ArrayList<>();
        if (template.getEpics() != null) {
            for (Epic templateEpic : template.getEpics()) {
                Epic newEpic = new Epic();
                newEpic.setTitle(templateEpic.getTitle());
                newEpic.setDescription(templateEpic.getDescription());
                
                // Copy features structure
                List<Feature> newFeatures = new ArrayList<>();
                if (templateEpic.getFeatures() != null) {
                    for (Feature templateFeature : templateEpic.getFeatures()) {
                        Feature newFeature = new Feature();
                        newFeature.setTitle(templateFeature.getTitle());
                        newFeature.setDescription(templateFeature.getDescription());
                        
                        // Copy tasks structure
                        List<Task> newTasks = new ArrayList<>();
                        if (templateFeature.getTasks() != null) {
                            for (Task templateTask : templateFeature.getTasks()) {
                                Task newTask = new Task();
                                newTask.setTitle(templateTask.getTitle());
                                newTask.setDescription(templateTask.getDescription());
                                newTask.setStatus(TaskStatus.TODO); // Start with default status
                                newTask.setUsers(new ArrayList<>()); // Start with no assigned users
                                newTasks.add(newTask);
                            }
                        }
                        newFeature.setTasks(newTasks);
                        newFeatures.add(newFeature);
                    }
                }
                newEpic.setFeatures(newFeatures);
                newEpics.add(newEpic);
            }
        }
        newProject.setEpics(newEpics);
        
        // Assign IDs and save the project with current user as owner
        return createProject(newProject, username); // This will assign IDs and save
    }
}
