package bachelor.projectmanagement.graphql;

import bachelor.projectmanagement.model.CourseLevelConfig;
import bachelor.projectmanagement.model.Project;
import bachelor.projectmanagement.service.PubSubService;
import bachelor.projectmanagement.service.CourseLevelConfigService;
import bachelor.projectmanagement.service.ProjectService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
public class CourseLevelConfigResolver {

    private final CourseLevelConfigService configService;
    private final ProjectService projectService;
    private final PubSubService pubSubService; // 1. Declare PubSubService

    public CourseLevelConfigResolver(
            CourseLevelConfigService configService, 
            ProjectService projectService,
            PubSubService pubSubService) { // 2. Inject PubSubService
        this.configService = configService;
        this.projectService = projectService;
        this.pubSubService = pubSubService; // 3. Initialize PubSubService
    }

    // Query resolvers
    @QueryMapping
    public CourseLevelConfig courseLevelConfig(@Argument int courseLevel) {
        return configService.getConfigOrDefault(courseLevel);
    }

    @QueryMapping
    public List<CourseLevelConfig> allCourseLevelConfigs() {
        return configService.getAllConfigs();
    }

    // Mutation resolvers
    @MutationMapping
    public CourseLevelConfig updateCourseLevelConfig(
            @Argument int courseLevel,
            @Argument List<FeatureConfigInput> features) {
        try {
            System.out.println("DEBUG: GraphQL updateCourseLevelConfig called with courseLevel=" + courseLevel + ", features=" + features);
            CourseLevelConfig config = configService.getConfigOrDefault(courseLevel);

            // Update features
            for (FeatureConfigInput feature : features) {
                // Ensure features map exists, though getConfigOrDefault likely handles this
                if (config.getFeatures() != null) {
                    config.getFeatures().put(feature.getKey(), feature.isEnabled());
                }
            }

            CourseLevelConfig updatedConfig = configService.saveConfig(config);
            System.out.println("DEBUG: GraphQL updateCourseLevelConfig returning: " + updatedConfig);
            return updatedConfig;
        } catch (Exception e) {
            System.err.println("ERROR: GraphQL updateCourseLevelConfig failed");
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update course level config: " + e.getMessage(), e);
        }
    }

    @MutationMapping
    public CourseLevelConfig setTemplateProject(@Argument int courseLevel, @Argument String projectId) {
        try {
            System.out.println("DEBUG: GraphQL setTemplateProject called with courseLevel=" + courseLevel + ", projectId=" + projectId);
            CourseLevelConfig config = configService.getConfigOrDefault(courseLevel);
            Project template = projectService.getProjectById(projectId);
            
            if (template == null) {
                throw new RuntimeException("Project not found with id: " + projectId);
            }
            
            config.setTemplateProject(template);
            CourseLevelConfig updatedConfig = configService.saveConfig(config);
            System.out.println("DEBUG: GraphQL setTemplateProject returning: " + updatedConfig);
            return updatedConfig;
        } catch (Exception e) {
            System.err.println("ERROR: GraphQL setTemplateProject failed");
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to set template project: " + e.getMessage(), e);
        }
    }

    @MutationMapping
    public Project createProjectFromTemplate(@Argument int courseLevel, @Argument String title, @Argument String description) {
        try {
            System.out.println("DEBUG: GraphQL createProjectFromTemplate called with courseLevel=" + courseLevel + ", title=" + title);
            Project newProject;
            
            // First try to get template for the specific course level
            CourseLevelConfig config = configService.getConfigOrDefault(courseLevel);
            Project template = config.getTemplateProject();
            
            // If no template for specific course level, try course level 0 (default template)
            if (template == null && courseLevel != 0) {
                System.out.println("DEBUG: No template for course level " + courseLevel + ", checking default template (course level 0)");
                CourseLevelConfig defaultConfig = configService.getConfigOrDefault(0);
                template = defaultConfig.getTemplateProject();
            }
            
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            
            if (template == null) {
                // No template exists, create a normal empty project
                System.out.println("DEBUG: No template found, creating empty project");
                
                Project projectToCreate = new Project();
                projectToCreate.setTitle(title);
                projectToCreate.setDescription(description);
                projectToCreate.setCourseLevel(courseLevel);
                
                newProject = projectService.createProject(projectToCreate, currentUsername);
            } else {
                // Template exists, copy its structure
                System.out.println("DEBUG: Template found, copying structure from: " + template.getTitle());
                
                newProject = projectService.copyProjectStructure(template, title, description, courseLevel, currentUsername);
            }
            
            // 4. PUBLISH PROJECT CHANGE EVENT
            pubSubService.publishProjectChange(newProject);
            
            return newProject;
        } catch (Exception e) {
            System.err.println("ERROR: GraphQL createProjectFromTemplate failed");
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create project from template: " + e.getMessage(), e);
        }
    }

    // Field resolvers for CourseLevelConfig
    @SchemaMapping
    public List<FeatureConfig> features(CourseLevelConfig config) {
        List<FeatureConfig> featureConfigs = new ArrayList<>();
        Map<String, Boolean> features = config.getFeatures();
        
        if (features != null) {
            for (Map.Entry<String, Boolean> entry : features.entrySet()) {
                featureConfigs.add(new FeatureConfig(entry.getKey(), entry.getValue()));
            }
        }
        
        return featureConfigs;
    }

    // Helper class for GraphQL FeatureConfig type
    public static class FeatureConfig {
        private String key;
        private Boolean enabled;

        public FeatureConfig(String key, Boolean enabled) {
            this.key = key;
            this.enabled = enabled;
        }

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public Boolean getEnabled() {
            return enabled;
        }

        public void setEnabled(Boolean enabled) {
            this.enabled = enabled;
        }
    }

    // Helper class for inputting feature configuration
    public static class FeatureConfigInput {
        private String key;
        private boolean enabled;

        // Default constructor required for GraphQL
        public FeatureConfigInput() {}

        public FeatureConfigInput(String key, boolean enabled) {
            this.key = key;
            this.enabled = enabled;
        }

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        @Override
        public String toString() {
            return "FeatureConfigInput{key='" + key + "', enabled=" + enabled + "}";
        }
    }
}