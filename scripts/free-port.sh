#!/bin/bash

# Free port 3004 for Helpdesk tests
# Usage: ./scripts/free-port.sh

PORT=3004

echo "Checking for processes using port $PORT..."

PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
  echo "✅ Port $PORT is free"
  exit 0
fi

echo "Found process $PID using port $PORT"
echo "Killing process $PID..."

kill -9 $PID 2>/dev/null

# Wait a moment for the port to be released
sleep 1

# Verify port is free
if lsof -ti:$PORT > /dev/null 2>&1; then
  echo "❌ Failed to free port $PORT"
  exit 1
else
  echo "✅ Port $PORT is now free"
  exit 0
fi
