# WebSocket Connection Debug Guide

## 🔍 Current Issue Analysis

The WebSocket connections are reaching the server (we can see session IDs in logs), but Spring GraphQL WebSocket handler is failing with:

```
java.lang.IllegalArgumentException: No SessionInfo for StandardWebSocketSession
```

This indicates a **protocol mismatch** between the frontend GraphQL-WS client and Spring GraphQL WebSocket handler.

## 🧪 Debugging Steps

### Step 1: Test Basic WebSocket Connection

In your browser console, try a simple WebSocket test:

```javascript
// Test 1: Basic WebSocket connection
const ws = new WebSocket('ws://localhost:8081/graphql');

ws.onopen = () => {
    console.log('✅ Basic WebSocket connected');
    ws.close(); // Close immediately after connecting
};

ws.onerror = (error) => {
    console.error('❌ Basic WebSocket error:', error);
};

ws.onclose = (event) => {
    console.log('🔌 Basic WebSocket closed:', event.code, event.reason);
};
```

### Step 2: Test with GraphQL-WS Protocol

```javascript
// Test 2: GraphQL-WS protocol test
const ws2 = new WebSocket('ws://localhost:8081/graphql', 'graphql-ws');

ws2.onopen = () => {
    console.log('✅ GraphQL-WS connected, sending connection_init...');
    
    // Send GraphQL-WS connection_init message
    ws2.send(JSON.stringify({
        type: 'connection_init',
        payload: {}
    }));
};

ws2.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('📨 GraphQL-WS received:', message);
    
    if (message.type === 'connection_ack') {
        console.log('✅ GraphQL-WS connection acknowledged!');
        ws2.close();
    }
};

ws2.onerror = (error) => {
    console.error('❌ GraphQL-WS error:', error);
};
```

## 🔧 Potential Solutions

### Solution 1: Spring GraphQL Transport Protocol Issue

The issue might be that Spring GraphQL expects a different WebSocket sub-protocol or transport format. Try updating the `application.properties`:

```properties
# Try different GraphQL WebSocket configurations
spring.graphql.websocket.path=/graphql
spring.graphql.websocket.connection-init-timeout=60s
spring.graphql.websocket.keep-alive-interval=30s

# Disable WebSocket authentication for testing
spring.graphql.websocket.interceptors=
```

### Solution 2: Switch to Different WebSocket Endpoint

Some Spring GraphQL versions expect WebSocket subscriptions on a different path. Try:

- `ws://localhost:8081/subscriptions`
- `ws://localhost:8081/graphql/websocket`
- `ws://localhost:8081/graphql-ws`

### Solution 3: Protocol Version Issue

The frontend might be using `graphql-ws` protocol while Spring expects `graphql-transport-ws`. Check your Apollo Client configuration.

## 📋 Next Steps to Try

1. **Test Basic Connection**: Run the WebSocket tests above
2. **Check Server Logs**: Look for connection handshake messages
3. **Verify Protocol**: Ensure frontend and backend use same WebSocket sub-protocol
4. **Try Alternative Paths**: Test different WebSocket endpoint paths
5. **Check Dependencies**: Verify Spring GraphQL WebSocket versions

## 🎯 Expected Success

Once working, you should see:
- ✅ WebSocket connection established
- ✅ `connection_ack` message received
- ✅ No `SessionInfo` errors in backend logs
- ✅ Successful subscription registration

Let me know the results of the basic WebSocket tests, and we can determine the exact protocol issue!