package bachelor.projectmanagement.util;

import bachelor.projectmanagement.model.*;

import java.util.ArrayList;
import java.util.UUID;

/**
 * Utility class for creating test data objects with proper relationships and IDs.
 */
public class TestDataBuilder {

    public static User createTestUser() {
        return createTestUser("testuser");
    }

    public static User createTestUser(String username) {
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setUsername(username);
        user.setHashedPassword("hashedPassword");
        user.setProjects(new ArrayList<>());
        return user;
    }

    public static Project createTestProject() {
        return createTestProject("Test Project", createTestUser());
    }

    public static Project createTestProject(String title, User owner) {
        Project project = new Project();
        project.setProjectId(UUID.randomUUID().toString());
        project.setTitle(title);
        project.setDescription("Test project description");
        project.setDepth(1);
        project.setCourseLevel(100);
        project.setStatus(ProjectStatus.TODO);
        project.setOwner(owner);
        project.setEpics(new ArrayList<>());
        return project;
    }

    public static Epic createTestEpic() {
        return createTestEpic("Test Epic");
    }

    public static Epic createTestEpic(String title) {
        Epic epic = new Epic();
        epic.setEpicId(UUID.randomUUID().toString());
        epic.setTitle(title);
        epic.setDescription("Test epic description");
        epic.setDepth(2);
        epic.setStatus(EpicStatus.TODO);
        epic.setFeatures(new ArrayList<>());
        return epic;
    }

    public static Feature createTestFeature() {
        return createTestFeature("Test Feature");
    }

    public static Feature createTestFeature(String title) {
        Feature feature = new Feature();
        feature.setFeatureId(UUID.randomUUID().toString());
        feature.setTitle(title);
        feature.setDescription("Test feature description");
        feature.setDepth(3);
        feature.setStatus(FeatureStatus.TODO);
        feature.setTasks(new ArrayList<>());
        return feature;
    }

    public static Task createTestTask() {
        return createTestTask("Test Task");
    }

    public static Task createTestTask(String title) {
        Task task = new Task();
        task.setTaskId(UUID.randomUUID().toString());
        task.setTitle(title);
        task.setDescription("Test task description");
        task.setDepth(4);
        task.setStatus(TaskStatus.IN_PROGRESS);
        return task;
    }

    public static Project createFullTestProject() {
        User owner = createTestUser();
        Project project = createTestProject("Full Test Project", owner);
        
        Epic epic1 = createTestEpic("Epic 1");
        Epic epic2 = createTestEpic("Epic 2");
        
        Feature feature1 = createTestFeature("Feature 1");
        Feature feature2 = createTestFeature("Feature 2");
        
        Task task1 = createTestTask("Task 1");
        Task task2 = createTestTask("Task 2");
        Task task3 = createTestTask("Task 3");
        
        feature1.getTasks().add(task1);
        feature1.getTasks().add(task2);
        feature2.getTasks().add(task3);
        
        epic1.getFeatures().add(feature1);
        epic2.getFeatures().add(feature2);
        
        project.getEpics().add(epic1);
        project.getEpics().add(epic2);
        
        return project;
    }
}