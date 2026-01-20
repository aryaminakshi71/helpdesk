# Port 3004 Conflict Fix

**Issue:** Port 3004 was already in use when running Playwright tests.

## Solution

The port conflict was resolved by killing the process using port 3004.

## Prevention

The Playwright config has `reuseExistingServer: !process.env.CI` which should reuse an existing server. However, if you encounter this issue:

### Option 1: Kill the process manually
```bash
# Find the process
lsof -ti:3004

# Kill it
kill -9 <PID>
```

### Option 2: Use a different port
If you need to run multiple instances, you can temporarily change the port in:
- `helpdesk/apps/web/vite.config.ts` (server.port)
- `helpdesk/playwright.config.ts` (baseURL and webServer.url)

### Option 3: Stop existing dev servers
Make sure to stop any running `bun run dev` processes before running Playwright tests.

## Status

✅ Port 3004 is now free and tests should run successfully.
