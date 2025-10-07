package bachelor.projectmanagement.graphql;

import bachelor.projectmanagement.model.*;
import bachelor.projectmanagement.service.ProjectService;
import bachelor.projectmanagement.util.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectResolverTest {

    @Mock
    private ProjectService projectService;

    @InjectMocks
    private ProjectResolver projectResolver;

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
    void projectsByUsername_ShouldReturnProjects() {
        // Given
        List<Project> projects = List.of(testProject);
        when(projectService.getProjectsByUsername("testuser")).thenReturn(projects);

        // When
        List<Project> result = projectResolver.projectsByUsername("testuser");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testProject, result.get(0));
        verify(projectService).getProjectsByUsername("testuser");
    }

    @Test
    void projectById_ShouldReturnProject() {
        // Given
        when(projectService.getProjectById(testProject.getProjectId())).thenReturn(testProject);

        // When
        Project result = projectResolver.projectById(testProject.getProjectId());

        // Then
        assertNotNull(result);
        assertEquals(testProject, result);
        verify(projectService).getProjectById(testProject.getProjectId());
    }

    @Test
    void updateProjectTitle_ShouldUpdateTitleSuccessfully() {
        // Given
        String newTitle = "Updated Project Title";
        when(projectService.getProjectById(testProject.getProjectId())).thenReturn(testProject);
        when(projectService.save(any(Project.class))).thenReturn(testProject);

        // When
        Project result = projectResolver.updateProjectTitle(testProject.getProjectId(), newTitle);

        // Then
        assertNotNull(result);
        assertEquals(newTitle, testProject.getTitle());
        verify(projectService).getProjectById(testProject.getProjectId());
        verify(projectService).save(testProject);
    }

    @Test
    void updateProjectTitle_ShouldThrowExceptionWhenProjectNotFound() {
        // Given
        when(projectService.getProjectById("nonexistent")).thenReturn(null);

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            projectResolver.updateProjectTitle("nonexistent", "New Title"));
        verify(projectService).getProjectById("nonexistent");
        verify(projectService, never()).save(any(Project.class));
    }

    @Test
    void updateProjectDescription_ShouldUpdateDescriptionSuccessfully() {
        // Given
        String newDescription = "Updated Project Description";
        when(projectService.getProjectById(testProject.getProjectId())).thenReturn(testProject);
        when(projectService.save(any(Project.class))).thenReturn(testProject);

        // When
        Project result = projectResolver.updateProjectDescription(testProject.getProjectId(), newDescription);

        // Then
        assertNotNull(result);
        assertEquals(newDescription, testProject.getDescription());
        verify(projectService).getProjectById(testProject.getProjectId());
        verify(projectService).save(testProject);
    }

    @Test
    void updateEpicTitle_ShouldUpdateEpicTitleSuccessfully() {
        // Given
        String newTitle = "Updated Epic Title";
        Epic updatedEpic = TestDataBuilder.createTestEpic(newTitle);
        updatedEpic.setEpicId(testEpic.getEpicId());

        // ADD THIS MISSING MOCK - the resolver calls getEpicById first!
        when(projectService.getEpicById(eq(testProject.getProjectId()), eq(testEpic.getEpicId())))
            .thenReturn(testEpic);
        
        // Use eq() for all parameters to avoid matcher mixing
        when(projectService.saveEpic(eq(testProject.getProjectId()), any(Epic.class))).thenReturn(updatedEpic);

        // When
        Epic result = projectResolver.updateEpicTitle(testProject.getProjectId(), testEpic.getEpicId(), newTitle);

        // Then
        assertNotNull(result);
        assertEquals(newTitle, result.getTitle());
        
        // ADD VERIFICATION FOR THE MISSING CALL
        verify(projectService).getEpicById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()));
        verify(projectService).saveEpic(eq(testProject.getProjectId()), any(Epic.class));
    }

    @Test
    void updateEpicDescription_ShouldUpdateEpicDescriptionSuccessfully() {
        // Given
        String newDescription = "Updated Epic Description";
        Epic updatedEpic = TestDataBuilder.createTestEpic();
        updatedEpic.setEpicId(testEpic.getEpicId());
        updatedEpic.setDescription(newDescription);

        // Mock getEpicById first
        when(projectService.getEpicById(eq(testProject.getProjectId()), eq(testEpic.getEpicId())))
            .thenReturn(testEpic);
        when(projectService.saveEpic(eq(testProject.getProjectId()), any(Epic.class)))
            .thenReturn(updatedEpic);

        // When
        Epic result = projectResolver.updateEpicDescription(testProject.getProjectId(), testEpic.getEpicId(), newDescription);

        // Then
        assertNotNull(result);
        assertEquals(newDescription, result.getDescription());
        verify(projectService).getEpicById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()));
        verify(projectService).saveEpic(eq(testProject.getProjectId()), any(Epic.class));
    }

    @Test
    void updateFeatureTitle_ShouldUpdateFeatureTitleSuccessfully() {
        // Given
        String newTitle = "Updated Feature Title";
        Feature updatedFeature = TestDataBuilder.createTestFeature(newTitle);
        updatedFeature.setFeatureId(testFeature.getFeatureId());

        // Mock getFeatureById first
        when(projectService.getFeatureById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId())))
            .thenReturn(testFeature);
        when(projectService.saveFeature(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), any(Feature.class)))
            .thenReturn(updatedFeature);

        // When
        Feature result = projectResolver.updateFeatureTitle(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), newTitle);

        // Then
        assertNotNull(result);
        assertEquals(newTitle, result.getTitle());
        verify(projectService).getFeatureById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()));
        verify(projectService).saveFeature(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), any(Feature.class));
    }

    @Test
    void updateFeatureDescription_ShouldUpdateFeatureDescriptionSuccessfully() {
        // Given
        String newDescription = "Updated Feature Description";
        Feature updatedFeature = TestDataBuilder.createTestFeature();
        updatedFeature.setFeatureId(testFeature.getFeatureId());
        updatedFeature.setDescription(newDescription);

        // Mock getFeatureById first
        when(projectService.getFeatureById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId())))
            .thenReturn(testFeature);
        when(projectService.saveFeature(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), any(Feature.class)))
            .thenReturn(updatedFeature);

        // When
        Feature result = projectResolver.updateFeatureDescription(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), newDescription);

        // Then
        assertNotNull(result);
        assertEquals(newDescription, result.getDescription());
        verify(projectService).getFeatureById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()));
        verify(projectService).saveFeature(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), any(Feature.class));
    }

    @Test
    void updateTaskTitle_ShouldUpdateTaskTitleSuccessfully() {
        // Given
        String newTitle = "Updated Task Title";
        Task updatedTask = TestDataBuilder.createTestTask(newTitle);
        updatedTask.setTaskId(testTask.getTaskId());

        // Mock getTaskById first
        when(projectService.getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), eq(testTask.getTaskId())))
            .thenReturn(testTask);
        when(projectService.saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), any(Task.class)))
            .thenReturn(updatedTask);

        // When
        Task result = projectResolver.updateTaskTitle(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask.getTaskId(), newTitle);

        // Then
        assertNotNull(result);
        assertEquals(newTitle, result.getTitle());
        verify(projectService).getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), eq(testTask.getTaskId()));
        verify(projectService).saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), any(Task.class));
    }

    @Test
    void updateTaskDescription_ShouldUpdateTaskDescriptionSuccessfully() {
        // Given
        String newDescription = "Updated Task Description";
        Task updatedTask = TestDataBuilder.createTestTask();
        updatedTask.setTaskId(testTask.getTaskId());
        updatedTask.setDescription(newDescription);

        // Mock getTaskById first
        when(projectService.getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), eq(testTask.getTaskId())))
            .thenReturn(testTask);
        when(projectService.saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), any(Task.class)))
            .thenReturn(updatedTask);

        // When
        Task result = projectResolver.updateTaskDescription(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask.getTaskId(), newDescription);

        // Then
        assertNotNull(result);
        assertEquals(newDescription, result.getDescription());
        verify(projectService).getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), eq(testTask.getTaskId()));
        verify(projectService).saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), any(Task.class));
    }

    @Test
    void updateTaskStatus_ShouldUpdateTaskStatusSuccessfully() {
        // Given
        TaskStatus newStatus = TaskStatus.COMPLETED; // Changed from COMPLETED to DONE
        Task updatedTask = TestDataBuilder.createTestTask();
        updatedTask.setTaskId(testTask.getTaskId());
        updatedTask.setStatus(newStatus);

        // Mock getTaskById first
        when(projectService.getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), eq(testTask.getTaskId())))
            .thenReturn(testTask);
        when(projectService.saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), any(Task.class)))
            .thenReturn(updatedTask);

        // When
        Task result = projectResolver.updateTaskStatus(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask.getTaskId(), newStatus.name());

        // Then
        assertNotNull(result);
        assertEquals(newStatus, result.getStatus());
        verify(projectService).getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), eq(testTask.getTaskId()));
        verify(projectService).saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), any(Task.class));
    }

    @Test
    void getAllMutations_ShouldCallServiceCorrectly() {
        // This test ensures all mutation methods are properly wired
        // Given
        when(projectService.getProjectById(anyString())).thenReturn(testProject);
        when(projectService.save(any(Project.class))).thenReturn(testProject);
        when(projectService.getEpicById(anyString(), anyString())).thenReturn(testEpic);
        when(projectService.saveEpic(anyString(), any(Epic.class))).thenReturn(testEpic);
        when(projectService.getFeatureById(anyString(), anyString(), anyString())).thenReturn(testFeature);
        when(projectService.saveFeature(anyString(), anyString(), any(Feature.class))).thenReturn(testFeature);
        when(projectService.getTaskById(anyString(), anyString(), anyString(), anyString())).thenReturn(testTask);
        when(projectService.saveTask(anyString(), anyString(), anyString(), any(Task.class))).thenReturn(testTask);

        // When & Then - Project mutations
        projectResolver.updateProjectTitle(testProject.getProjectId(), "New Title");
        projectResolver.updateProjectDescription(testProject.getProjectId(), "New Description");

        // Epic mutations
        projectResolver.updateEpicTitle(testProject.getProjectId(), testEpic.getEpicId(), "New Epic Title");
        projectResolver.updateEpicDescription(testProject.getProjectId(), testEpic.getEpicId(), "New Epic Description");

        // Feature mutations
        projectResolver.updateFeatureTitle(testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), "New Feature Title");
        projectResolver.updateFeatureDescription(testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), "New Feature Description");

        // Task mutations
        projectResolver.updateTaskTitle(testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask.getTaskId(), "New Task Title");
        projectResolver.updateTaskDescription(testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask.getTaskId(), "New Task Description");
        projectResolver.updateTaskStatus(testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask.getTaskId(), TaskStatus.COMPLETED.name());

        // Verify all service calls
        verify(projectService, times(2)).getProjectById(testProject.getProjectId());
        verify(projectService, times(2)).save(testProject);
        verify(projectService, times(2)).getEpicById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()));
        verify(projectService, times(2)).saveEpic(eq(testProject.getProjectId()), any(Epic.class));
        verify(projectService, times(2)).getFeatureById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()));
        verify(projectService, times(2)).saveFeature(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), any(Feature.class));
        verify(projectService, times(3)).getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), eq(testTask.getTaskId()));
        verify(projectService, times(3)).saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), any(Task.class));
    }

    @Test
    void deleteEpic_ShouldReturnTrueWhenSuccessful() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        
        // When
        Boolean result = projectResolver.deleteEpic(projectId, epicId);
        
        // Then
        assertTrue(result);
        verify(projectService).deleteEpicFromProject(projectId, epicId);
    }

    @Test
    void deleteEpic_ShouldThrowRuntimeExceptionWhenServiceFails() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        doThrow(new RuntimeException("Delete failed")).when(projectService).deleteEpicFromProject(projectId, epicId);
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectResolver.deleteEpic(projectId, epicId);
        });
        
        assertTrue(exception.getMessage().contains("Failed to delete epic"));
        verify(projectService).deleteEpicFromProject(projectId, epicId);
    }

    @Test
    void deleteFeature_ShouldReturnTrueWhenSuccessful() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        String featureId = testFeature.getFeatureId();
        
        // When
        Boolean result = projectResolver.deleteFeature(projectId, epicId, featureId);
        
        // Then
        assertTrue(result);
        verify(projectService).deleteFeatureFromEpic(projectId, epicId, featureId);
    }

    @Test
    void deleteFeature_ShouldThrowRuntimeExceptionWhenServiceFails() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        String featureId = testFeature.getFeatureId();
        doThrow(new RuntimeException("Delete failed")).when(projectService).deleteFeatureFromEpic(projectId, epicId, featureId);
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectResolver.deleteFeature(projectId, epicId, featureId);
        });
        
        assertTrue(exception.getMessage().contains("Failed to delete feature"));
        verify(projectService).deleteFeatureFromEpic(projectId, epicId, featureId);
    }

    @Test
    void deleteTask_ShouldReturnTrueWhenSuccessful() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        String featureId = testFeature.getFeatureId();
        String taskId = testTask.getTaskId();
        
        // When
        Boolean result = projectResolver.deleteTask(projectId, epicId, featureId, taskId);
        
        // Then
        assertTrue(result);
        verify(projectService).deleteTaskFromFeature(projectId, epicId, featureId, taskId);
    }

    @Test
    void deleteTask_ShouldThrowRuntimeExceptionWhenServiceFails() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        String featureId = testFeature.getFeatureId();
        String taskId = testTask.getTaskId();
        doThrow(new RuntimeException("Delete failed")).when(projectService).deleteTaskFromFeature(projectId, epicId, featureId, taskId);
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectResolver.deleteTask(projectId, epicId, featureId, taskId);
        });
        
        assertTrue(exception.getMessage().contains("Failed to delete task"));
        verify(projectService).deleteTaskFromFeature(projectId, epicId, featureId, taskId);
    }

    @Test
    void addEpic_ShouldReturnEpicWhenSuccessful() {
        // Given
        String projectId = testProject.getProjectId();
        String title = "New Epic";
        String description = "New Epic Description";
        Epic newEpic = TestDataBuilder.createTestEpic(title);
        newEpic.setDescription(description);
        when(projectService.addEpicToProject(eq(projectId), any(Epic.class))).thenReturn(newEpic);
        
        // When
        Epic result = projectResolver.addEpic(projectId, title, description);
        
        // Then
        assertNotNull(result);
        assertEquals(title, result.getTitle());
        assertEquals(description, result.getDescription());
        verify(projectService).addEpicToProject(eq(projectId), any(Epic.class));
    }

    @Test
    void addEpic_ShouldThrowRuntimeExceptionWhenServiceFails() {
        // Given
        String projectId = testProject.getProjectId();
        String title = "New Epic";
        String description = "New Epic Description";
        when(projectService.addEpicToProject(eq(projectId), any(Epic.class)))
                .thenThrow(new RuntimeException("Add failed"));
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectResolver.addEpic(projectId, title, description);
        });
        
        assertTrue(exception.getMessage().contains("Failed to add epic"));
        verify(projectService).addEpicToProject(eq(projectId), any(Epic.class));
    }

    @Test
    void addFeature_ShouldReturnFeatureWhenSuccessful() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        String title = "New Feature";
        String description = "New Feature Description";
        Feature newFeature = TestDataBuilder.createTestFeature(title);
        newFeature.setDescription(description);
        when(projectService.addFeatureToEpic(eq(projectId), eq(epicId), any(Feature.class))).thenReturn(newFeature);
        
        // When
        Feature result = projectResolver.addFeature(projectId, epicId, title, description);
        
        // Then
        assertNotNull(result);
        assertEquals(title, result.getTitle());
        assertEquals(description, result.getDescription());
        verify(projectService).addFeatureToEpic(eq(projectId), eq(epicId), any(Feature.class));
    }

    @Test
    void addFeature_ShouldThrowRuntimeExceptionWhenServiceFails() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        String title = "New Feature";
        String description = "New Feature Description";
        when(projectService.addFeatureToEpic(eq(projectId), eq(epicId), any(Feature.class)))
                .thenThrow(new RuntimeException("Add failed"));
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectResolver.addFeature(projectId, epicId, title, description);
        });
        
        assertTrue(exception.getMessage().contains("Failed to add feature"));
        verify(projectService).addFeatureToEpic(eq(projectId), eq(epicId), any(Feature.class));
    }

    @Test
    void addTask_ShouldReturnTaskWhenSuccessful() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        String featureId = testFeature.getFeatureId();
        String title = "New Task";
        String description = "New Task Description";
        Task newTask = TestDataBuilder.createTestTask(title);
        newTask.setDescription(description);
        when(projectService.addTaskToFeature(eq(projectId), eq(epicId), eq(featureId), any(Task.class))).thenReturn(newTask);
        
        // When
        Task result = projectResolver.addTask(projectId, epicId, featureId, title, description);
        
        // Then
        assertNotNull(result);
        assertEquals(title, result.getTitle());
        assertEquals(description, result.getDescription());
        verify(projectService).addTaskToFeature(eq(projectId), eq(epicId), eq(featureId), any(Task.class));
    }

    @Test
    void addTask_ShouldThrowRuntimeExceptionWhenServiceFails() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        String featureId = testFeature.getFeatureId();
        String title = "New Task";
        String description = "New Task Description";
        when(projectService.addTaskToFeature(eq(projectId), eq(epicId), eq(featureId), any(Task.class)))
                .thenThrow(new RuntimeException("Add failed"));
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectResolver.addTask(projectId, epicId, featureId, title, description);
        });
        
        assertTrue(exception.getMessage().contains("Failed to add task"));
        verify(projectService).addTaskToFeature(eq(projectId), eq(epicId), eq(featureId), any(Task.class));
    }
}
