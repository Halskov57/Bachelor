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
        String[] usernames = {"alice", "bob", "charlie"};

        for (String username : usernames) {
            // Check if the user already exists
            if (userRepository.findByUsername(username).isEmpty()) {
                userService.createUser(username, "hashedPassword");
                System.out.println("✅ Created user " + username);
            } else {
                System.out.println("⚠ User " + username + " already exists, skipping creation");
            }

            // Now create a project for this user if none exists
            var user = userRepository.findByUsername(username).get();
            if (user.getProjects() == null || user.getProjects().isEmpty()) {
                Project project = new Project();
                project.setTitle(username + "'s Project");
                project.setDescription("This is a project for " + username);
                project.setDepth(0);
                project.setCourseLevel(7);
                projectService.createProject(project, username);
                System.out.println("✅ Created project for " + username);
    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, UserService userService) {
        return args -> {
            if (userRepository.count() == 0) {
                // Regular users
                userService.createUser("alice", "hashedPassword1");
                userService.createUser("bob", "hashedPassword2");
                userService.createUser("charlie", "hashedPassword3");

                // Admin user
                var admin = userService.createUser("admin", "adminPassword");
                admin.setRole("ADMIN");
                userRepository.save(admin);

                System.out.println("✅ Seeded 3 users and 1 admin into the database.");
            } else {
                System.out.println("⚠ User " + username + " already has projects, skipping");
            }
        }
    };
}
}

