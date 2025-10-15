# AI+ Bootcamp - Assignment Submission Guide

This guide explains how to submit your assignments using the command-line submission tool.

## Prerequisites

- Python 3.6 or higher (no additional libraries required!)

**Note**: This script uses only Python standard library (urllib, zipfile, json, etc.) for maximum portability. No `pip install` needed!

## Quick Start

### 1. Download the Submission Script

Download `submit.py` from the course website or repository and save it to a convenient location (e.g., your home directory or a course folder).

### 2. Make it Executable (Linux/Mac)

```bash
chmod +x submit.py
```

### 3. List Available Assignments

```bash
python3 submit.py --list-assignments
# or
python3 submit.py -l
```

This will show you all active assignments with due dates.

### 4. Submit Your Assignment

```bash
python3 submit.py --directory ./my-homework --assignment "Assignment 1"
# or
python3 submit.py -d ./homework1 -a "Assignment 1"
```

## Detailed Usage

### Basic Submission

The minimal command requires just two parameters:

```bash
python submit.py -d <directory-path> -a "<assignment-name>"
```

**Example:**

```bash
python submit.py -d ./homework1 -a "Assignment 1"
```

### First Time Setup

On your first submission, you'll be asked to provide:

1. **Email address** - Your registered student email
2. **Password** - Your account password (not saved, entered securely)

The script connects to the production server (`https://aicamp.iiis.co:9443`) by default. Your email will be saved to `~/.aibootcamp/config.json` for future use.

**Note**: If you need to connect to a different server (e.g., for local testing), use the `--server` flag.

### Command Line Options

| Option | Short | Description | Required |
|--------|-------|-------------|----------|
| `--list-assignments` | `-l` | List all active assignments and exit | No |
| `--directory` | `-d` | Directory to submit (will be zipped) | For submission |
| `--assignment` | `-a` | Assignment name (must match exactly) | For submission |
| `--server` | `-s` | Server URL (default: https://aicamp.iiis.co:9443) | No |
| `--email` | `-e` | Your email address | No* |
| `--comment` | `-c` | Optional comment for the submission | No |
| `--no-save` | | Don't save email/server to config file | No |

*These are saved after first use and reused automatically.

### Examples

#### List all active assignments:

```bash
python3 submit.py --list-assignments
# or
python3 submit.py -l
```

This shows:
- Assignment names
- Due dates
- Time remaining
- Brief descriptions
- Late submission status

#### Submit with custom server URL:

```bash
python3 submit.py \
  -d ./project \
  -a "Final Project" \
  -s https://aicamp.iiis.co
```

#### Submit with a comment:

```bash
python3 submit.py \
  -d ./homework2 \
  -a "Homework 2" \
  -c "Completed all bonus problems. Please review the extra-credit.py file."
```

#### Submit without saving credentials:

```bash
python3 submit.py \
  -d ./assignment3 \
  -a "Assignment 3" \
  --no-save
```

## What Gets Submitted?

### Included Files

The script automatically zips your entire directory, including:
- All source code files
- Data files
- Documentation
- Notebooks (.ipynb)
- Any other files in the directory

### Excluded Files (Automatically)

The following are automatically excluded from the zip:
- `__pycache__/` and `*.pyc` files
- `.git/` and `.gitignore`
- `node_modules/`
- `.env` files
- Virtual environments (`venv/`, `.venv/`)
- `.DS_Store` (Mac)
- Build artifacts (`*.egg-info/`, `.pytest_cache/`, `.coverage`)

## Workflow

### Step-by-Step Process

1. **Prepare Your Work**
   ```bash
   cd ~/courses/aibootcamp
   # Your work is in ./homework1/
   ```

2. **Run Submission Script**
   ```bash
   python submit.py -d ./homework1 -a "Homework 1"
   ```

3. **Authenticate**
   ```
   Email: student@example.com
   Password: ********
   ```

4. **Verify Assignment**
   The script will:
   - Find the assignment by name
   - Show the due date
   - Warn if past due
   - Ask for confirmation if name doesn't match exactly

5. **Create Archive**
   ```
   Creating zip archive from: /Users/student/courses/aibootcamp/homework1
   ✓ Zip archive created: homework1_20251015_143052.zip
     Files: 15
     Original size: 245.3 KB
     Compressed size: 89.7 KB
     Compression ratio: 63.4%
   ```

6. **Upload**
   ```
   Uploading submission...
   ✓ Submission successful!
     Submission ID: abc123-def456
     Status: submitted
     Submitted at: 2025-10-15 14:30:55
     Attachments: 1 file(s)
   ```

## Configuration File

The script saves your preferences to `~/.aibootcamp/config.json`:

```json
{
  "server_url": "https://aicamp.iiis.co:9443",
  "email": "student@example.com"
}
```

You can edit this file manually or delete it to reset.

**Note**: If you're upgrading from an older version of the script, you may need to update or delete your config file to use the new default production server.

## Troubleshooting

### Wrong Server (Connecting to Localhost)

**Problem:** Script connects to localhost instead of production server

**Solution:** Your config file has the old server URL saved. Update it:
```bash
# Option 1: Delete the config file to reset to defaults
rm ~/.aibootcamp/config.json

# Option 2: Edit the config file manually
# Change "server_url" to "https://aicamp.iiis.co:9443"
```

### Connection Errors

**Problem:** `Connection error: Unable to reach server`

**Solutions:**
1. Check your internet connection
2. Verify the server URL is correct
3. Try accessing the server in your web browser
4. Contact your instructor if the server is down

### Authentication Errors

**Problem:** `Login failed: Invalid email or password`

**Solutions:**
1. Double-check your email address
2. Verify your password (passwords are case-sensitive)
3. Reset your password through the web interface if forgotten
4. Ensure you've registered for an account

### Assignment Not Found

**Problem:** `Assignment 'Homework X' not found`

**Solutions:**
1. Check the exact assignment name on the web interface
2. Copy and paste the assignment name to ensure exact match
3. The script will show available assignments - use one of those names
4. Assignment names are case-sensitive

### File Too Large

**Problem:** Submission fails with file size error

**Solutions:**
1. Check the assignment's file size limit
2. Remove large data files or binary files if not required
3. Check if you accidentally included `node_modules/` or other large directories
4. Contact your instructor if you need to submit large files

### Past Due Date

**Problem:** `Assignment is past due and late submissions are not allowed`

**Solutions:**
1. Check the assignment due date on the web interface
2. Contact your instructor for an extension
3. Some assignments allow late submissions - check with your instructor

## Tips for Students

### Best Practices

1. **Test Before Submitting**
   - Always test your code before submission
   - Include a README if required
   - Check that all required files are present

2. **Submit Early**
   - Don't wait until the last minute
   - You can resubmit multiple times (latest submission counts)
   - Early submissions give you time to fix issues

3. **Verify Submission**
   - Check the web interface to confirm your submission
   - View the uploaded files to ensure completeness
   - Look for the "submitted" status

4. **Organize Your Files**
   ```
   homework1/
   ├── README.md
   ├── main.py
   ├── test_main.py
   ├── requirements.txt
   └── data/
       └── sample.csv
   ```

5. **Use Version Control**
   - Keep your work in git (but .git won't be submitted)
   - Make regular commits
   - Don't submit your `.git` directory (it's excluded automatically)

### Resubmitting

You can submit multiple times to the same assignment. The system will:
- Update your previous submission
- Replace old files with new ones
- Keep the latest submission timestamp
- Preserve your submission history

Just run the same command again:

```bash
python submit.py -d ./homework1 -a "Homework 1"
```

### Adding Comments

Use the `--comment` flag to provide context:

```bash
python submit.py \
  -d ./homework3 \
  -a "Homework 3" \
  -c "Implemented bonus feature: recursive algorithm optimization"
```

## Security Notes

- **Passwords are NEVER saved** - You must enter your password each time
- **Credentials are sent over HTTPS** (when using https:// server URL)
- **Tokens expire after 24 hours** - You'll need to login again
- **Config file is stored in your home directory** - Keep your computer secure

## Getting Help

1. **Check Assignment Details** - View on the web interface
2. **Run with --help**
   ```bash
   python submit.py --help
   ```
3. **Contact Your TA or Instructor**
4. **Check the Course Forum** - Other students may have similar questions

## Advanced Usage

### Multiple Submissions

Submit to different assignments in sequence:

```bash
python submit.py -d ./hw1 -a "Homework 1"
python submit.py -d ./hw2 -a "Homework 2"
python submit.py -d ./final -a "Final Project"
```

### Scripted Submissions

Create a shell script for repeated submissions:

```bash
#!/bin/bash
# submit.sh
python submit.py -d ./current-assignment -a "Weekly Assignment $1"
```

Usage:
```bash
./submit.sh 1  # Submits to "Weekly Assignment 1"
./submit.sh 2  # Submits to "Weekly Assignment 2"
```

### CI/CD Integration

You can use this script in automated workflows (with caution):

```yaml
# .github/workflows/submit.yml
# WARNING: Never commit passwords or tokens to git!
# Use GitHub Secrets for credentials
```

Note: Automated submissions should be discussed with your instructor first.

## Version History

- **v1.0** - Initial release with directory zipping and JWT authentication
- Features: Login, assignment lookup, zip creation, file upload, config persistence

---

**Need Help?** Contact your course instructor or TA.

**Found a Bug?** Report issues to your course staff.
