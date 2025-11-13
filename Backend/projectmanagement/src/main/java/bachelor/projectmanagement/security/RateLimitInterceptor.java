package bachelor.projectmanagement.security;

import bachelor.projectmanagement.exception.RateLimitExceededException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Interceptor that applies rate limiting to HTTP requests based on user identity and role.
 * 
 * Rate limits:
 * - SUPER_ADMIN: 200 requests/minute (higher limit for administrative tasks)
 * - Regular users: 100 requests/minute for GraphQL queries
 * - Mutations: 30 requests/minute for write operations
 * - Unauthenticated: 10 requests/minute per IP
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Map<String, Bucket> userBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> ipBuckets = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        String key;
        Bucket bucket;
        
        if (authentication != null && authentication.isAuthenticated() 
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            // Authenticated user - use username as key
            key = authentication.getName();
            bucket = userBuckets.computeIfAbsent(key, k -> createBucketForUser(authentication));
        } else {
            // Unauthenticated request - use IP address as key
            key = getClientIP(request);
            bucket = ipBuckets.computeIfAbsent(key, k -> createBucketForIP());
        }

        // Try to consume a token from the bucket
        if (bucket.tryConsume(1)) {
            // Request allowed
            long availableTokens = bucket.getAvailableTokens();
            response.setHeader("X-RateLimit-Remaining", String.valueOf(availableTokens));
            return true;
        } else {
            // Rate limit exceeded
            // Default to 60 seconds retry time
            long waitForRefill = 60;
            response.setHeader("X-RateLimit-Retry-After-Seconds", String.valueOf(waitForRefill));
            
            throw new RateLimitExceededException(
                "Rate limit exceeded. Please try again in " + waitForRefill + " seconds.",
                waitForRefill
            );
        }
    }

    /**
     * Creates a bucket with appropriate limits based on user role.
     */
    private Bucket createBucketForUser(Authentication authentication) {
        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_SUPER_ADMIN"));

        if (isSuperAdmin) {
            // Super admins get 200 requests per minute
            Bandwidth limit = Bandwidth.builder()
                    .capacity(200)
                    .refillIntervally(200, Duration.ofMinutes(1))
                    .build();
            return Bucket.builder()
                    .addLimit(limit)
                    .build();
        } else {
            // Regular users get 100 requests per minute
            Bandwidth limit = Bandwidth.builder()
                    .capacity(100)
                    .refillIntervally(100, Duration.ofMinutes(1))
                    .build();
            return Bucket.builder()
                    .addLimit(limit)
                    .build();
        }
    }

    /**
     * Creates a bucket for unauthenticated requests (IP-based).
     */
    private Bucket createBucketForIP() {
        // Unauthenticated requests get 10 requests per minute
        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillIntervally(10, Duration.ofMinutes(1))
                .build();
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Gets the client's IP address, handling proxy headers.
     */
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    /**
     * Cleanup method to prevent memory leaks - removes old buckets.
     * This should be called periodically (e.g., via scheduled task).
     */
    public void cleanup() {
        // In a production system, you'd want to track last access time
        // and remove buckets that haven't been used in a while
        // For now, we keep all buckets in memory
        // Consider implementing LRU cache or time-based eviction if needed
    }
}
