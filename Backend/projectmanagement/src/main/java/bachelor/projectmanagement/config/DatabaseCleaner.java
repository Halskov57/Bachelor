package bachelor.projectmanagement.config;


import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseCleaner {

    private final MongoTemplate mongoTemplate;

    public DatabaseCleaner(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public void clearDatabase() {
        mongoTemplate.getDb().drop();
        System.out.println("✅ Database dropped successfully.");
    }

    public void clearUsersCollection() {
        mongoTemplate.dropCollection("users");
        System.out.println("✅ Users collection dropped.");
    }
}
