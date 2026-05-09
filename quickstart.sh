#!/bin/bash

# Payment Gateway - Quick Start Guide

echo "🚀 Payment Gateway - Quick Start"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✓ Node.js $(node -v) found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Build project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✓ Project built successfully"
echo ""

# Start development server
echo "🎯 Starting development server..."
npm run dev

echo ""
echo "✅ Application is running!"
echo "📱 Open browser: http://localhost:3000"
echo ""
