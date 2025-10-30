package bachelor.projectmanagement.config;
import bachelor.projectmanagement.model.Project;
import bachelor.projectmanagement.repository.UserRepository;
import bachelor.projectmanagement.service.ProjectService;
import bachelor.projectmanagement.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class DatabaseSeeder {

@Bean
CommandLineRunner seedUsers(UserRepository userRepository, UserService userService, ProjectService projectService) {
    return args -> {
        // Create users if they don't exist (password = username)
        if (userRepository.findByUsername("alice").isEmpty()) {
            userService.createUser("alice", "alice");
            System.out.println("✅ Created user alice with password 'alice'");
            // Create a test project for alice
            createTestProjectForUser("alice", projectService, userRepository);

        }
        if (userRepository.findByUsername("bob").isEmpty()) {
            userService.createUser("bob", "bob");
            System.out.println("✅ Created user bob with password 'bob'");
            // Create a minimal project for bob
            var createdProject = createMinimalProjectForUser("bob", projectService, userRepository);
            projectService.addUserToProject(createdProject.getId(), "alice");
        }
        if (userRepository.findByUsername("charlie").isEmpty()) {
            userService.createUser("charlie", "charlie");
            System.out.println("✅ Created user charlie with password 'charlie'");
        }

        // Create User1 through User10 (no projects)
        for (int i = 1; i <= 10; i++) {
            String username = "User" + i;
            if (userRepository.findByUsername(username).isEmpty()) {
                userService.createUser(username, username);
                System.out.println("✅ Created user " + username + " with password '" + username + "'");
            }
        }

        // SuperAdmin user (only one allowed)
        if (userRepository.findByUsername("admin").isEmpty()) {
            userService.createSuperAdminUser("admin", "admin");
            System.out.println("✅ Created super admin user with username 'admin' and password 'admin'");
        } else {
            System.out.println("ℹ️ Super admin user already exists, skipping creation.");
        }
    };
} 

private Project createTestProjectForUser(String username, ProjectService projectService, UserRepository userRepository) {
    // Check if the "Test Project" already exists in the database
    boolean hasTestProject = projectService.getProjectsByUsername(username).stream()
        .anyMatch(p -> "Test Project".equals(p.getTitle()));
    if (hasTestProject) {
        System.out.println("ℹ️ Test project already exists for " + username);
        return projectService.getProjectsByUsername(username).stream()
            .filter(p -> "Test Project".equals(p.getTitle()))
            .findFirst()
            .orElse(null);
    }

    // Create the "Test Project"
    Project project = new Project();
    project.setTitle("Test Project");
    project.setDescription("A project with multiple epics and features for frontend testing.");
    project.setDepth(0);
    project.setCourseLevel(7);

    Project createdProject = projectService.createProject(project, username);
    System.out.println("✅ Created test project for " + username + " with ID: " + createdProject.getId());

    return createdProject;
}

private Project createMinimalProjectForUser(String username, ProjectService projectService, UserRepository userRepository) {
    // Check if the "Minimal Project" already exists in the database
    boolean hasMinimalProject = projectService.getProjectsByUsername(username).stream()
        .anyMatch(p -> "Minimal Project".equals(p.getTitle()));
    if (hasMinimalProject) {
        System.out.println("ℹ️ Minimal project already exists for " + username);
        return projectService.getProjectsByUsername(username).stream()
            .filter(p -> "Minimal Project".equals(p.getTitle()))
            .findFirst()
            .orElse(null);
    }

    // Create the "Minimal Project"
    Project project = new Project();
    project.setTitle("Minimal Project");
    project.setDescription("This is a minimal project for testing.");
    project.setDepth(0);
    project.setCourseLevel(1);

    Project createdProject = projectService.createProject(project, username);
    System.out.println("✅ Created minimal project for " + username + " with ID: " + createdProject.getId());

    // Add 1 epic, 1 feature, and 1 task to the minimal project
    try {
        // Create an epic
        bachelor.projectmanagement.model.Epic epic = new bachelor.projectmanagement.model.Epic();
        epic.setTitle("Sample Epic");
        epic.setDescription("This is a sample epic for testing the project structure.");
        bachelor.projectmanagement.model.Epic createdEpic = projectService.addEpicToProject(createdProject.getId(), epic);
        System.out.println("✅ Added epic to minimal project: " + createdEpic.getTitle());

        // Create a feature under the epic
        bachelor.projectmanagement.model.Feature feature = new bachelor.projectmanagement.model.Feature();
        feature.setTitle("Sample Feature");
        feature.setDescription("This is a sample feature for testing the project hierarchy.");
        bachelor.projectmanagement.model.Feature createdFeature = projectService.addFeatureToEpic(createdProject.getId(), createdEpic.getEpicId(), feature);
        System.out.println("✅ Added feature to epic: " + createdFeature.getTitle());

        // Create a task under the feature
        bachelor.projectmanagement.model.Task task = new bachelor.projectmanagement.model.Task();
        task.setTitle("Sample Task");
        task.setDescription("This is a sample task for testing the complete project hierarchy.");
        task.setStatus(bachelor.projectmanagement.model.TaskStatus.TODO);
        bachelor.projectmanagement.model.Task createdTask = projectService.addTaskToFeature(createdProject.getId(), createdEpic.getEpicId(), createdFeature.getFeatureId(), task);
        System.out.println("✅ Added task to feature: " + createdTask.getTitle());
        
    } catch (Exception e) {
        System.err.println("❌ Error adding structure to minimal project: " + e.getMessage());
    }

    return createdProject;
}
}

