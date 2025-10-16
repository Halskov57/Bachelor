package bachelor.projectmanagement.repository;

import bachelor.projectmanagement.model.CourseLevelConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CourseLevelConfigRepository extends MongoRepository<CourseLevelConfig, String> {
    Optional<CourseLevelConfig> findByCourseLevel(int courseLevel);
}