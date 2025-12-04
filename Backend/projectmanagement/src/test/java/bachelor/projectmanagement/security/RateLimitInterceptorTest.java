package bachelor.projectmanagement.security;

import bachelor.projectmanagement.exception.RateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RateLimitInterceptorTest {

    private RateLimitInterceptor rateLimitInterceptor;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        rateLimitInterceptor = new RateLimitInterceptor();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();
    }

    @Test
    void preHandle_ShouldAllowRequestsWithinLimit() {
        // Given
        setupAuthenticatedUser("testuser", "USER");

        // When & Then - First 100 requests should be allowed (regular user limit)
        for (int i = 0; i < 100; i++) {
            boolean result = rateLimitInterceptor.preHandle(request, response, null);
            assertTrue(result, "Request " + (i + 1) + " should be allowed");
        }
    }

    @Test
    void preHandle_ShouldBlockRequestsExceedingLimit() {
        // Given
        setupAuthenticatedUser("testuser", "USER");

        // When - Exhaust the rate limit (100 requests for regular users)
        for (int i = 0; i < 100; i++) {
            rateLimitInterceptor.preHandle(request, response, null);
        }

        // Then - 101st request should be blocked
        assertThrows(RateLimitExceededException.class, () -> {
            rateLimitInterceptor.preHandle(request, response, null);
        });
    }

    @Test
    void preHandle_ShouldAllowMoreRequestsForSuperAdmin() {
        // Given
        setupAuthenticatedUser("admin", "SUPER_ADMIN");

        // When & Then - First 200 requests should be allowed (super admin limit)
        for (int i = 0; i < 200; i++) {
            boolean result = rateLimitInterceptor.preHandle(request, response, null);
            assertTrue(result, "Request " + (i + 1) + " should be allowed for super admin");
        }
    }

    @Test
    void preHandle_ShouldBlockSuperAdminAfterLimit() {
        // Given
        setupAuthenticatedUser("admin", "SUPER_ADMIN");

        // When - Exhaust the rate limit (200 requests for super admins)
        for (int i = 0; i < 200; i++) {
            rateLimitInterceptor.preHandle(request, response, null);
        }

        // Then - 201st request should be blocked
        assertThrows(RateLimitExceededException.class, () -> {
            rateLimitInterceptor.preHandle(request, response, null);
        });
    }

    @Test
    void preHandle_ShouldApplyStrictLimitForUnauthenticatedRequests() {
        // Given - No authentication (unauthenticated user)
        request.setRemoteAddr("192.168.1.1");

        // When & Then - Only 10 requests should be allowed for unauthenticated
        for (int i = 0; i < 10; i++) {
            boolean result = rateLimitInterceptor.preHandle(request, response, null);
            assertTrue(result, "Request " + (i + 1) + " should be allowed for unauthenticated");
        }
    }

    @Test
    void preHandle_ShouldBlockUnauthenticatedAfterLimit() {
        // Given
        request.setRemoteAddr("192.168.1.1");

        // When - Exhaust the limit (10 requests for unauthenticated)
        for (int i = 0; i < 10; i++) {
            rateLimitInterceptor.preHandle(request, response, null);
        }

        // Then - 11th request should be blocked
        assertThrows(RateLimitExceededException.class, () -> {
            rateLimitInterceptor.preHandle(request, response, null);
        });
    }

    @Test
    void preHandle_ShouldSetRateLimitRemainingHeader() {
        // Given
        setupAuthenticatedUser("testuser", "USER");

        // When
        rateLimitInterceptor.preHandle(request, response, null);

        // Then
        String remaining = response.getHeader("X-RateLimit-Remaining");
        assertNotNull(remaining);
        assertEquals("99", remaining); // Started with 100, consumed 1
    }

    @Test
    void preHandle_ShouldSetRetryAfterHeaderWhenLimitExceeded() {
        // Given
        setupAuthenticatedUser("testuser", "USER");
        
        // When - Exhaust the limit
        for (int i = 0; i < 100; i++) {
            rateLimitInterceptor.preHandle(request, response, null);
        }

        // Then - Next request should set retry-after header
        try {
            rateLimitInterceptor.preHandle(request, response, null);
            fail("Should have thrown RateLimitExceededException");
        } catch (RateLimitExceededException e) {
            String retryAfter = response.getHeader("X-RateLimit-Retry-After-Seconds");
            assertNotNull(retryAfter);
            assertEquals("60", retryAfter);
        }
    }

    @Test
    void preHandle_ShouldTrackDifferentUsersIndependently() {
        // Given
        setupAuthenticatedUser("user1", "USER");
        
        // When - User1 makes requests
        for (int i = 0; i < 50; i++) {
            rateLimitInterceptor.preHandle(request, response, null);
        }

        // Switch to user2
        SecurityContextHolder.clearContext();
        setupAuthenticatedUser("user2", "USER");

        // Then - User2 should have full quota
        boolean result = rateLimitInterceptor.preHandle(request, response, null);
        assertTrue(result);
        String remaining = response.getHeader("X-RateLimit-Remaining");
        assertEquals("99", remaining); // User2's first request
    }

    @Test
    void preHandle_ShouldUseIPAddressForUnauthenticated() {
        // Given
        request.setRemoteAddr("192.168.1.1");

        // When
        for (int i = 0; i < 5; i++) {
            rateLimitInterceptor.preHandle(request, response, null);
        }

        // Create new request from different IP
        MockHttpServletRequest request2 = new MockHttpServletRequest();
        MockHttpServletResponse response2 = new MockHttpServletResponse();
        request2.setRemoteAddr("192.168.1.2");

        // Then - Different IP should have separate quota
        boolean result = rateLimitInterceptor.preHandle(request2, response2, null);
        assertTrue(result);
        String remaining = response2.getHeader("X-RateLimit-Remaining");
        assertEquals("9", remaining); // First request from this IP
    }

    @Test
    void preHandle_ShouldHandleXForwardedForHeader() {
        // Given
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Forwarded-For", "203.0.113.1, 198.51.100.1");

        // When
        rateLimitInterceptor.preHandle(request, response, null);

        // Then - Should use first IP from X-Forwarded-For
        // Making more requests to verify it's using the same bucket
        for (int i = 1; i < 10; i++) {
            rateLimitInterceptor.preHandle(request, response, null);
        }
        
        // 11th request should fail
        assertThrows(RateLimitExceededException.class, () -> {
            rateLimitInterceptor.preHandle(request, response, null);
        });
    }

    @Test
    void preHandle_ShouldIgnoreAnonymousUser() {
        // Given
        Authentication auth = new UsernamePasswordAuthenticationToken(
            "anonymousUser", 
            null, 
            List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        request.setRemoteAddr("192.168.1.1");

        // When & Then - Should use IP-based rate limiting (10 requests)
        for (int i = 0; i < 10; i++) {
            boolean result = rateLimitInterceptor.preHandle(request, response, null);
            assertTrue(result);
        }

        assertThrows(RateLimitExceededException.class, () -> {
            rateLimitInterceptor.preHandle(request, response, null);
        });
    }

    @Test
    void cleanup_ShouldNotThrowException() {
        // When & Then
        assertDoesNotThrow(() -> rateLimitInterceptor.cleanup());
    }

    @Test
    void rateLimitExceededException_ShouldHaveCorrectMessage() {
        // Given
        setupAuthenticatedUser("testuser", "USER");
        
        // When - Exhaust limit
        for (int i = 0; i < 100; i++) {
            rateLimitInterceptor.preHandle(request, response, null);
        }

        // Then
        RateLimitExceededException exception = assertThrows(RateLimitExceededException.class, () -> {
            rateLimitInterceptor.preHandle(request, response, null);
        });

        assertTrue(exception.getMessage().contains("Rate limit exceeded"));
        assertTrue(exception.getMessage().contains("60 seconds"));
    }

    private void setupAuthenticatedUser(String username, String role) {
        Authentication auth = new UsernamePasswordAuthenticationToken(
            username, 
            null, 
            List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
