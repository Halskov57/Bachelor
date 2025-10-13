package bachelor.projectmanagement.repository;

import bachelor.projectmanagement.model.Project;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {
     List<Project> findByOwner(String owner);

     @Query("{ 'owners.username': ?0 }")
     List<Project> findByOwnerUsername(String username);

     @Query("{ 'owners': ?0 }")
     List<Project> findByOwnersContaining(String userId);
}
