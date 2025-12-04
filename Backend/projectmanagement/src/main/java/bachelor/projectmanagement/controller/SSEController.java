package bachelor.projectmanagement.controller;

import bachelor.projectmanagement.service.SSEService;
import bachelor.projectmanagement.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/sse")
public class SSEController {

    @Autowired
    private SSEService sseService;
    
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Health check endpoint for SSE service
     * @return Simple OK response
     */
    @GetMapping("/health")
    public String health() {
        return "OK";
    }

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
                String cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;
                
                // Validate the token (will throw exception if invalid)
                jwtUtil.validateToken(cleanToken);
            } catch (Exception e) {
                throw new RuntimeException("JWT token validation failed: " + e.getMessage());
            }
        }
        
        return sseService.createEmitter(projectId);
    }
}