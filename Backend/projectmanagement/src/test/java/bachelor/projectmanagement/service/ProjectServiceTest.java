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
        assertEquals(testUser, result.getOwner());
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
        when(projectRepository.findByOwnerId(testUser.getId())).thenReturn(projects);

        // When
        List<Project> result = projectService.getProjectsByUsername("testuser");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testProject, result.get(0));
    }

    @Test
    void getProjectsByUsername_ShouldThrowExceptionWhenUserNotFound() {
        // Given
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            projectService.getProjectsByUsername("nonexistent"));
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
        assertEquals(testUser, result.getOwner());
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
        partialUpdate.setStatus(TaskStatus.COMPLETED);

        when(projectRepository.findById(testProject.getProjectId())).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        Task result = projectService.saveTask(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), partialUpdate);

        // Then
        assertNotNull(result);
        assertEquals(TaskStatus.COMPLETED, result.getStatus());
        assertEquals(testTask.getTitle(), result.getTitle()); // Should retain original title
        verify(projectRepository).save(testProject);
    }
}
