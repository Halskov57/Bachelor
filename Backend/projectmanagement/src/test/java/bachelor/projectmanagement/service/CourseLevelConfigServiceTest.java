package bachelor.projectmanagement.service;

import bachelor.projectmanagement.model.CourseLevelConfig;
import bachelor.projectmanagement.repository.CourseLevelConfigRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseLevelConfigServiceTest {

    @Mock
    private CourseLevelConfigRepository configRepository;

    @InjectMocks
    private CourseLevelConfigService configService;

    private CourseLevelConfig testConfig;
    private final int TEST_COURSE_LEVEL = 100;

    @BeforeEach
    void setUp() {
        testConfig = createTestConfig(TEST_COURSE_LEVEL);
    }

    private CourseLevelConfig createTestConfig(int courseLevel) {
        CourseLevelConfig config = new CourseLevelConfig();
        config.setId(UUID.randomUUID().toString());
        config.setCourseLevel(courseLevel);
        
        Map<String, Boolean> features = new HashMap<>();
        features.put(CourseLevelConfig.TASK_USER_ASSIGNMENT, true);
        features.put(CourseLevelConfig.EPIC_CREATE_DELETE, true);
        features.put(CourseLevelConfig.FEATURE_CREATE_DELETE, true);
        features.put(CourseLevelConfig.TASK_CREATE_DELETE, true);
        config.setFeatures(features);
        
        config.setCreatedAt(Instant.now());
        config.setUpdatedAt(Instant.now());
        
        return config;
    }

    @Test
    void getConfig_ShouldReturnConfigWhenExists() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(testConfig));

        // When
        Optional<CourseLevelConfig> result = configService.getConfig(TEST_COURSE_LEVEL);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testConfig, result.get());
        verify(configRepository).findAllByCourseLevel(TEST_COURSE_LEVEL);
    }

    @Test
    void getConfig_ShouldReturnEmptyWhenNotExists() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(Collections.emptyList());

        // When
        Optional<CourseLevelConfig> result = configService.getConfig(TEST_COURSE_LEVEL);

        // Then
        assertFalse(result.isPresent());
        verify(configRepository).findAllByCourseLevel(TEST_COURSE_LEVEL);
    }

    @Test
    void getConfig_ShouldReturnFirstWhenMultipleExist() {
        // Given
        CourseLevelConfig config1 = createTestConfig(TEST_COURSE_LEVEL);
        CourseLevelConfig config2 = createTestConfig(TEST_COURSE_LEVEL);
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(config1, config2));

        // When
        Optional<CourseLevelConfig> result = configService.getConfig(TEST_COURSE_LEVEL);

        // Then
        assertTrue(result.isPresent());
        assertEquals(config1, result.get());
    }

    @Test
    void getConfigOrDefault_ShouldReturnExistingConfig() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(testConfig));

        // When
        CourseLevelConfig result = configService.getConfigOrDefault(TEST_COURSE_LEVEL);

        // Then
        assertNotNull(result);
        assertEquals(testConfig, result);
        verify(configRepository).findAllByCourseLevel(TEST_COURSE_LEVEL);
        verify(configRepository, never()).save(any(CourseLevelConfig.class));
    }

    @Test
    void getConfigOrDefault_ShouldCreateDefaultWhenNotExists() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(Collections.emptyList());
        when(configRepository.save(any(CourseLevelConfig.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        CourseLevelConfig result = configService.getConfigOrDefault(TEST_COURSE_LEVEL);

        // Then
        assertNotNull(result);
        assertEquals(TEST_COURSE_LEVEL, result.getCourseLevel());
        assertTrue(result.isTaskUserAssignmentEnabled());
        assertTrue(result.isEpicCreateDeleteEnabled());
        assertTrue(result.isFeatureCreateDeleteEnabled());
        assertTrue(result.isTaskCreateDeleteEnabled());
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());
        verify(configRepository, atLeast(2)).findAllByCourseLevel(TEST_COURSE_LEVEL);
        verify(configRepository).save(any(CourseLevelConfig.class));
    }

    @Test
    void getConfigOrDefault_ShouldMigrateOldConfigWithMissingFeatures() {
        // Given - Create config with missing features
        testConfig.getFeatures().clear();
        testConfig.getFeatures().put(CourseLevelConfig.TASK_USER_ASSIGNMENT, true);
        
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(testConfig));
        when(configRepository.save(any(CourseLevelConfig.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        CourseLevelConfig result = configService.getConfigOrDefault(TEST_COURSE_LEVEL);

        // Then
        assertNotNull(result);
        assertTrue(result.getFeatures().containsKey(CourseLevelConfig.EPIC_CREATE_DELETE));
        assertTrue(result.getFeatures().containsKey(CourseLevelConfig.FEATURE_CREATE_DELETE));
        assertTrue(result.getFeatures().containsKey(CourseLevelConfig.TASK_CREATE_DELETE));
        verify(configRepository).save(testConfig);
    }

    @Test
    void saveConfig_ShouldSaveConfigSuccessfully() {
        // Given
        when(configRepository.save(testConfig)).thenReturn(testConfig);

        // When
        CourseLevelConfig result = configService.saveConfig(testConfig);

        // Then
        assertNotNull(result);
        assertEquals(testConfig, result);
        verify(configRepository).save(testConfig);
    }

    @Test
    void updateFeature_ShouldUpdateFeatureSuccessfully() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(testConfig));
        when(configRepository.save(any(CourseLevelConfig.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        CourseLevelConfig result = configService.updateFeature(
                TEST_COURSE_LEVEL, CourseLevelConfig.TASK_USER_ASSIGNMENT, false);

        // Then
        assertNotNull(result);
        assertFalse(result.isTaskUserAssignmentEnabled());
        verify(configRepository).save(any(CourseLevelConfig.class));
    }

    @Test
    void updateFeature_ShouldCreateDefaultIfNotExists() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(Collections.emptyList());
        when(configRepository.save(any(CourseLevelConfig.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        CourseLevelConfig result = configService.updateFeature(
                TEST_COURSE_LEVEL, CourseLevelConfig.TASK_USER_ASSIGNMENT, false);

        // Then
        assertNotNull(result);
        assertFalse(result.isTaskUserAssignmentEnabled());
        // Should save twice: once for creating default, once for updating feature
        verify(configRepository, times(2)).save(any(CourseLevelConfig.class));
    }

    @Test
    void updateTaskUserAssignment_ShouldEnableFeature() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(testConfig));
        when(configRepository.save(any(CourseLevelConfig.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        CourseLevelConfig result = configService.updateTaskUserAssignment(TEST_COURSE_LEVEL, true);

        // Then
        assertNotNull(result);
        assertTrue(result.isTaskUserAssignmentEnabled());
        verify(configRepository).save(any(CourseLevelConfig.class));
    }

    @Test
    void updateTaskUserAssignment_ShouldDisableFeature() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(testConfig));
        when(configRepository.save(any(CourseLevelConfig.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        CourseLevelConfig result = configService.updateTaskUserAssignment(TEST_COURSE_LEVEL, false);

        // Then
        assertNotNull(result);
        assertFalse(result.isTaskUserAssignmentEnabled());
        verify(configRepository).save(any(CourseLevelConfig.class));
    }

    @Test
    void isTaskUserAssignmentEnabled_ShouldReturnTrueWhenEnabled() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(testConfig));

        // When
        boolean result = configService.isTaskUserAssignmentEnabled(TEST_COURSE_LEVEL);

        // Then
        assertTrue(result);
    }

    @Test
    void isTaskUserAssignmentEnabled_ShouldReturnFalseWhenDisabled() {
        // Given
        testConfig.setFeature(CourseLevelConfig.TASK_USER_ASSIGNMENT, false);
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(testConfig));

        // When
        boolean result = configService.isTaskUserAssignmentEnabled(TEST_COURSE_LEVEL);

        // Then
        assertFalse(result);
    }

    @Test
    void getAllConfigs_ShouldReturnAllConfigs() {
        // Given
        CourseLevelConfig config1 = createTestConfig(100);
        CourseLevelConfig config2 = createTestConfig(200);
        List<CourseLevelConfig> configs = List.of(config1, config2);
        when(configRepository.findAll()).thenReturn(configs);

        // When
        List<CourseLevelConfig> result = configService.getAllConfigs();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.contains(config1));
        assertTrue(result.contains(config2));
        verify(configRepository).findAll();
    }

    @Test
    void deleteConfig_ShouldDeleteExistingConfig() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(testConfig));

        // When
        configService.deleteConfig(TEST_COURSE_LEVEL);

        // Then
        verify(configRepository).findAllByCourseLevel(TEST_COURSE_LEVEL);
        verify(configRepository).delete(testConfig);
    }

    @Test
    void deleteConfig_ShouldDeleteAllDuplicates() {
        // Given
        CourseLevelConfig config1 = createTestConfig(TEST_COURSE_LEVEL);
        CourseLevelConfig config2 = createTestConfig(TEST_COURSE_LEVEL);
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(config1, config2));

        // When
        configService.deleteConfig(TEST_COURSE_LEVEL);

        // Then
        verify(configRepository).delete(config1);
        verify(configRepository).delete(config2);
    }

    @Test
    void deleteConfig_ShouldHandleNonexistentConfig() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(Collections.emptyList());

        // When
        configService.deleteConfig(TEST_COURSE_LEVEL);

        // Then
        verify(configRepository).findAllByCourseLevel(TEST_COURSE_LEVEL);
        verify(configRepository, never()).delete(any(CourseLevelConfig.class));
    }

    @Test
    void updateCreateDeletePermissions_ShouldUpdateEpicPermission() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(testConfig));
        when(configRepository.save(any(CourseLevelConfig.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        CourseLevelConfig result = configService.updateCreateDeletePermissions(
                TEST_COURSE_LEVEL, CourseLevelConfig.EPIC_CREATE_DELETE, false);

        // Then
        assertNotNull(result);
        assertFalse(result.isEpicCreateDeleteEnabled());
        verify(configRepository).save(any(CourseLevelConfig.class));
    }

    @Test
    void updateCreateDeletePermissions_ShouldUpdateFeaturePermission() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(testConfig));
        when(configRepository.save(any(CourseLevelConfig.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        CourseLevelConfig result = configService.updateCreateDeletePermissions(
                TEST_COURSE_LEVEL, CourseLevelConfig.FEATURE_CREATE_DELETE, false);

        // Then
        assertNotNull(result);
        assertFalse(result.isFeatureCreateDeleteEnabled());
        verify(configRepository).save(any(CourseLevelConfig.class));
    }

    @Test
    void updateCreateDeletePermissions_ShouldUpdateTaskPermission() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(testConfig));
        when(configRepository.save(any(CourseLevelConfig.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        CourseLevelConfig result = configService.updateCreateDeletePermissions(
                TEST_COURSE_LEVEL, CourseLevelConfig.TASK_CREATE_DELETE, false);

        // Then
        assertNotNull(result);
        assertFalse(result.isTaskCreateDeleteEnabled());
        verify(configRepository).save(any(CourseLevelConfig.class));
    }

    @Test
    void cleanupDuplicateConfigs_ShouldNotExecuteInTests() {
        // Given - PostConstruct methods are not called in unit tests
        // This test documents that cleanupDuplicateConfigs is a PostConstruct method
        // and verifies that the repository is not called during test initialization

        // Then - No repository calls should have been made during setUp
        verifyNoInteractions(configRepository);
    }

    @Test
    void defaultConfig_ShouldHaveAllFeaturesEnabled() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(Collections.emptyList());
        when(configRepository.save(any(CourseLevelConfig.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        CourseLevelConfig result = configService.getConfigOrDefault(TEST_COURSE_LEVEL);

        // Then
        assertTrue(result.isTaskUserAssignmentEnabled());
        assertTrue(result.isEpicCreateDeleteEnabled());
        assertTrue(result.isFeatureCreateDeleteEnabled());
        assertTrue(result.isTaskCreateDeleteEnabled());
    }

    @Test
    void getConfigOrDefault_ShouldSetTimestamps() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(Collections.emptyList());
        when(configRepository.save(any(CourseLevelConfig.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        CourseLevelConfig result = configService.getConfigOrDefault(TEST_COURSE_LEVEL);

        // Then
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());
    }

    @Test
    void updateFeature_ShouldPreserveOtherFeatures() {
        // Given
        when(configRepository.findAllByCourseLevel(TEST_COURSE_LEVEL))
                .thenReturn(List.of(testConfig));
        when(configRepository.save(any(CourseLevelConfig.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        CourseLevelConfig result = configService.updateFeature(
                TEST_COURSE_LEVEL, CourseLevelConfig.TASK_USER_ASSIGNMENT, false);

        // Then
        assertFalse(result.isTaskUserAssignmentEnabled());
        assertTrue(result.isEpicCreateDeleteEnabled());
        assertTrue(result.isFeatureCreateDeleteEnabled());
        assertTrue(result.isTaskCreateDeleteEnabled());
    }
}
