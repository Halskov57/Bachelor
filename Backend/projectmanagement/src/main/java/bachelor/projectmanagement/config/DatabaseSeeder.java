package bachelor.projectmanagement.config;
import bachelor.projectmanagement.model.Project;
import bachelor.projectmanagement.repository.UserRepository;
import bachelor.projectmanagement.service.ProjectService;
import bachelor.projectmanagement.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import bachelor.projectmanagement.model.Epic;
import bachelor.projectmanagement.model.Feature;
import bachelor.projectmanagement.model.Task;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class DatabaseSeeder {

@Bean
CommandLineRunner seedUsers(UserRepository userRepository, UserService userService, ProjectService projectService) {
    return args -> {
        // Create users if they don't exist
        if (userRepository.findByUsername("alice").isEmpty()) {
            userService.createUser("alice", "hashedPassword");
            System.out.println("✅ Created user alice");
            // Create a test project for alice
            createTestProjectForUser("alice", projectService, userRepository);

        }
        if (userRepository.findByUsername("bob").isEmpty()) {
            userService.createUser("bob", "hashedPassword");
            System.out.println("✅ Created user bob");
            // Create a minimal project for bob
            createMinimalProjectForUser("bob", projectService, userRepository);
        }
        if (userRepository.findByUsername("charlie").isEmpty()) {
            userService.createUser("charlie", "hashedPassword");
            System.out.println("✅ Created user charlie");
        }

        // Admin user
        if (userRepository.findByUsername("admin").isEmpty()) {
            var admin = userService.createUser("admin", "adminPassword");
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("✅ Created admin user with username 'admin' and password 'adminPassword'");
        } else {
            System.out.println("ℹ️ Admin user already exists, skipping creation.");
        }
    };
} 

private void createTestProjectForUser(String username, ProjectService projectService, UserRepository userRepository) {
    int epicCount = 5;
    int featurePerEpic = 4;
    int tasksPerFeature = 2; // <-- Add this

    var userOpt = userRepository.findByUsername(username);
    if (userOpt.isEmpty()) {
        System.out.println("❌ User " + username + " does not exist, skipping test project creation.");
        return;
    }
    var user = userOpt.get();

    // Only create if user has no projects
    if (user.getProjects() == null || user.getProjects().isEmpty()) {
        Project project = new Project();
        project.setTitle("Test Project");
        project.setDescription("A project with multiple epics and features for frontend testing.");
        project.setDepth(0);
        project.setCourseLevel(7);

        // Add epics and features
        List<Epic> epics = new ArrayList<>();
        for (int i = 1; i <= epicCount; i++) {
            Epic epic = new Epic();
            epic.setTitle("Epic " + i);
            List<Feature> features = new ArrayList<>();
            for (int j = 1; j <= featurePerEpic; j++) {
                Feature feature = new Feature();
                feature.setTitle("Feature " + i + "." + j);

                // Add work tasks to each feature
                List<Task> Tasks = new ArrayList<>();
                for (int k = 1; k <= tasksPerFeature; k++) {
                    Task task = new Task();
                    task.setTitle("Task " + i + "." + j + "." + k);
                    Tasks.add(task);
                }
                feature.setTasks(Tasks);

                features.add(feature);
            }
            epic.setFeatures(features);
            epics.add(epic);
        }
        project.setEpics(epics);

        projectService.createProject(project, username);
        System.out.println("✅ Created test project for " + username);
    }
}

private void createMinimalProjectForUser(String username, ProjectService projectService, UserRepository userRepository) {
    var userOpt = userRepository.findByUsername(username);
    if (userOpt.isEmpty()) {
        System.out.println("❌ User " + username + " does not exist, skipping minimal project creation.");
        return;
    }
    var user = userOpt.get();

    // Only create if user has no projects named "Minimal Project"
    boolean hasMinimal = user.getProjects() != null && user.getProjects().stream()
        .anyMatch(p -> "Minimal Project".equals(p.getTitle()));
    if (hasMinimal) {
        System.out.println("ℹ️ Minimal project already exists for " + username);
        return;
    }

    // Create Task
    Task task = new Task();
    task.setTitle("Research and knowledge gathering");
    task.setDescription("Watch the video about the relay and calculate the required values for the resistors.");
    task.setDepth(3);
    task.setUsers(List.of(user.getUsername()));

    // Create Feature
    Feature feature = new Feature();
    feature.setTitle("Create the electronics");
    feature.setDescription("Create the required electronics for the car. To drive forward and backwards at different speeds.");
    feature.setDepth(2);
    List<Task> tasks = new ArrayList<>();
    tasks.add(task);
    feature.setTasks(tasks);

    // Create Epic
    Epic epic = new Epic();
    epic.setTitle("Motor");
    epic.setDescription("Creating the motor functionality for the car.");
    epic.setDepth(1);
    epic.setOwner(user);
    List<Feature> features = new ArrayList<>();
    features.add(feature);
    epic.setFeatures(features);

    // Create Project
    Project project = new Project();
    project.setTitle("1 semester project");
    project.setDescription("This is the car project for 1 semester.");
    project.setDepth(0);
    project.setCourseLevel(1);
    project.setOwner(user);
    List<Epic> epics = new ArrayList<>();
    epics.add(epic);
    project.setEpics(epics);

    projectService.createProject(project, username);
    System.out.println("✅ Created minimal project for " + username);
}
}

