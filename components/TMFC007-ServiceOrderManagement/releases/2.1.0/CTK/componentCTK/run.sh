#!/bin/bash
echo "🚀 Starting CTK Execution inside Docker..."

# Move into scripts folder and run the CTK Executor
cd scripts
python3 CTK_Executor.py

echo "✅ CTK execution complete."
