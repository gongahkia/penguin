#!/bin/bash
# Penguin OS Setup Script
# This script demonstrates the advanced terminal features

echo "Starting Penguin OS setup..."

# Create directory structure
mkdir Projects
mkdir Projects/scripts
mkdir Projects/data

# Set some environment variables
export PROJECT_ROOT="$HOME/Projects"
export DATA_DIR="$PROJECT_ROOT/data"

# Create sample files
echo "Welcome to Penguin OS" > welcome.txt
echo "This is a sample data file" > Projects/data/sample.txt

# Create a script that uses piping
echo "Creating demonstration scripts..."

cat > Projects/scripts/file-report.sh << 'EOL'
#!/bin/bash
# File Report Script
echo "=== File System Report ==="
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la | grep -v "^d" | wc -l | tr '\n' ' ' && echo "files found"
echo ""
echo "Directories:"
ls -la | grep "^d" | tail -n +2
EOL

# Show the created structure
echo "Setup complete! Directory structure:"
find $HOME -name "*" | head -20

echo "You can now test advanced terminal features:"
echo "  - Piping: ls | grep txt"
echo "  - Redirection: echo 'Hello' > test.txt"
echo "  - Variables: echo \$PROJECT_ROOT"
echo "  - Script execution: ./Projects/scripts/file-report.sh"