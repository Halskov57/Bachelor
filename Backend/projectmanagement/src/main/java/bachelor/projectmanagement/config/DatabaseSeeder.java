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
        // Create users if they don't exist
        if (userRepository.findByUsername("alice").isEmpty()) {
            userService.createUser("alice", "alicePassword");
            System.out.println("✅ Created user alice with password 'alicePassword'");
            // Create a test project for alice
            createTestProjectForUser("alice", projectService, userRepository);

        }
        if (userRepository.findByUsername("bob").isEmpty()) {
            userService.createUser("bob", "bobPassword");
            System.out.println("✅ Created user bob with password 'bobPassword'");
            // Create a minimal project for bob
            var createdProject = createMinimalProjectForUser("bob", projectService, userRepository);
            projectService.addUserToProject(createdProject.getId(), "alice");
        }
        if (userRepository.findByUsername("charlie").isEmpty()) {
            userService.createUser("charlie", "charliePassword");
            System.out.println("✅ Created user charlie with password 'charliePassword'");
        }

        // Admin user
        if (userRepository.findByUsername("admin").isEmpty()) {
            userService.createAdminUser("admin", "adminPassword");
            System.out.println("✅ Created admin user with username 'admin' and password 'adminPassword'");
        } else {
            System.out.println("ℹ️ Admin user already exists, skipping creation.");
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

    return createdProject;
}
}

