package bachelor.projectmanagement.controller;

import bachelor.projectmanagement.model.Project;
import bachelor.projectmanagement.service.ProjectService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // Create project with username as request param
    @PostMapping
    public Project createProject(@RequestBody Project project, @RequestParam String username) {
        return projectService.createProject(project, username);
    }

    @GetMapping("/user/{username}")
    public List<Project> getProjectsByUser(@PathVariable String username) {
        return projectService.getProjectsByUsername(username);
    }

    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable String id) {
        projectService.deleteProject(id);
    }
}
