#!/bin/bash
echo "🚀 Starting CTK Execution (macOS/Linux)..."

# Step 1: Change to the componentCTK/scripts directory
cd "$(dirname "$0")/scripts"

# Step 2: Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Step 3: Run CTK Executor
echo "🧪 Running CTK Executor..."
python3 CTK_Executor.py

echo "✅ CTK execution complete."
