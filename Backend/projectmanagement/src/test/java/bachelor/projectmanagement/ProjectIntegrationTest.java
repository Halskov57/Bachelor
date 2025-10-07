package bachelor.projectmanagement;

import bachelor.projectmanagement.model.*;
import bachelor.projectmanagement.repository.ProjectRepository;
import bachelor.projectmanagement.repository.UserRepository;
import bachelor.projectmanagement.util.TestDataBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class ProjectIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private User testUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        
        // Clean up before each test
        projectRepository.deleteAll();
        userRepository.deleteAll();
        
        // Create and save test user
        testUser = TestDataBuilder.createTestUser("integrationtest");
        testUser = userRepository.save(testUser);
    }

    @Test
    void createProject_ShouldCreateProjectViaRestEndpoint() throws Exception {
        // Given
        Project project = TestDataBuilder.createTestProject("Integration Test Project", testUser);
        project.setProjectId(null); // Let the database generate the ID

        // When & Then
        mockMvc.perform(post("/projects")
                .param("username", testUser.getUsername())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(project)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Integration Test Project"))
                .andExpect(jsonPath("$.owner.username").value(testUser.getUsername()));

        // Verify in database
        assertEquals(1, projectRepository.count());
        Project savedProject = projectRepository.findAll().get(0);
        assertEquals("Integration Test Project", savedProject.getTitle());
        assertEquals(testUser.getId(), savedProject.getOwner().getId());
    }

    @Test
    void getProjectsByUser_ShouldReturnUserProjects() throws Exception {
        // Given
        Project project1 = TestDataBuilder.createTestProject("Project 1", testUser);
        Project project2 = TestDataBuilder.createTestProject("Project 2", testUser);
        projectRepository.save(project1);
        projectRepository.save(project2);

        // When & Then
        mockMvc.perform(get("/projects/user/{username}", testUser.getUsername()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Project 1"))
                .andExpect(jsonPath("$[1].title").value("Project 2"));
    }

    @Test
    void getProjectById_ShouldReturnSpecificProject() throws Exception {
        // Given
        Project project = TestDataBuilder.createTestProject("Specific Project", testUser);
        project = projectRepository.save(project);

        // When & Then
        mockMvc.perform(get("/projects/{id}", project.getProjectId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Specific Project"))
                .andExpect(jsonPath("$.projectId").value(project.getProjectId()));
    }

    @Test
    void simpleTest_ShouldPassBasicProjectCreation() throws Exception {
        // Given
        Project project = TestDataBuilder.createTestProject("Simple Test Project", testUser);

        // When & Then
        assertNotNull(project);
        assertEquals("Simple Test Project", project.getTitle());
        assertEquals(testUser, project.getOwner());
    }
}