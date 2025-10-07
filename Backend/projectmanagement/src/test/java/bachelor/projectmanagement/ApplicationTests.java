package bachelor.projectmanagement;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")  // Make sure we use test profile
class ApplicationTests {

    @Autowired
    private MongoTemplate mongoTemplate;

    @BeforeEach
    void cleanDatabase() {
        // Clean the database before each test
        mongoTemplate.getDb().drop();
    }

    @Test
    void contextLoads() {
        // This test verifies that the Spring application context loads successfully
    }
}
