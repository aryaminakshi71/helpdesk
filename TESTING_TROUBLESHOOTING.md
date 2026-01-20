# Helpdesk Testing Troubleshooting

## Port 3004 Already in Use

If you see `Error: Port 3004 is already in use`, here are solutions:

### Solution 1: Kill the existing process (Recommended)

```bash
# Find and kill the process using port 3004
lsof -ti:3004 | xargs kill -9

# Or manually find the PID and kill it
lsof -ti:3004
kill -9 <PID>
```

### Solution 2: Stop existing dev servers

If you have a Helpdesk dev server running in another terminal:
```bash
# Press Ctrl+C in that terminal to stop it
# Or find and kill it:
ps aux | grep "vite dev" | grep helpdesk
kill -9 <PID>
```

### Solution 3: Use a different port temporarily

If you need to run multiple instances:

1. Update `helpdesk/apps/web/vite.config.ts`:
```typescript
server: {
  port: 3006, // Use a different port
  strictPort: false,
},
```

2. Update `helpdesk/playwright.config.ts`:
```typescript
use: {
  baseURL: 'http://localhost:3006', // Match the new port
},
webServer: {
  url: 'http://localhost:3006', // Match the new port
},
```

### Solution 4: Check for zombie processes

Sometimes processes don't clean up properly:
```bash
# Check all node/bun processes
ps aux | grep -E "(node|bun|vite)" | grep helpdesk

# Kill any zombie processes
pkill -f "helpdesk.*vite"
```

## Playwright Config Notes

- `reuseExistingServer: !process.env.CI` - Will reuse an existing server if it's responding
- If the existing server isn't responding, Playwright will try to start a new one
- If port is in use and server isn't responding, you'll get the port conflict error

## Best Practice

Before running Playwright tests:
1. Stop any manually running dev servers
2. Ensure port 3004 is free: `lsof -ti:3004` should return nothing
3. Run tests: `cd helpdesk && bunx playwright test`
