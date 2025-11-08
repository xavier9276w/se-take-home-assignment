#!/bin/bash

# Build Script
# This script should contain all compilation steps for your CLI application

echo "Building CLI application..."

# Install dependencies
npm install

# Compile TypeScript to JavaScript
npm run build

echo "Build completed"