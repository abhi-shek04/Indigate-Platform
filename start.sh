#!/bin/bash
cd /home/z/my-project
while true; do
  echo "Starting server..."
  SESSION_SECRET="dev-secret" NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 node --max-old-space-size=64 .next/standalone/server.js
  echo "Server crashed, restarting in 2s..."
  sleep 2
done
