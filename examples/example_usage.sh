#!/bin/bash
# Example usage of the submit.py script
# This file shows various ways to use the submission tool

echo "=== AI+ Bootcamp Submission Script Examples ==="
echo ""

# Example 1: Basic submission
echo "Example 1: Basic submission (you'll be prompted for credentials)"
echo "python submit.py -d ./my-homework -a \"Assignment 1\""
echo ""

# Example 2: With server URL
echo "Example 2: Specify server URL"
echo "python submit.py -d ./project -a \"Final Project\" -s https://aicamp.iiis.co"
echo ""

# Example 3: With comment
echo "Example 3: Add a comment to your submission"
echo "python submit.py -d ./hw2 -a \"Homework 2\" -c \"Completed all bonus problems\""
echo ""

# Example 4: With email pre-filled
echo "Example 4: Pre-fill email (password will still be prompted)"
echo "python submit.py -d ./assignment3 -a \"Assignment 3\" -e student@example.com"
echo ""

# Example 5: Full example with all options
echo "Example 5: Complete example with all options"
echo "python submit.py \\"
echo "  --directory ./final-project \\"
echo "  --assignment \"Final Project\" \\"
echo "  --server https://aicamp.iiis.co \\"
echo "  --email student@example.com \\"
echo "  --comment \"This project includes the optional advanced features\""
echo ""

# Example 6: Using short options
echo "Example 6: Same as above but with short options"
echo "python submit.py \\"
echo "  -d ./final-project \\"
echo "  -a \"Final Project\" \\"
echo "  -s https://aicamp.iiis.co \\"
echo "  -e student@example.com \\"
echo "  -c \"This project includes the optional advanced features\""
echo ""

# Example 7: Don't save config
echo "Example 7: Submit without saving credentials to config file"
echo "python submit.py -d ./one-time-submit -a \"Extra Credit\" --no-save"
echo ""

echo "=== Tips ==="
echo ""
echo "1. The script automatically excludes common files like:"
echo "   - __pycache__/, *.pyc (Python cache)"
echo "   - .git/ (Git repository)"
echo "   - node_modules/ (Node.js dependencies)"
echo "   - .env (Environment variables)"
echo "   - venv/, .venv/ (Virtual environments)"
echo ""
echo "2. Your email and server URL are saved to ~/.aibootcamp/config.json"
echo "   after the first submission (unless you use --no-save)"
echo ""
echo "3. Password is NEVER saved - you enter it each time"
echo ""
echo "4. You can submit multiple times - the latest submission is kept"
echo ""
echo "5. Use --help to see all options:"
echo "   python submit.py --help"
echo ""
