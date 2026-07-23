#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting server..."
  SESSION_SECRET="dev-secret" PORT=3000 HOSTNAME=0.0.0.0 node --max-old-space-size=48 .next/standalone/server.js
  echo "[$(date)] Server crashed (exit $?), restarting in 3s..."
  sleep 3
done
