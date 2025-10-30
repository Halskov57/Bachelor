package bachelor.projectmanagement.service;

import bachelor.projectmanagement.model.CourseLevelConfig;
import bachelor.projectmanagement.repository.CourseLevelConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CourseLevelConfigService {

    @Autowired
    private CourseLevelConfigRepository configRepository;

    /**
     * Clean up duplicate course level configs on startup
     */
    @PostConstruct
    public void cleanupDuplicateConfigs() {
        try {
            System.out.println("🔍 Checking for duplicate CourseLevelConfig documents...");
            
            // Get all configs
            List<CourseLevelConfig> allConfigs = configRepository.findAll();
            Map<Integer, List<CourseLevelConfig>> configsByLevel = new HashMap<>();
            
            // Group by course level
            for (CourseLevelConfig config : allConfigs) {
                configsByLevel.computeIfAbsent(config.getCourseLevel(), k -> new java.util.ArrayList<>()).add(config);
            }
            
            // Find and clean duplicates
            int duplicatesRemoved = 0;
            for (Map.Entry<Integer, List<CourseLevelConfig>> entry : configsByLevel.entrySet()) {
                List<CourseLevelConfig> configs = entry.getValue();
                if (configs.size() > 1) {
                    System.err.println("⚠️  Found " + configs.size() + " duplicate configs for courseLevel " + entry.getKey());
                    
                    // Keep the first one (oldest by createdAt), delete the rest
                    configs.sort((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));
                    CourseLevelConfig toKeep = configs.get(0);
                    System.out.println("✅ Keeping config with ID: " + toKeep.getId() + " (created at " + toKeep.getCreatedAt() + ")");
                    
                    for (int i = 1; i < configs.size(); i++) {
                        CourseLevelConfig toDelete = configs.get(i);
                        System.out.println("🗑️  Deleting duplicate config with ID: " + toDelete.getId() + " (created at " + toDelete.getCreatedAt() + ")");
                        configRepository.delete(toDelete);
                        duplicatesRemoved++;
                    }
                }
            }
            
            if (duplicatesRemoved > 0) {
                System.out.println("✅ Cleaned up " + duplicatesRemoved + " duplicate CourseLevelConfig document(s)");
            } else {
                System.out.println("✅ No duplicate CourseLevelConfig documents found");
            }
        } catch (Exception e) {
            System.err.println("❌ Error during duplicate config cleanup: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Get configuration for a specific course level
     */
    public Optional<CourseLevelConfig> getConfig(int courseLevel) {
        // Repository may return multiple documents if duplicates exist; return first if present
        try {
            var list = configRepository.findAllByCourseLevel(courseLevel);
            if (list != null && !list.isEmpty()) {
                if (list.size() > 1) {
                    System.err.println("WARN: Multiple CourseLevelConfig documents found for courseLevel " + courseLevel + ". Using the first one.");
                }
                return Optional.of(list.get(0));
            }
            return Optional.empty();
        } catch (Exception e) {
            System.err.println("ERROR: Failed to load config list for course level " + courseLevel + ": " + e.getMessage());
            throw e;
        }
    }

    /**
     * Get configuration for a specific course level, creating default if not exists
     * Synchronized to prevent race conditions during concurrent config creation
     */
    public synchronized CourseLevelConfig getConfigOrDefault(int courseLevel) {
        try {
            System.out.println("DEBUG: Looking for config with course level " + courseLevel);
            var list = configRepository.findAllByCourseLevel(courseLevel);
            if (list != null && !list.isEmpty()) {
                if (list.size() > 1) {
                    System.err.println("WARN: Multiple CourseLevelConfig documents found for courseLevel " + courseLevel + ". Using the first one.");
                }
                CourseLevelConfig config = list.get(0);
                System.out.println("DEBUG: Found existing config: " + config);
                
                // Migration: Check if the config has all required features
                boolean needsUpdate = false;
                Map<String, Boolean> features = config.getFeatures();
                
                if (!features.containsKey(CourseLevelConfig.EPIC_CREATE_DELETE)) {
                    features.put(CourseLevelConfig.EPIC_CREATE_DELETE, true);
                    needsUpdate = true;
                }
                if (!features.containsKey(CourseLevelConfig.FEATURE_CREATE_DELETE)) {
                    features.put(CourseLevelConfig.FEATURE_CREATE_DELETE, true);
                    needsUpdate = true;
                }
                if (!features.containsKey(CourseLevelConfig.TASK_CREATE_DELETE)) {
                    features.put(CourseLevelConfig.TASK_CREATE_DELETE, true);
                    needsUpdate = true;
                }
                
                if (needsUpdate) {
                    System.out.println("DEBUG: Migrating existing config to include new features");
                    config.setFeatures(features);
                    config = configRepository.save(config);
                    System.out.println("DEBUG: Updated config: " + config);
                }
                
                return config;
            }
            
            System.out.println("DEBUG: No existing config found, creating default");
            // Double-check after synchronization (another thread may have created it)
            list = configRepository.findAllByCourseLevel(courseLevel);
            if (list != null && !list.isEmpty()) {
                System.out.println("DEBUG: Config was created by another thread, using it");
                return list.get(0);
            }
            
            // Create and save default config if it doesn't exist
            CourseLevelConfig defaultConfig = createDefaultConfig(courseLevel);
            System.out.println("DEBUG: Created default config: " + defaultConfig);
            
            CourseLevelConfig saved = configRepository.save(defaultConfig);
            System.out.println("DEBUG: Saved default config: " + saved);
            return saved;
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get or create config for course level " + courseLevel);
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Create or update configuration for a course level
     */
    public CourseLevelConfig saveConfig(CourseLevelConfig config) {
        return configRepository.save(config);
    }

    /**
     * Update a specific feature for a course level
     */
    public CourseLevelConfig updateFeature(int courseLevel, String featureKey, boolean enabled) {
        try {
            System.out.println("DEBUG: Getting config for course level " + courseLevel);
            CourseLevelConfig config = getConfigOrDefault(courseLevel);
            System.out.println("DEBUG: Got config: " + config);
            
            System.out.println("DEBUG: Setting feature " + featureKey + " to " + enabled);
            config.setFeature(featureKey, enabled);
            
            System.out.println("DEBUG: Saving config to database");
            CourseLevelConfig saved = configRepository.save(config);
            System.out.println("DEBUG: Successfully saved config: " + saved);
            
            return saved;
        } catch (Exception e) {
            System.err.println("ERROR: Failed to update feature " + featureKey + " for course level " + courseLevel);
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Update task user assignment feature for a course level
     */
    public CourseLevelConfig updateTaskUserAssignment(int courseLevel, boolean enabled) {
        try {
            System.out.println("DEBUG: Updating task user assignment for course level " + courseLevel + " to " + enabled);
            CourseLevelConfig result = updateFeature(courseLevel, CourseLevelConfig.TASK_USER_ASSIGNMENT, enabled);
            System.out.println("DEBUG: Successfully updated configuration: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("ERROR: Failed to update task user assignment for course level " + courseLevel);
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Check if task user assignment is enabled for a course level
     */
    public boolean isTaskUserAssignmentEnabled(int courseLevel) {
        return getConfigOrDefault(courseLevel).isTaskUserAssignmentEnabled();
    }

    /**
     * Get all configurations
     */
    public List<CourseLevelConfig> getAllConfigs() {
        return configRepository.findAll();
    }

    /**
     * Delete configuration for a course level
     */
    public void deleteConfig(int courseLevel) {
        // Delete all configs with that course level (clean up duplicates if any)
        var list = configRepository.findAllByCourseLevel(courseLevel);
        if (list != null && !list.isEmpty()) {
            list.forEach(configRepository::delete);
        }
    }

    /**
     * Create default configuration for a course level
     */
    private CourseLevelConfig createDefaultConfig(int courseLevel) {
        try {
            System.out.println("DEBUG: Creating default config for course level " + courseLevel);
            
            Map<String, Boolean> defaultFeatures = new HashMap<>();
            // By default, all features are enabled
            defaultFeatures.put(CourseLevelConfig.TASK_USER_ASSIGNMENT, true);
            defaultFeatures.put(CourseLevelConfig.EPIC_CREATE_DELETE, true);
            defaultFeatures.put(CourseLevelConfig.FEATURE_CREATE_DELETE, true);
            defaultFeatures.put(CourseLevelConfig.TASK_CREATE_DELETE, true);
            
            CourseLevelConfig config = new CourseLevelConfig();
            config.setCourseLevel(courseLevel);
            config.setFeatures(defaultFeatures);
            
            // Ensure timestamps are set
            if (config.getCreatedAt() == null) {
                config.setCreatedAt(java.time.Instant.now());
            }
            if (config.getUpdatedAt() == null) {
                config.setUpdatedAt(java.time.Instant.now());
            }
            
            System.out.println("DEBUG: Created default config: " + config);
            return config;
        } catch (Exception e) {
            System.err.println("ERROR: Failed to create default config for course level " + courseLevel);
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Update create/delete permissions for a course level
     */
    public CourseLevelConfig updateCreateDeletePermissions(int courseLevel, String permissionKey, boolean enabled) {
        try {
            System.out.println("DEBUG: Updating permission " + permissionKey + " for course level " + courseLevel + " to " + enabled);
            CourseLevelConfig result = updateFeature(courseLevel, permissionKey, enabled);
            System.out.println("DEBUG: Successfully updated permission: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("ERROR: Failed to update permission " + permissionKey + " for course level " + courseLevel);
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}