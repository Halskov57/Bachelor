package bachelor.projectmanagement.controller;

import bachelor.projectmanagement.service.SSEService;
import bachelor.projectmanagement.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/sse")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class SSEController {

    @Autowired
    private SSEService sseService;
    
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Establish SSE connection for project updates
     * @param projectId The project ID to subscribe to updates for
     * @param token JWT token for authentication (passed as query param since EventSource doesn't support headers)
     * @return SseEmitter for streaming events
     */
    @GetMapping(value = "/project/{projectId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeToProjectUpdates(@PathVariable String projectId, @RequestParam(required = false) String token) {
        // Validate JWT token if provided
        if (token != null && !token.isEmpty()) {
            try {
                // Remove "Bearer " prefix if present
                String cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;
                
                // Validate the token (will throw exception if invalid)
                jwtUtil.validateToken(cleanToken);
            } catch (Exception e) {
                throw new RuntimeException("JWT token validation failed: " + e.getMessage());
            }
        }
        
        return sseService.createEmitter(projectId);
    }

    /**
     * Health check endpoint for SSE
     */
    @GetMapping("/health")
    public String health() {
        return "SSE Service is running";
    }
}