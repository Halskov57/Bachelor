package bachelor.projectmanagement.config;


import bachelor.projectmanagement.repository.UserRepository;
import bachelor.projectmanagement.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseSeeder {

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
                System.out.println("⚠ Users collection is not empty. Skipping seeding.");
            }
        };
    }
}
