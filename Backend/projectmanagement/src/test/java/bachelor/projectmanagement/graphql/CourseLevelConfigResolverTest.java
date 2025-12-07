package bachelor.projectmanagement.graphql;

import bachelor.projectmanagement.graphql.CourseLevelConfigResolver.FeatureConfigInput;
import bachelor.projectmanagement.model.CourseLevelConfig;
import bachelor.projectmanagement.model.Project;
import bachelor.projectmanagement.service.CourseLevelConfigService;
import bachelor.projectmanagement.service.ProjectService;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseLevelConfigResolverTest {

    @Mock
    private CourseLevelConfigService configService;

    @Mock
    private ProjectService projectService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CourseLevelConfigResolver configResolver;

    private CourseLevelConfig testConfig;
    private Project testProject;

    @BeforeEach
    void setUp() {
        testConfig = new CourseLevelConfig();
        testConfig.setCourseLevel(100);
        Map<String, Boolean> features = new HashMap<>();
        features.put("task-user-assignment", true);
        features.put("fanout-view", false);
        testConfig.setFeatures(features);

        testProject = TestDataBuilder.createTestProject();

        // Mock Spring Security context
        lenient().when(authentication.isAuthenticated()).thenReturn(true);
        lenient().when(authentication.getName()).thenReturn("testuser");
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void courseLevelConfig_ShouldReturnConfig() {
        // Given
        when(configService.getConfigOrDefault(100)).thenReturn(testConfig);

        // When
        CourseLevelConfig result = configResolver.courseLevelConfig(100);

        // Then
        assertNotNull(result);
        assertEquals(100, result.getCourseLevel());
        verify(configService).getConfigOrDefault(100);
    }

    @Test
    void allCourseLevelConfigs_ShouldReturnAllConfigs() {
        // Given
        CourseLevelConfig config1 = new CourseLevelConfig();
        config1.setCourseLevel(100);
        CourseLevelConfig config2 = new CourseLevelConfig();
        config2.setCourseLevel(200);
        List<CourseLevelConfig> configs = List.of(config1, config2);
        when(configService.getAllConfigs()).thenReturn(configs);

        // When
        List<CourseLevelConfig> result = configResolver.allCourseLevelConfigs();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(configService).getAllConfigs();
    }

    @Test
    void updateCourseLevelConfig_ShouldUpdateFeaturesSuccessfully() {
        // Given
        FeatureConfigInput feature1 = new FeatureConfigInput("task-user-assignment", false);
        FeatureConfigInput feature2 = new FeatureConfigInput("fanout-view", true);
        List<FeatureConfigInput> features = List.of(feature1, feature2);

        CourseLevelConfig updatedConfig = new CourseLevelConfig();
        updatedConfig.setCourseLevel(100);
        Map<String, Boolean> updatedFeatures = new HashMap<>();
        updatedFeatures.put("task-user-assignment", false);
        updatedFeatures.put("fanout-view", true);
        updatedConfig.setFeatures(updatedFeatures);

        when(configService.getConfigOrDefault(100)).thenReturn(testConfig);
        when(configService.saveConfig(any(CourseLevelConfig.class))).thenReturn(updatedConfig);

        // When
        CourseLevelConfig result = configResolver.updateCourseLevelConfig(100, features);

        // Then
        assertNotNull(result);
        assertEquals(100, result.getCourseLevel());
        assertFalse(result.getFeatures().get("task-user-assignment"));
        assertTrue(result.getFeatures().get("fanout-view"));
        verify(configService).getConfigOrDefault(100);
        verify(configService).saveConfig(any(CourseLevelConfig.class));
    }

    @Test
    void updateCourseLevelConfig_ShouldThrowExceptionOnFailure() {
        // Given
        FeatureConfigInput feature = new FeatureConfigInput("task-user-assignment", false);
        List<FeatureConfigInput> features = List.of(feature);

        when(configService.getConfigOrDefault(100)).thenReturn(testConfig);
        when(configService.saveConfig(any(CourseLevelConfig.class)))
                .thenThrow(new RuntimeException("Database error"));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            configResolver.updateCourseLevelConfig(100, features);
        });

        assertTrue(exception.getMessage().contains("Failed to update course level config"));
        verify(configService).saveConfig(any(CourseLevelConfig.class));
    }

    @Test
    void setTemplateProject_ShouldSetTemplateSuccessfully() {
        // Given
        String projectId = testProject.getProjectId();
        when(configService.getConfigOrDefault(100)).thenReturn(testConfig);
        when(projectService.getProjectById(projectId)).thenReturn(testProject);
        when(configService.saveConfig(any(CourseLevelConfig.class))).thenReturn(testConfig);

        // When
        CourseLevelConfig result = configResolver.setTemplateProject(100, projectId);

        // Then
        assertNotNull(result);
        verify(configService).getConfigOrDefault(100);
        verify(projectService).getProjectById(projectId);
        verify(configService).saveConfig(any(CourseLevelConfig.class));
    }

    @Test
    void setTemplateProject_ShouldThrowExceptionWhenProjectNotFound() {
        // Given
        String projectId = "nonexistent";
        when(configService.getConfigOrDefault(100)).thenReturn(testConfig);
        when(projectService.getProjectById(projectId)).thenReturn(null);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            configResolver.setTemplateProject(100, projectId);
        });

        assertTrue(exception.getMessage().contains("Failed to set template project"));
        verify(projectService).getProjectById(projectId);
        verify(configService, never()).saveConfig(any(CourseLevelConfig.class));
    }

    @Test
    void createProjectFromTemplate_ShouldCreateProjectWithTemplate() {
        // Given
        Project template = TestDataBuilder.createTestProject("Template Project", TestDataBuilder.createTestUser());
        testConfig.setTemplateProject(template);
        
        Project newProject = TestDataBuilder.createTestProject("New Project", TestDataBuilder.createTestUser());

        when(configService.getConfigOrDefault(100)).thenReturn(testConfig);
        when(projectService.copyProjectStructure(eq(template), eq("New Project"), eq("New Description"), 
            eq(100), eq("testuser"))).thenReturn(newProject);

        // When
        Project result = configResolver.createProjectFromTemplate(100, "New Project", "New Description");

        // Then
        assertNotNull(result);
        assertEquals("New Project", result.getTitle());
        verify(configService).getConfigOrDefault(100);
        verify(projectService).copyProjectStructure(eq(template), eq("New Project"), 
            eq("New Description"), eq(100), eq("testuser"));
    }

    @Test
    void createProjectFromTemplate_ShouldFallbackToDefaultTemplate() {
        // Given
        CourseLevelConfig defaultConfig = new CourseLevelConfig();
        defaultConfig.setCourseLevel(0);
        Project defaultTemplate = TestDataBuilder.createTestProject("Default Template", TestDataBuilder.createTestUser());
        defaultConfig.setTemplateProject(defaultTemplate);
        
        testConfig.setTemplateProject(null); // No template for course level 100
        
        Project newProject = TestDataBuilder.createTestProject("New Project", TestDataBuilder.createTestUser());

        when(configService.getConfigOrDefault(100)).thenReturn(testConfig);
        when(configService.getConfigOrDefault(0)).thenReturn(defaultConfig);
        when(projectService.copyProjectStructure(eq(defaultTemplate), eq("New Project"), 
            eq("New Description"), eq(100), eq("testuser"))).thenReturn(newProject);

        // When
        Project result = configResolver.createProjectFromTemplate(100, "New Project", "New Description");

        // Then
        assertNotNull(result);
        verify(configService).getConfigOrDefault(100);
        verify(configService).getConfigOrDefault(0);
        verify(projectService).copyProjectStructure(eq(defaultTemplate), eq("New Project"), 
            eq("New Description"), eq(100), eq("testuser"));
    }

    @Test
    void createProjectFromTemplate_ShouldCreateEmptyProjectWhenNoTemplate() {
        // Given
        testConfig.setTemplateProject(null);
        CourseLevelConfig defaultConfig = new CourseLevelConfig();
        defaultConfig.setCourseLevel(0);
        defaultConfig.setTemplateProject(null);

        Project newProject = TestDataBuilder.createTestProject("New Project", TestDataBuilder.createTestUser());

        when(configService.getConfigOrDefault(100)).thenReturn(testConfig);
        when(configService.getConfigOrDefault(0)).thenReturn(defaultConfig);
        when(projectService.createProject(any(Project.class), eq("testuser"))).thenReturn(newProject);

        // When
        Project result = configResolver.createProjectFromTemplate(100, "New Project", "New Description");

        // Then
        assertNotNull(result);
        verify(configService).getConfigOrDefault(100);
        verify(configService).getConfigOrDefault(0);
        verify(projectService).createProject(any(Project.class), eq("testuser"));
        verify(projectService, never()).copyProjectStructure(any(), anyString(), anyString(), anyInt(), anyString());
    }

    @Test
    void createProjectFromTemplate_ShouldThrowExceptionOnFailure() {
        // Given
        when(configService.getConfigOrDefault(100)).thenThrow(new RuntimeException("Database error"));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            configResolver.createProjectFromTemplate(100, "New Project", "New Description");
        });

        assertTrue(exception.getMessage().contains("Failed to create project from template"));
    }

    @Test
    void features_ShouldReturnFeatureConfigList() {
        // Given
        Map<String, Boolean> featuresMap = new HashMap<>();
        featuresMap.put("feature1", true);
        featuresMap.put("feature2", false);
        testConfig.setFeatures(featuresMap);

        // When
        List<CourseLevelConfigResolver.FeatureConfig> result = configResolver.features(testConfig);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(fc -> fc.getKey().equals("feature1") && fc.getEnabled()));
        assertTrue(result.stream().anyMatch(fc -> fc.getKey().equals("feature2") && !fc.getEnabled()));
    }

    @Test
    void features_ShouldReturnEmptyListWhenNoFeatures() {
        // Given
        testConfig.setFeatures(null);

        // When
        List<CourseLevelConfigResolver.FeatureConfig> result = configResolver.features(testConfig);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void featureConfig_ShouldHaveCorrectGettersAndSetters() {
        // Given
        CourseLevelConfigResolver.FeatureConfig featureConfig = 
            new CourseLevelConfigResolver.FeatureConfig("test-feature", true);

        // Then
        assertEquals("test-feature", featureConfig.getKey());
        assertTrue(featureConfig.getEnabled());

        // When
        featureConfig.setKey("new-key");
        featureConfig.setEnabled(false);

        // Then
        assertEquals("new-key", featureConfig.getKey());
        assertFalse(featureConfig.getEnabled());
    }

    @Test
    void featureConfigInput_ShouldHaveCorrectGettersAndSetters() {
        // Given
        FeatureConfigInput input = new FeatureConfigInput();

        // When
        input.setKey("test-feature");
        input.setEnabled(true);

        // Then
        assertEquals("test-feature", input.getKey());
        assertTrue(input.isEnabled());
    }

    @Test
    void featureConfigInput_ShouldHaveCorrectToString() {
        // Given
        FeatureConfigInput input = new FeatureConfigInput("test-feature", true);

        // When
        String result = input.toString();

        // Then
        assertTrue(result.contains("test-feature"));
        assertTrue(result.contains("true"));
    }
}
