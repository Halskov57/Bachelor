# Rate Limiting Implementation Summary

## Overview
Successfully implemented rate limiting in your Spring Boot backend to prevent spam and protect against abuse.

## Rate Limits Applied

### Authenticated Users
- **SUPER_ADMIN**: 200 requests per minute
- **Regular Users** (students/teachers): 100 requests per minute

### Unauthenticated Requests
- **IP-based**: 10 requests per minute

## Implementation Details

### Files Created/Modified

1. **pom.xml**
   - Added Bucket4j dependency (v8.10.1) for rate limiting

2. **RateLimitExceededException.java** (NEW)
   - Custom exception thrown when rate limit is exceeded
   - Includes retry-after time information

3. **RateLimitInterceptor.java** (NEW)
   - Intercepts all HTTP requests
   - Applies rate limits based on user identity and role
   - Uses in-memory token bucket algorithm
   - Returns helpful headers: `X-RateLimit-Remaining` and `X-RateLimit-Retry-After-Seconds`

4. **RateLimitConfig.java** (NEW)
   - Registers the rate limit interceptor
   - Applies to all endpoints (except actuator health checks if present)

5. **GraphQLExceptionHandler.java** (UPDATED)
   - Added handler for `RateLimitExceededException`
   - Returns proper GraphQL error with retry information

## How It Works

1. **Per-User Limits**: Authenticated users are tracked by username
2. **Per-IP Limits**: Unauthenticated requests are tracked by IP address
3. **Token Bucket**: Each user/IP gets a bucket that refills every minute
4. **Automatic Refill**: Tokens replenish at the start of each new minute
5. **Role-Based**: Super admins get higher limits automatically

## Response Headers

When rate limit is enforced, the following headers are returned:
- `X-RateLimit-Remaining`: Number of requests remaining
- `X-RateLimit-Retry-After-Seconds`: Seconds to wait before retrying (when limit exceeded)

## Error Response Example

When rate limit is exceeded, GraphQL returns:
```json
{
  "errors": [
    {
      "message": "Rate limit exceeded. Please try again in 60 seconds.",
      "extensions": {
        "code": "RATE_LIMIT_EXCEEDED",
        "retryAfterSeconds": 60
      }
    }
  ]
}
```

## Testing the Rate Limit

To test:
1. Make rapid requests to any GraphQL endpoint
2. After 100 requests (or 200 for admin), you'll get rate limit error
3. Wait 60 seconds or until the minute resets
4. Requests will work again

## Advantages

✅ **User-specific**: Tracks by username, not just IP
✅ **Role-aware**: Admins get higher limits
✅ **GraphQL compatible**: Works seamlessly with your GraphQL API
✅ **Memory efficient**: Uses lightweight in-memory buckets
✅ **Configurable**: Easy to adjust limits in code
✅ **Informative**: Clear error messages and retry times

## Future Enhancements (Optional)

- Add distributed rate limiting with Redis for multi-instance deployments
- Implement cleanup job to remove old buckets from memory
- Add configuration file for adjusting limits without code changes
- Add metrics/logging for rate limit violations
- Different limits for specific endpoints (e.g., lower for mutations)

## Configuration Adjustments

To change rate limits, edit `RateLimitInterceptor.java`:
- **Line 80-85**: Admin limits
- **Line 88-93**: Regular user limits  
- **Line 100-105**: Unauthenticated/IP limits

## Notes

- Rate limits reset every minute
- Limits are per-user (not per-session)
- SSE connections are also rate limited
- Health check endpoints are excluded
