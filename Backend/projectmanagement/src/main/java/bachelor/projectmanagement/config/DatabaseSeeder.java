package bachelor.projectmanagement.config;
import bachelor.projectmanagement.repository.ProjectRepository;
import bachelor.projectmanagement.repository.UserRepository;
import bachelor.projectmanagement.service.ProjectService;
import bachelor.projectmanagement.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;


@Configuration
public class DatabaseSeeder {

@Bean
@Order(2)
CommandLineRunner seedUsers(UserRepository userRepository, UserService userService, ProjectService projectService) {
    return args -> {
        // Create User1 through User5 (no projects)
        for (int i = 1; i <= 5; i++) {
            String username = "User" + i;
            if (userRepository.findByUsername(username).isEmpty()) {
                userService.createUser(username, username + "12345");
            }
        }

        // SuperAdmin user (only one allowed)
        if (userRepository.findByUsername("admin").isEmpty()) {
            userService.createSuperAdminUser("admin", "JNprj12345");
        }
        System.out.println("Database seeding completed.");
    };
} 

}

