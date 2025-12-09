package bachelor.projectmanagement.graphql;

import bachelor.projectmanagement.graphql.input.*;
import bachelor.projectmanagement.model.*;
import bachelor.projectmanagement.service.ProjectService;
import bachelor.projectmanagement.service.SSEService;
import bachelor.projectmanagement.service.CourseLevelConfigService;
import bachelor.projectmanagement.repository.UserRepository;
import bachelor.projectmanagement.util.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectResolverTest {

    @Mock
    private ProjectService projectService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SSEService sseService;

    @Mock
    private CourseLevelConfigService courseLevelConfigService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

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

        // Mock Spring Security context to provide authenticated user (lenient for tests that don't use it)
        lenient().when(authentication.isAuthenticated()).thenReturn(true);
        lenient().when(authentication.getName()).thenReturn("testuser");
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Mock verifyProjectAccess to do nothing (allow access) - lenient for tests that don't need it
        lenient().doNothing().when(projectService).verifyProjectAccess(anyString(), anyString());
    }

    @AfterEach
    void tearDown() {
        // Clear the security context after each test
        SecurityContextHolder.clearContext();
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
    void updateProject_ShouldUpdateAllFieldsSuccessfully() {
        // Given
        ProjectInput input = new ProjectInput();
        input.setTitle("Updated Project Title");
        input.setDescription("Updated Project Description");
        input.setCourseLevel(2);
        
        when(projectService.getProjectById(testProject.getProjectId())).thenReturn(testProject);
        when(projectService.save(any(Project.class))).thenReturn(testProject);

        // When
        Project result = projectResolver.updateProject(testProject.getProjectId(), input);

        // Then
        assertNotNull(result);
        assertEquals("Updated Project Title", testProject.getTitle());
        assertEquals("Updated Project Description", testProject.getDescription());
        assertEquals(2, testProject.getCourseLevel());
        verify(projectService).getProjectById(testProject.getProjectId());
        verify(projectService).save(testProject);
        verify(sseService).sendProjectUpdate(eq(testProject.getProjectId()), anyMap());
    }

    @Test
    void updateProject_ShouldUpdateOnlyProvidedFields() {
        // Given
        ProjectInput input = new ProjectInput();
        input.setTitle("Updated Title Only");
        
        when(projectService.getProjectById(testProject.getProjectId())).thenReturn(testProject);
        when(projectService.save(any(Project.class))).thenReturn(testProject);

        // When
        Project result = projectResolver.updateProject(testProject.getProjectId(), input);

        // Then
        assertNotNull(result);
        assertEquals("Updated Title Only", testProject.getTitle());
        verify(projectService).save(testProject);
    }

    @Test
    void updateProject_ShouldThrowExceptionWhenProjectNotFound() {
        // Given
        ProjectInput input = new ProjectInput();
        input.setTitle("New Title");
        when(projectService.getProjectById("nonexistent")).thenReturn(null);

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            projectResolver.updateProject("nonexistent", input));
        verify(projectService).getProjectById("nonexistent");
        verify(projectService, never()).save(any(Project.class));
    }

    @Test
    void updateEpic_ShouldUpdateEpicTitleSuccessfully() {
        // Given
        String newTitle = "Updated Epic Title";
        EpicInput input = new EpicInput();
        input.setTitle(newTitle);
        
        Epic updatedEpic = TestDataBuilder.createTestEpic(newTitle);
        updatedEpic.setEpicId(testEpic.getEpicId());

        when(projectService.getEpicById(eq(testProject.getProjectId()), eq(testEpic.getEpicId())))
            .thenReturn(testEpic);
        when(projectService.saveEpic(eq(testProject.getProjectId()), any(Epic.class))).thenReturn(updatedEpic);

        // When
        Epic result = projectResolver.updateEpic(testProject.getProjectId(), testEpic.getEpicId(), input);

        // Then
        assertNotNull(result);
        assertEquals(newTitle, result.getTitle());
        verify(projectService).getEpicById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()));
        verify(projectService).saveEpic(eq(testProject.getProjectId()), any(Epic.class));
    }

    @Test
    void updateEpic_ShouldUpdateEpicDescriptionSuccessfully() {
        // Given
        String newDescription = "Updated Epic Description";
        EpicInput input = new EpicInput();
        input.setDescription(newDescription);
        
        Epic updatedEpic = TestDataBuilder.createTestEpic();
        updatedEpic.setEpicId(testEpic.getEpicId());
        updatedEpic.setDescription(newDescription);

        when(projectService.getEpicById(eq(testProject.getProjectId()), eq(testEpic.getEpicId())))
            .thenReturn(testEpic);
        when(projectService.saveEpic(eq(testProject.getProjectId()), any(Epic.class)))
            .thenReturn(updatedEpic);

        // When
        Epic result = projectResolver.updateEpic(testProject.getProjectId(), testEpic.getEpicId(), input);

        // Then
        assertNotNull(result);
        assertEquals(newDescription, result.getDescription());
        verify(projectService).getEpicById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()));
        verify(projectService).saveEpic(eq(testProject.getProjectId()), any(Epic.class));
    }

    @Test
    void updateFeature_ShouldUpdateFeatureTitleSuccessfully() {
        // Given
        String newTitle = "Updated Feature Title";
        FeatureInput input = new FeatureInput();
        input.setTitle(newTitle);
        
        Feature updatedFeature = TestDataBuilder.createTestFeature(newTitle);
        updatedFeature.setFeatureId(testFeature.getFeatureId());

        when(projectService.getFeatureById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId())))
            .thenReturn(testFeature);
        when(projectService.saveFeature(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), any(Feature.class)))
            .thenReturn(updatedFeature);

        // When
        Feature result = projectResolver.updateFeature(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), input);

        // Then
        assertNotNull(result);
        assertEquals(newTitle, result.getTitle());
        verify(projectService).getFeatureById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()));
        verify(projectService).saveFeature(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), any(Feature.class));
    }

    @Test
    void updateFeature_ShouldUpdateFeatureDescriptionSuccessfully() {
        // Given
        String newDescription = "Updated Feature Description";
        FeatureInput input = new FeatureInput();
        input.setDescription(newDescription);
        
        Feature updatedFeature = TestDataBuilder.createTestFeature();
        updatedFeature.setFeatureId(testFeature.getFeatureId());
        updatedFeature.setDescription(newDescription);

        when(projectService.getFeatureById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId())))
            .thenReturn(testFeature);
        when(projectService.saveFeature(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), any(Feature.class)))
            .thenReturn(updatedFeature);

        // When
        Feature result = projectResolver.updateFeature(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), input);

        // Then
        assertNotNull(result);
        assertEquals(newDescription, result.getDescription());
        verify(projectService).getFeatureById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()));
        verify(projectService).saveFeature(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), any(Feature.class));
    }

    @Test
    void updateTask_ShouldUpdateTaskTitleSuccessfully() {
        // Given
        String newTitle = "Updated Task Title";
        TaskInput input = new TaskInput();
        input.setTitle(newTitle);
        
        Task updatedTask = TestDataBuilder.createTestTask(newTitle);
        updatedTask.setTaskId(testTask.getTaskId());

        when(projectService.getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), eq(testTask.getTaskId())))
            .thenReturn(testTask);
        when(projectService.saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), any(Task.class)))
            .thenReturn(updatedTask);

        // When
        Task result = projectResolver.updateTask(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask.getTaskId(), input);

        // Then
        assertNotNull(result);
        assertEquals(newTitle, result.getTitle());
        verify(projectService).getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), eq(testTask.getTaskId()));
        verify(projectService).saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), any(Task.class));
    }

    @Test
    void updateTask_ShouldUpdateTaskDescriptionSuccessfully() {
        // Given
        String newDescription = "Updated Task Description";
        TaskInput input = new TaskInput();
        input.setDescription(newDescription);
        
        Task updatedTask = TestDataBuilder.createTestTask();
        updatedTask.setTaskId(testTask.getTaskId());
        updatedTask.setDescription(newDescription);

        when(projectService.getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), eq(testTask.getTaskId())))
            .thenReturn(testTask);
        when(projectService.saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), any(Task.class)))
            .thenReturn(updatedTask);

        // When
        Task result = projectResolver.updateTask(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask.getTaskId(), input);

        // Then
        assertNotNull(result);
        assertEquals(newDescription, result.getDescription());
        verify(projectService).getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), eq(testTask.getTaskId()));
        verify(projectService).saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), any(Task.class));
    }

    @Test
    void updateTask_ShouldUpdateTaskStatusSuccessfully() {
        // Given
        TaskStatus newStatus = TaskStatus.DONE;
        TaskInput input = new TaskInput();
        input.setStatus(newStatus.name());
        
        Task updatedTask = TestDataBuilder.createTestTask();
        updatedTask.setTaskId(testTask.getTaskId());
        updatedTask.setStatus(newStatus);

        when(projectService.getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), eq(testTask.getTaskId())))
            .thenReturn(testTask);
        when(projectService.saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), eq(testFeature.getFeatureId()), any(Task.class)))
            .thenReturn(updatedTask);

        // When
        Task result = projectResolver.updateTask(
            testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask.getTaskId(), input);

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
        ProjectInput projectInput = new ProjectInput();
        projectInput.setTitle("New Title");
        projectResolver.updateProject(testProject.getProjectId(), projectInput);
        
        projectInput = new ProjectInput();
        projectInput.setDescription("New Description");
        projectResolver.updateProject(testProject.getProjectId(), projectInput);

        // Epic mutations
        EpicInput epicInput = new EpicInput();
        epicInput.setTitle("New Epic Title");
        projectResolver.updateEpic(testProject.getProjectId(), testEpic.getEpicId(), epicInput);
        
        epicInput = new EpicInput();
        epicInput.setDescription("New Epic Description");
        projectResolver.updateEpic(testProject.getProjectId(), testEpic.getEpicId(), epicInput);

        // Feature mutations
        FeatureInput featureInput = new FeatureInput();
        featureInput.setTitle("New Feature Title");
        projectResolver.updateFeature(testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), featureInput);
        
        featureInput = new FeatureInput();
        featureInput.setDescription("New Feature Description");
        projectResolver.updateFeature(testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), featureInput);

        // Task mutations
        TaskInput taskInput = new TaskInput();
        taskInput.setTitle("New Task Title");
        projectResolver.updateTask(testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask.getTaskId(), taskInput);
        
        taskInput = new TaskInput();
        taskInput.setDescription("New Task Description");
        projectResolver.updateTask(testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask.getTaskId(), taskInput);
        
        taskInput = new TaskInput();
        taskInput.setStatus(TaskStatus.DONE.name());
        projectResolver.updateTask(testProject.getProjectId(), testEpic.getEpicId(), testFeature.getFeatureId(), testTask.getTaskId(), taskInput);

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
    void createEpic_ShouldReturnEpicWhenSuccessful() {
        // Given
        String projectId = testProject.getProjectId();
        CreateEpicInput input = new CreateEpicInput();
        input.setTitle("New Epic");
        input.setDescription("New Epic Description");
        
        Epic newEpic = TestDataBuilder.createTestEpic(input.getTitle());
        newEpic.setDescription(input.getDescription());
        when(projectService.addEpicToProject(eq(projectId), any(Epic.class))).thenReturn(newEpic);
        
        // When
        Epic result = projectResolver.createEpic(projectId, input);
        
        // Then
        assertNotNull(result);
        assertEquals(input.getTitle(), result.getTitle());
        assertEquals(input.getDescription(), result.getDescription());
        verify(projectService).addEpicToProject(eq(projectId), any(Epic.class));
    }

    @Test
    void createEpic_ShouldThrowRuntimeExceptionWhenServiceFails() {
        // Given
        String projectId = testProject.getProjectId();
        CreateEpicInput input = new CreateEpicInput();
        input.setTitle("New Epic");
        input.setDescription("New Epic Description");
        
        when(projectService.addEpicToProject(eq(projectId), any(Epic.class)))
                .thenThrow(new RuntimeException("Add failed"));
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectResolver.createEpic(projectId, input);
        });
        
        assertTrue(exception.getMessage().contains("Add failed"));
        verify(projectService).addEpicToProject(eq(projectId), any(Epic.class));
    }

    @Test
    void createFeature_ShouldReturnFeatureWhenSuccessful() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        CreateFeatureInput input = new CreateFeatureInput();
        input.setTitle("New Feature");
        input.setDescription("New Feature Description");
        
        Feature newFeature = TestDataBuilder.createTestFeature(input.getTitle());
        newFeature.setDescription(input.getDescription());
        when(projectService.addFeatureToEpic(eq(projectId), eq(epicId), any(Feature.class))).thenReturn(newFeature);
        
        // When
        Feature result = projectResolver.createFeature(projectId, epicId, input);
        
        // Then
        assertNotNull(result);
        assertEquals(input.getTitle(), result.getTitle());
        assertEquals(input.getDescription(), result.getDescription());
        verify(projectService).addFeatureToEpic(eq(projectId), eq(epicId), any(Feature.class));
    }

    @Test
    void createFeature_ShouldThrowRuntimeExceptionWhenServiceFails() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        CreateFeatureInput input = new CreateFeatureInput();
        input.setTitle("New Feature");
        input.setDescription("New Feature Description");
        
        when(projectService.addFeatureToEpic(eq(projectId), eq(epicId), any(Feature.class)))
                .thenThrow(new RuntimeException("Add failed"));
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectResolver.createFeature(projectId, epicId, input);
        });
        
        assertTrue(exception.getMessage().contains("Add failed"));
        verify(projectService).addFeatureToEpic(eq(projectId), eq(epicId), any(Feature.class));
    }

    @Test
    void createTask_ShouldReturnTaskWhenSuccessful() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        String featureId = testFeature.getFeatureId();
        CreateTaskInput input = new CreateTaskInput();
        input.setTitle("New Task");
        input.setDescription("New Task Description");
        
        Task newTask = TestDataBuilder.createTestTask(input.getTitle());
        newTask.setDescription(input.getDescription());
        when(projectService.addTaskToFeature(eq(projectId), eq(epicId), eq(featureId), any(Task.class))).thenReturn(newTask);
        
        // When
        Task result = projectResolver.createTask(projectId, epicId, featureId, input);
        
        // Then
        assertNotNull(result);
        assertEquals(input.getTitle(), result.getTitle());
        assertEquals(input.getDescription(), result.getDescription());
        verify(projectService).addTaskToFeature(eq(projectId), eq(epicId), eq(featureId), any(Task.class));
    }

    @Test
    void createTask_ShouldThrowRuntimeExceptionWhenServiceFails() {
        // Given
        String projectId = testProject.getProjectId();
        String epicId = testEpic.getEpicId();
        String featureId = testFeature.getFeatureId();
        CreateTaskInput input = new CreateTaskInput();
        input.setTitle("New Task");
        input.setDescription("New Task Description");
        
        when(projectService.addTaskToFeature(eq(projectId), eq(epicId), eq(featureId), any(Task.class)))
                .thenThrow(new RuntimeException("Add failed"));
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectResolver.createTask(projectId, epicId, featureId, input);
        });
        
        assertTrue(exception.getMessage().contains("Add failed"));
        verify(projectService).addTaskToFeature(eq(projectId), eq(epicId), eq(featureId), any(Task.class));
    }

    @Test
    void updateTask_ShouldUpdateDueDateSuccessfully() {
        // Given
        String newDueDate = "2025-12-31";
        TaskInput input = new TaskInput();
        input.setDueDate(newDueDate);
        
        Task updatedTask = TestDataBuilder.createTestTask();
        updatedTask.setTaskId(testTask.getTaskId());
        updatedTask.setDueDate(java.time.LocalDate.parse(newDueDate));

        when(projectService.getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), 
            eq(testFeature.getFeatureId()), eq(testTask.getTaskId()))).thenReturn(testTask);
        when(projectService.saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), 
            eq(testFeature.getFeatureId()), any(Task.class))).thenReturn(updatedTask);

        // When
        Task result = projectResolver.updateTask(testProject.getProjectId(), testEpic.getEpicId(), 
            testFeature.getFeatureId(), testTask.getTaskId(), input);

        // Then
        assertNotNull(result);
        assertEquals(java.time.LocalDate.parse(newDueDate), result.getDueDate());
        verify(projectService).getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), 
            eq(testFeature.getFeatureId()), eq(testTask.getTaskId()));
        verify(projectService).saveTask(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), 
            eq(testFeature.getFeatureId()), any(Task.class));
        verify(sseService).sendTaskUpdate(eq(testProject.getProjectId()), anyMap());
    }

    @Test
    void updateTask_ShouldHandleEmptyDueDate() {
        // Given
        TaskInput input = new TaskInput();
        input.setDueDate(""); // Empty string clears the due date
        
        Task updatedTask = TestDataBuilder.createTestTask();
        updatedTask.setTaskId(testTask.getTaskId());
        updatedTask.setDueDate(null);

        when(projectService.getTaskById(anyString(), anyString(), anyString(), anyString())).thenReturn(testTask);
        when(projectService.saveTask(anyString(), anyString(), anyString(), any(Task.class))).thenReturn(updatedTask);

        // When
        Task result = projectResolver.updateTask(testProject.getProjectId(), testEpic.getEpicId(), 
            testFeature.getFeatureId(), testTask.getTaskId(), input);

        // Then
        assertNotNull(result);
        assertNull(result.getDueDate());
        verify(projectService).saveTask(anyString(), anyString(), anyString(), any(Task.class));
    }

    @Test
    void updateTask_ShouldThrowExceptionForInvalidDateFormat() {
        // Given
        TaskInput input = new TaskInput();
        input.setDueDate("invalid-date");
        
        when(projectService.getTaskById(anyString(), anyString(), anyString(), anyString())).thenReturn(testTask);

        // When & Then - DateTimeParseException is thrown directly
        assertThrows(Exception.class, () -> {
            projectResolver.updateTask(testProject.getProjectId(), testEpic.getEpicId(), 
                testFeature.getFeatureId(), testTask.getTaskId(), input);
        });

        verify(projectService, never()).saveTask(anyString(), anyString(), anyString(), any(Task.class));
    }

    @Test
    void updateTask_ShouldThrowExceptionWhenTaskNotFoundForDueDate() {
        // Given
        TaskInput input = new TaskInput();
        input.setDueDate("2025-12-31");
        
        when(projectService.getTaskById(anyString(), anyString(), anyString(), anyString())).thenReturn(null);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectResolver.updateTask(testProject.getProjectId(), testEpic.getEpicId(), 
                testFeature.getFeatureId(), "nonexistent", input);
        });

        assertTrue(exception.getMessage().contains("Task not found"));
        verify(projectService, never()).saveTask(anyString(), anyString(), anyString(), any(Task.class));
    }

    @Test
    void updateTask_ShouldUpdateUsersSuccessfully() {
        // Given
        User user1 = TestDataBuilder.createTestUser("user1");
        User user2 = TestDataBuilder.createTestUser("user2");
        TaskInput input = new TaskInput();
        input.setUserIds(List.of("user1", "user2"));
        
        Task updatedTask = TestDataBuilder.createTestTask();
        updatedTask.setTaskId(testTask.getTaskId());
        updatedTask.setUsers(List.of(user1.getId(), user2.getId()));

        when(projectService.getProjectById(testProject.getProjectId())).thenReturn(testProject);
        when(courseLevelConfigService.isTaskUserAssignmentEnabled(anyInt())).thenReturn(true);
        when(projectService.getTaskById(anyString(), anyString(), anyString(), anyString())).thenReturn(testTask);
        when(userRepository.findByUsername("user1")).thenReturn(java.util.Optional.of(user1));
        when(userRepository.findByUsername("user2")).thenReturn(java.util.Optional.of(user2));
        when(userRepository.findById(user1.getId())).thenReturn(java.util.Optional.of(user1));
        when(userRepository.findById(user2.getId())).thenReturn(java.util.Optional.of(user2));
        when(projectService.saveTask(anyString(), anyString(), anyString(), any(Task.class))).thenReturn(updatedTask);

        // When
        Task result = projectResolver.updateTask(testProject.getProjectId(), testEpic.getEpicId(), 
            testFeature.getFeatureId(), testTask.getTaskId(), input);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getUsers().size());
        assertTrue(result.getUsers().contains(user1.getId()));
        assertTrue(result.getUsers().contains(user2.getId()));
        verify(projectService).getProjectById(testProject.getProjectId());
        verify(courseLevelConfigService).isTaskUserAssignmentEnabled(anyInt());
        verify(projectService).saveTask(anyString(), anyString(), anyString(), any(Task.class));
        verify(sseService).sendTaskUpdate(eq(testProject.getProjectId()), anyMap());
    }

    @Test
    void updateTask_ShouldThrowExceptionWhenFeatureDisabledForUsers() {
        // Given
        TaskInput input = new TaskInput();
        input.setUserIds(List.of("user1"));
        
        when(projectService.getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), 
            eq(testFeature.getFeatureId()), eq(testTask.getTaskId()))).thenReturn(testTask);
        when(projectService.getProjectById(eq(testProject.getProjectId()))).thenReturn(testProject);
        when(courseLevelConfigService.isTaskUserAssignmentEnabled(anyInt())).thenReturn(false);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectResolver.updateTask(testProject.getProjectId(), testEpic.getEpicId(), 
                testFeature.getFeatureId(), testTask.getTaskId(), input);
        });

        assertTrue(exception.getMessage().contains("not enabled"));
        verify(projectService, never()).saveTask(anyString(), anyString(), anyString(), any(Task.class));
    }

    @Test
    void updateTask_ShouldThrowExceptionWhenProjectNotFoundForUsers() {
        // Given
        TaskInput input = new TaskInput();
        input.setUserIds(List.of("user1"));
        
        // Task exists but project is null - will cause NullPointerException when accessing project.getCourseLevel()
        when(projectService.getTaskById(eq(testProject.getProjectId()), eq(testEpic.getEpicId()), 
            eq(testFeature.getFeatureId()), eq(testTask.getTaskId()))).thenReturn(testTask);
        when(projectService.getProjectById(eq(testProject.getProjectId()))).thenReturn(null);

        // When & Then - NullPointerException when accessing null project's courseLevel
        assertThrows(NullPointerException.class, () -> {
            projectResolver.updateTask(testProject.getProjectId(), testEpic.getEpicId(), 
                testFeature.getFeatureId(), testTask.getTaskId(), input);
        });

        verify(projectService, never()).saveTask(anyString(), anyString(), anyString(), any(Task.class));
    }

    @Test
    void updateTask_ShouldThrowExceptionWhenUserNotFound() {
        // Given
        TaskInput input = new TaskInput();
        input.setUserIds(List.of("nonexistent"));
        
        when(projectService.getProjectById(testProject.getProjectId())).thenReturn(testProject);
        when(courseLevelConfigService.isTaskUserAssignmentEnabled(anyInt())).thenReturn(true);
        when(projectService.getTaskById(anyString(), anyString(), anyString(), anyString())).thenReturn(testTask);
        when(userRepository.findByUsername("nonexistent")).thenReturn(java.util.Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectResolver.updateTask(testProject.getProjectId(), testEpic.getEpicId(), 
                testFeature.getFeatureId(), testTask.getTaskId(), input);
        });

        assertTrue(exception.getMessage().contains("User not found"));
        verify(projectService, never()).saveTask(anyString(), anyString(), anyString(), any(Task.class));
    }
}
