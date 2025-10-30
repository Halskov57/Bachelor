package bachelor.projectmanagement.repository;

import bachelor.projectmanagement.model.CourseLevelConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseLevelConfigRepository extends MongoRepository<CourseLevelConfig, String> {
    // Return all configs matching the course level (defensive: database may contain duplicates)
    List<CourseLevelConfig> findAllByCourseLevel(int courseLevel);
}