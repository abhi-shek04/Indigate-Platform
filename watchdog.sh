#!/bin/bash
# IndiGate server watchdog — restarts the server if it dies
cd /home/z/my-project
while true; do
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    echo "[$(date)] Server died, restarting..."
    SESSION_SECRET="dev-secret" PORT=3000 HOSTNAME=0.0.0.0 node --max-old-space-size=48 .next/standalone/server.js > /dev/null 2>&1 &
    sleep 2
  fi
  sleep 5
done
