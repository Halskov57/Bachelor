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
}
