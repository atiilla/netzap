#!/bin/bash

# Kill any running Next.js processes
echo "Stopping any running Next.js processes..."
pkill -f "node.*next"

# Start the dev server with simulation mode enabled
echo "Starting Next.js dev server..."
npm run dev 