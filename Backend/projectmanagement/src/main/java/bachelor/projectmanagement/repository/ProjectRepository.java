package bachelor.projectmanagement.repository;

import bachelor.projectmanagement.model.Project;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {
     List<Project> findByOwnerId(String ownerId);
}
