package bachelor.projectmanagement;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.core.MongoTemplate;

import bachelor.projectmanagement.config.DatabaseCleaner;


import org.bson.Document;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public CommandLineRunner testMongoConnection(MongoTemplate mongoTemplate, DatabaseCleaner databaseCleaner) {
        return args -> {
            System.out.println("Testing MongoDB connection via Spring Boot...");

            try {
                Document ping = mongoTemplate.executeCommand("{ ping: 1 }");
                System.out.println("✅ Connection successful! Ping response: " + ping.toJson());

                System.out.println("Collections in database: " + mongoTemplate.getCollectionNames());

            } catch (Exception e) {
                System.out.println("❌ Connection failed. Check MongoDB configuration.");
                e.printStackTrace();
            }
        };
    }
}
