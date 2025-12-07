package bachelor.projectmanagement.service;

import bachelor.projectmanagement.model.*;
import bachelor.projectmanagement.repository.ProjectRepository;
import bachelor.projectmanagement.repository.UserRepository;
import bachelor.projectmanagement.util.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProjectService projectService;

    private User testUser;
    private Project testProject;
    private Epic testEpic;
    private Feature testFeature;
    private Task testTask;

    @BeforeEach
    void setUp() {
        testUser = TestDataBuilder.createTestUser("testuser");
        testProject = TestDataBuilder.createTestProject("Test Project", testUser);
        testEpic = TestDataBuilder.createTestEpic("Test Epic");
        testFeature = TestDataBuilder.createTestFeature("Test Feature");
        testTask = TestDataBuilder.createTestTask("Test Task");
    }

    @Test
    void createProject_ShouldCreateProjectSuccessfully() {
        // Given
        Project newProject = TestDataBuilder.createTestProject("New Project", testUser);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(projectRepository.save(any(Project.class))).thenReturn(newProject);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        Project result = projectService.createProject(newProject, "testuser");

        // Then
        assertNotNull(result);
        assertEquals("New Project", result.getTitle());
        assertTrue(result.getOwners().contains(testUser));
        verify(projectRepository).save(any(Project.class));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createProject_ShouldThrowExceptionWhenUserNotFound() {
        // Given
        Project newProject = TestDataBuilder.createTestProject();
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            projectService.createProject(newProject, "nonexistent"));
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void getProjectsByUsername_ShouldReturnUserProjects() {
        // Given
        List<Project> projects = List.of(testProject);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(projectRepository.findByOwnersContaining(testUser.getId())).thenReturn(projects);

        // When
        List<Project> result = projectService.getProjectsByUsername("testuser");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testProject, result.get(0));
    }

    @Test
    void getProjectsByUsername_ShouldHandleEmptyResult() {
        // Given - Mock that user doesn't exist
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // When
        List<Project> result = projectService.getProjectsByUsername("nonexistent");

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void addEpicToProject_ShouldAddEpicSuccessfully() {
        // Given
        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        Epic result = projectService.addEpicToProject(testProject.getProjectId(), testEpic);

        // Then
        assertNotNull(result);
        assertEquals(testEpic.getTitle(), result.getTitle());
        assertNotNull(result.getEpicId());
        verify(projectRepository).save(testProject);
    }

    @Test
    void addEpicToProject_ShouldThrowExceptionWhenProjectNotFound() {
        // Given
        when(projectRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            projectService.addEpicToProject("nonexistent", testEpic));
    }

    @Test
    void updateEpic_ShouldUpdateEpicSuccessfully() {
        // Given
        testProject.getEpics().add(testEpic);
        Epic updatedEpic = TestDataBuilder.createTestEpic("Updated Epic Title");
        updatedEpic.setEpicId(testEpic.getEpicId());
        
        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        Epic result = projectService.updateEpic(testProject.getProjectId(), updatedEpic);

        // Then
        assertNotNull(result);
        assertEquals("Updated Epic Title", result.getTitle());
        verify(projectRepository).save(testProject);
    }

    @Test
    void updateEpic_ShouldThrowExceptionWhenEpicNotFound() {
        // Given
        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        Epic nonexistentEpic = TestDataBuilder.createTestEpic();
        nonexistentEpic.setEpicId("nonexistent");

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            projectService.updateEpic(testProject.getProjectId(), nonexistentEpic));
    }

    @Test
    void addFeatureToEpic_ShouldAddFeatureSuccessfully() {
        // Given
        testProject.getEpics().add(testEpic);
        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        Feature result = projectService.addFeatureToEpic(testProject.getProjectId(), testEpic.getEpicId(), testFeature);

        // Then
        assertNotNull(result);
        assertEquals(testFeature.getTitle(), result.getTitle());
        assertNotNull(result.getFeatureId());
        verify(projectRepository).save(testProject);
    }

    @Test
    void updateFeature_ShouldUpdateFeatureSuccessfully() {
        // Given
        testEpic.getFeatures().add(testFeature);
        testProject.getEpics().add(testEpic);
        
        Feature updatedFeature = TestDataBuilder.createTestFeature("Updated Feature");
        updatedFeature.setFeatureId(testFeature.getFeatureId());
        
        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        Feature result = projectService.updateFeature(testProject.getProjectId(), testEpic.getEpicId(), updatedFeature);

        // Then
        assertNotNull(result);
        assertEquals("Updated Feature", result.getTitle());
        verify(projectRepository).save(testProject);
    }

    @Test
    void addTaskToFeature_ShouldAddTaskSuccessfully() {
        // Given
        testFeature.getTasks().add(testTask);
        testEpic.getFeatures().add(testFeature);
        testProject.getEpics().add(testEpic);
        
        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        Task result = projectService.addTaskToFeature(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask);

        // Then
        assertNotNull(result);
        assertEquals(testTask.getTitle(), result.getTitle());
        assertNotNull(result.getTaskId());
        verify(projectRepository).save(testProject);
    }

    @Test
    void updateTask_ShouldUpdateTaskSuccessfully() {
        // Given
        testFeature.getTasks().add(testTask);
        testEpic.getFeatures().add(testFeature);
        testProject.getEpics().add(testEpic);
        
        Task updatedTask = TestDataBuilder.createTestTask("Updated Task");
        updatedTask.setTaskId(testTask.getTaskId());
        
        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        Task result = projectService.updateTask(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), updatedTask);

        // Then
        assertNotNull(result);
        assertEquals("Updated Task", result.getTitle());
        verify(projectRepository).save(testProject);
    }

    @Test
    void deleteProject_ShouldDeleteProjectSuccessfully() {
        // Given
        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));

        // When
        projectService.deleteProject(testProject.getProjectId());

        // Then
        verify(projectRepository).deleteById(testProject.getProjectId());
    }

    @Test
    void deleteProject_ShouldThrowExceptionWhenProjectNotFound() {
        // Given
        when(projectRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            projectService.deleteProject("nonexistent"));
        verify(projectRepository, never()).deleteById(anyString());
    }

    @Test
    void deleteEpicFromProject_ShouldDeleteEpicSuccessfully() {
        // Given
        testProject.getEpics().add(testEpic);
        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        projectService.deleteEpicFromProject(testProject.getProjectId(), testEpic.getEpicId());

        // Then
        assertTrue(testProject.getEpics().isEmpty());
        verify(projectRepository).save(testProject);
    }

    @Test
    void deleteFeatureFromEpic_ShouldDeleteFeatureSuccessfully() {
        // Given
        testEpic.getFeatures().add(testFeature);
        testProject.getEpics().add(testEpic);
        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        projectService.deleteFeatureFromEpic(testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId());

        // Then
        assertTrue(testEpic.getFeatures().isEmpty());
        verify(projectRepository).save(testProject);
    }

    @Test
    void deleteTaskFromFeature_ShouldDeleteTaskSuccessfully() {
        // Given
        testFeature.getTasks().add(testTask);
        testEpic.getFeatures().add(testFeature);
        testProject.getEpics().add(testEpic);
        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        projectService.deleteTaskFromFeature(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask.getTaskId());

        // Then
        assertTrue(testFeature.getTasks().isEmpty());
        verify(projectRepository).save(testProject);
    }

    @Test
    void getProjectById_ShouldReturnProject() {
        // Given
        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));

        // When
        Project result = projectService.getProjectById(testProject.getProjectId());

        // Then
        assertNotNull(result);
        assertEquals(testProject, result);
    }

    @Test
    void getProjectById_ShouldThrowExceptionWhenNotFound() {
        // Given
        when(projectRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            projectService.getProjectById("nonexistent"));
    }

    @Test
    void saveEpic_ShouldSaveEpicWithPartialUpdate() {
        // Given
        testProject.getEpics().add(testEpic);
        Epic partialUpdate = new Epic();
        partialUpdate.setEpicId(testEpic.getEpicId());
        partialUpdate.setTitle("New Title Only");

        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        Epic result = projectService.saveEpic(testProject.getProjectId(), partialUpdate);

        // Then
        assertNotNull(result);
        assertEquals("New Title Only", result.getTitle());
        assertEquals(testEpic.getDescription(), result.getDescription()); // Should retain original description
        verify(projectRepository).save(testProject);
    }

    @Test
    void saveFeature_ShouldSaveFeatureWithPartialUpdate() {
        // Given
        testEpic.getFeatures().add(testFeature);
        testProject.getEpics().add(testEpic);
        
        Feature partialUpdate = new Feature();
        partialUpdate.setFeatureId(testFeature.getFeatureId());
        partialUpdate.setDescription("New Description Only");

        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        Feature result = projectService.saveFeature(testProject.getProjectId(), testEpic.getEpicId(), partialUpdate);

        // Then
        assertNotNull(result);
        assertEquals("New Description Only", result.getDescription());
        assertEquals(testFeature.getTitle(), result.getTitle()); // Should retain original title
        verify(projectRepository).save(testProject);
    }

    @Test
    void saveTask_ShouldSaveTaskWithPartialUpdate() {
        // Given
        testFeature.getTasks().add(testTask);
        testEpic.getFeatures().add(testFeature);
        testProject.getEpics().add(testEpic);
        
        Task partialUpdate = new Task();
        partialUpdate.setTaskId(testTask.getTaskId());
        partialUpdate.setStatus(TaskStatus.DONE);

        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        Task result = projectService.saveTask(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), partialUpdate);

        // Then
        assertNotNull(result);
        assertEquals(TaskStatus.DONE, result.getStatus());
        assertEquals(testTask.getTitle(), result.getTitle()); // Should retain original title
        verify(projectRepository).save(testProject);
    }

    @Test
    void copyProjectStructure_ShouldCopyCompleteProjectStructure() {
        // Given
        Project template = TestDataBuilder.createTestProject("Template Project", testUser);
        Epic templateEpic = TestDataBuilder.createTestEpic("Template Epic");
        Feature templateFeature = TestDataBuilder.createTestFeature("Template Feature");
        Task templateTask = TestDataBuilder.createTestTask("Template Task");
        templateTask.setStatus(TaskStatus.DONE); // Template has completed status
        templateTask.setUsers(List.of("user1", "user2")); // Template has assigned users
        
        templateFeature.getTasks().add(templateTask);
        templateEpic.getFeatures().add(templateFeature);
        template.getEpics().add(templateEpic);

        when(userRepository.findByUsername("newowner")).thenReturn(Optional.of(testUser));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project saved = invocation.getArgument(0);
            saved.setProjectId("new-project-id");
            return saved;
        });
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        Project result = projectService.copyProjectStructure(
            template, "New Project", "New Description", 2, "newowner");

        // Then
        assertNotNull(result);
        assertEquals("New Project", result.getTitle());
        assertEquals("New Description", result.getDescription());
        assertEquals(2, result.getCourseLevel());
        
        // Verify epic structure copied
        assertEquals(1, result.getEpics().size());
        Epic copiedEpic = result.getEpics().get(0);
        assertEquals("Template Epic", copiedEpic.getTitle());
        
        // Verify feature structure copied
        assertEquals(1, copiedEpic.getFeatures().size());
        Feature copiedFeature = copiedEpic.getFeatures().get(0);
        assertEquals("Template Feature", copiedFeature.getTitle());
        
        // Verify task structure copied with reset status and users
        assertEquals(1, copiedFeature.getTasks().size());
        Task copiedTask = copiedFeature.getTasks().get(0);
        assertEquals("Template Task", copiedTask.getTitle());
        assertEquals(TaskStatus.TODO, copiedTask.getStatus());
        assertTrue(copiedTask.getUsers().isEmpty()); // Should start with no assigned users
        
        verify(projectRepository).save(any(Project.class));
        verify(userRepository).findByUsername("newowner");
    }

    @Test
    void copyProjectStructure_ShouldHandleMultipleEpicsAndFeatures() {
        // Given
        Project template = TestDataBuilder.createTestProject("Multi-Level Template", testUser);
        
        Epic epic1 = TestDataBuilder.createTestEpic("Epic 1");
        Epic epic2 = TestDataBuilder.createTestEpic("Epic 2");
        
        Feature feature1 = TestDataBuilder.createTestFeature("Feature 1.1");
        Feature feature2 = TestDataBuilder.createTestFeature("Feature 1.2");
        Feature feature3 = TestDataBuilder.createTestFeature("Feature 2.1");
        
        Task task1 = TestDataBuilder.createTestTask("Task 1");
        Task task2 = TestDataBuilder.createTestTask("Task 2");
        Task task3 = TestDataBuilder.createTestTask("Task 3");
        
        feature1.getTasks().add(task1);
        feature1.getTasks().add(task2);
        feature2.getTasks().add(task3);
        
        epic1.getFeatures().add(feature1);
        epic1.getFeatures().add(feature2);
        epic2.getFeatures().add(feature3);
        
        template.getEpics().add(epic1);
        template.getEpics().add(epic2);

        when(userRepository.findByUsername("newowner")).thenReturn(Optional.of(testUser));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project saved = invocation.getArgument(0);
            saved.setProjectId("new-project-id");
            return saved;
        });
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        Project result = projectService.copyProjectStructure(
            template, "Complex Project", "Complex Description", 3, "newowner");

        // Then
        assertNotNull(result);
        assertEquals(2, result.getEpics().size());
        assertEquals(2, result.getEpics().get(0).getFeatures().size());
        assertEquals(1, result.getEpics().get(1).getFeatures().size());
        assertEquals(2, result.getEpics().get(0).getFeatures().get(0).getTasks().size());
        assertEquals(1, result.getEpics().get(0).getFeatures().get(1).getTasks().size());
        
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void copyProjectStructure_ShouldHandleEmptyTemplate() {
        // Given
        Project template = TestDataBuilder.createTestProject("Empty Template", testUser);
        template.setEpics(List.of()); // Empty epics list

        when(userRepository.findByUsername("newowner")).thenReturn(Optional.of(testUser));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project saved = invocation.getArgument(0);
            saved.setProjectId("new-project-id");
            return saved;
        });
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        Project result = projectService.copyProjectStructure(
            template, "Empty Project", "Empty Description", 1, "newowner");

        // Then
        assertNotNull(result);
        assertEquals("Empty Project", result.getTitle());
        assertEquals("Empty Description", result.getDescription());
        assertTrue(result.getEpics().isEmpty());
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void copyProjectStructure_ShouldHandleNullEpicsList() {
        // Given
        Project template = TestDataBuilder.createTestProject("Null Epics Template", testUser);
        template.setEpics(null); // Null epics list

        when(userRepository.findByUsername("newowner")).thenReturn(Optional.of(testUser));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project saved = invocation.getArgument(0);
            saved.setProjectId("new-project-id");
            return saved;
        });
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        Project result = projectService.copyProjectStructure(
            template, "Project From Null", "Description", 1, "newowner");

        // Then
        assertNotNull(result);
        assertNotNull(result.getEpics());
        assertTrue(result.getEpics().isEmpty());
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void copyProjectStructure_ShouldHandleEpicWithNullFeatures() {
        // Given
        Project template = TestDataBuilder.createTestProject("Template", testUser);
        Epic epic = TestDataBuilder.createTestEpic("Epic With Null Features");
        epic.setFeatures(null);
        template.getEpics().add(epic);

        when(userRepository.findByUsername("newowner")).thenReturn(Optional.of(testUser));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project saved = invocation.getArgument(0);
            saved.setProjectId("new-project-id");
            return saved;
        });
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        Project result = projectService.copyProjectStructure(
            template, "Project", "Description", 1, "newowner");

        // Then
        assertNotNull(result);
        assertEquals(1, result.getEpics().size());
        assertNotNull(result.getEpics().get(0).getFeatures());
        assertTrue(result.getEpics().get(0).getFeatures().isEmpty());
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void copyProjectStructure_ShouldHandleFeatureWithNullTasks() {
        // Given
        Project template = TestDataBuilder.createTestProject("Template", testUser);
        Epic epic = TestDataBuilder.createTestEpic("Epic");
        Feature feature = TestDataBuilder.createTestFeature("Feature With Null Tasks");
        feature.setTasks(null);
        epic.getFeatures().add(feature);
        template.getEpics().add(epic);

        when(userRepository.findByUsername("newowner")).thenReturn(Optional.of(testUser));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project saved = invocation.getArgument(0);
            saved.setProjectId("new-project-id");
            return saved;
        });
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        Project result = projectService.copyProjectStructure(
            template, "Project", "Description", 1, "newowner");

        // Then
        assertNotNull(result);
        assertEquals(1, result.getEpics().size());
        assertEquals(1, result.getEpics().get(0).getFeatures().size());
        assertNotNull(result.getEpics().get(0).getFeatures().get(0).getTasks());
        assertTrue(result.getEpics().get(0).getFeatures().get(0).getTasks().isEmpty());
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void copyProjectStructure_ShouldCopyTaskAndFeatureDescriptions() {
        // Given
        Project template = TestDataBuilder.createTestProject("Template", testUser);
        Epic epic = TestDataBuilder.createTestEpic("Epic");
        epic.setDescription("Epic Description");
        
        Feature feature = TestDataBuilder.createTestFeature("Feature");
        feature.setDescription("Feature Description");
        
        Task task = TestDataBuilder.createTestTask("Task");
        task.setDescription("Task Description");
        
        feature.getTasks().add(task);
        epic.getFeatures().add(feature);
        template.getEpics().add(epic);

        when(userRepository.findByUsername("newowner")).thenReturn(Optional.of(testUser));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project saved = invocation.getArgument(0);
            saved.setProjectId("new-project-id");
            return saved;
        });
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        Project result = projectService.copyProjectStructure(
            template, "New Project", "New Description", 2, "newowner");

        // Then
        assertNotNull(result);
        assertEquals("Epic Description", result.getEpics().get(0).getDescription());
        assertEquals("Feature Description", result.getEpics().get(0).getFeatures().get(0).getDescription());
        assertEquals("Task Description", result.getEpics().get(0).getFeatures().get(0).getTasks().get(0).getDescription());
    }

    @Test
    void copyProjectStructure_ShouldCallCreateProjectWithCorrectParameters() {
        // Given
        Project template = TestDataBuilder.createTestProject("Template", testUser);
        Epic epic = TestDataBuilder.createTestEpic("Epic");
        template.getEpics().add(epic);

        when(userRepository.findByUsername("testowner")).thenReturn(Optional.of(testUser));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project saved = invocation.getArgument(0);
            saved.setProjectId("new-project-id");
            return saved;
        });
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        Project result = projectService.copyProjectStructure(
            template, "Specific Title", "Specific Description", 4, "testowner");

        // Then
        assertNotNull(result);
        assertEquals("Specific Title", result.getTitle());
        assertEquals("Specific Description", result.getDescription());
        assertEquals(4, result.getCourseLevel());
        assertTrue(result.getOwners().contains(testUser));
        verify(userRepository).findByUsername("testowner");
        verify(projectRepository).save(any(Project.class));
        verify(userRepository).save(any(User.class));
    }
}
