#!/bin/bash

# Unit Test Script
# This script should contain all unit test execution steps

set -e  # Exit on error

echo "Running unit tests..."

# Run Jest tests
npm test

echo "All unit tests passed successfully!"
