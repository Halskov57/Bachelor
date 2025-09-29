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
        }
        if (userRepository.findByUsername("bob").isEmpty()) {
            userService.createUser("bob", "hashedPassword");
            System.out.println("✅ Created user bob");
        }
        if (userRepository.findByUsername("charlie").isEmpty()) {
            userService.createUser("charlie", "hashedPassword");
            System.out.println("✅ Created user charlie");
        }

        // Shared project for alice and bob
        var alice = userRepository.findByUsername("alice").get();

        // Only create the shared project if neither has any projects
        if ((alice.getProjects() == null || alice.getProjects().isEmpty())) {
            // Create project for alice
            createTestProjectForUser("alice", projectService, userRepository);
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
}

