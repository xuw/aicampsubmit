#!/usr/bin/env python3
"""
AI+ Bootcamp Assignment Submission Tool

This script helps students submit their assignments to the homework system.
It packages a directory into a zip file and uploads it to the specified assignment.

Usage:
    python submit.py --directory ./my-homework --assignment "Assignment 1"
    python submit.py -d ./project -a "Final Project" --server https://aicamp.iiis.co

Author: AI+ Bootcamp
"""

import argparse
import getpass
import json
import os
import sys
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

try:
    import requests
except ImportError:
    print("Error: 'requests' library is required. Install it with:")
    print("  pip install requests")
    sys.exit(1)


class SubmissionClient:
    """Client for interacting with the homework submission system."""

    def __init__(self, server_url: str):
        """
        Initialize the submission client.

        Args:
            server_url: Base URL of the server (e.g., https://aicamp.iiis.co)
        """
        self.server_url = server_url.rstrip('/')
        self.api_url = f"{self.server_url}/api"
        self.token: Optional[str] = None
        self.user_info: Optional[Dict[str, Any]] = None

    def login(self, email: str, password: str) -> bool:
        """
        Authenticate with the server and obtain a JWT token.

        Args:
            email: Student email address
            password: Student password

        Returns:
            True if login successful, False otherwise
        """
        try:
            response = requests.post(
                f"{self.api_url}/auth/login",
                json={"email": email, "password": password},
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                self.user_info = data.get('user')
                print(f"✓ Logged in as {self.user_info.get('firstName')} {self.user_info.get('lastName')}")
                print(f"  Email: {self.user_info.get('email')}")
                print(f"  Role: {self.user_info.get('role')}")
                return True
            elif response.status_code == 401:
                print("✗ Login failed: Invalid email or password")
                return False
            else:
                print(f"✗ Login failed: {response.json().get('error', 'Unknown error')}")
                return False

        except requests.exceptions.ConnectionError:
            print(f"✗ Connection error: Unable to reach server at {self.server_url}")
            print("  Please check your internet connection and server URL")
            return False
        except requests.exceptions.Timeout:
            print("✗ Connection timeout: Server took too long to respond")
            return False
        except Exception as e:
            print(f"✗ Login error: {e}")
            return False

    def get_headers(self) -> Dict[str, str]:
        """Get HTTP headers with authentication token."""
        if not self.token:
            raise ValueError("Not authenticated. Please login first.")
        return {"Authorization": f"Bearer {self.token}"}

    def find_assignment(self, assignment_name: str) -> Optional[Dict[str, Any]]:
        """
        Find an assignment by name.

        Args:
            assignment_name: Name of the assignment to find

        Returns:
            Assignment data if found, None otherwise
        """
        try:
            response = requests.get(
                f"{self.api_url}/assignments",
                headers=self.get_headers(),
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                # Handle both array and object responses
                assignments = data.get('assignments', data) if isinstance(data, dict) else data
                # Try exact match first
                for assignment in assignments:
                    if assignment['title'] == assignment_name:
                        return assignment

                # Try case-insensitive match
                for assignment in assignments:
                    if assignment['title'].lower() == assignment_name.lower():
                        return assignment

                # Try partial match
                for assignment in assignments:
                    if assignment_name.lower() in assignment['title'].lower():
                        print(f"Found similar assignment: {assignment['title']}")
                        confirm = input("Is this the correct assignment? (y/n): ").strip().lower()
                        if confirm == 'y':
                            return assignment

                print(f"✗ Assignment '{assignment_name}' not found")
                print("\nAvailable assignments:")
                for assignment in assignments:
                    due_date = datetime.fromisoformat(assignment['dueDate'].replace('Z', '+00:00'))
                    print(f"  - {assignment['title']} (Due: {due_date.strftime('%Y-%m-%d %H:%M')})")
                return None
            else:
                print(f"✗ Failed to fetch assignments: {response.json().get('error', 'Unknown error')}")
                return None

        except Exception as e:
            print(f"✗ Error fetching assignments: {e}")
            return None

    def create_submission(self, assignment_id: str, zip_path: str, text_content: str = "") -> bool:
        """
        Submit an assignment with a zip file.

        Args:
            assignment_id: ID of the assignment
            zip_path: Path to the zip file to upload
            text_content: Optional text content/comments

        Returns:
            True if submission successful, False otherwise
        """
        try:
            # Prepare the multipart form data
            files = {
                'files': (os.path.basename(zip_path), open(zip_path, 'rb'), 'application/zip')
            }

            data = {
                'assignmentId': assignment_id,
                'textContent': text_content,
                'status': 'submitted'
            }

            print(f"Uploading submission...")
            response = requests.post(
                f"{self.api_url}/submissions",
                headers=self.get_headers(),
                files=files,
                data=data,
                timeout=60
            )

            files['files'][1].close()  # Close the file

            if response.status_code in [200, 201]:
                submission_data = response.json()
                print(f"✓ Submission successful!")
                print(f"  Submission ID: {submission_data['id']}")
                print(f"  Status: {submission_data['status']}")
                if submission_data.get('submittedAt'):
                    submitted_at = datetime.fromisoformat(submission_data['submittedAt'].replace('Z', '+00:00'))
                    print(f"  Submitted at: {submitted_at.strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"  Attachments: {len(submission_data.get('attachments', []))} file(s)")
                return True
            else:
                error = response.json().get('error', 'Unknown error')
                print(f"✗ Submission failed: {error}")
                return False

        except Exception as e:
            print(f"✗ Submission error: {e}")
            return False


def create_zip_archive(directory: str, output_path: str, exclude_patterns: list = None) -> bool:
    """
    Create a zip archive from a directory.

    Args:
        directory: Directory to zip
        output_path: Path for the output zip file
        exclude_patterns: List of patterns to exclude (e.g., ['*.pyc', '__pycache__', '.git'])

    Returns:
        True if successful, False otherwise
    """
    if exclude_patterns is None:
        exclude_patterns = [
            '__pycache__', '*.pyc', '*.pyo', '.git', '.gitignore',
            '.DS_Store', 'node_modules', '.env', 'venv', '.venv',
            '*.egg-info', '.pytest_cache', '.coverage'
        ]

    try:
        directory_path = Path(directory).resolve()
        if not directory_path.exists():
            print(f"✗ Directory not found: {directory}")
            return False

        if not directory_path.is_dir():
            print(f"✗ Path is not a directory: {directory}")
            return False

        print(f"Creating zip archive from: {directory_path}")

        file_count = 0
        total_size = 0

        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(directory_path):
                # Filter out excluded directories
                dirs[:] = [d for d in dirs if not any(
                    Path(d).match(pattern) for pattern in exclude_patterns
                )]

                for file in files:
                    # Skip excluded files
                    if any(Path(file).match(pattern) for pattern in exclude_patterns):
                        continue

                    file_path = Path(root) / file
                    arcname = file_path.relative_to(directory_path.parent)

                    zipf.write(file_path, arcname)
                    file_count += 1
                    total_size += file_path.stat().st_size

        zip_size = Path(output_path).stat().st_size
        print(f"✓ Zip archive created: {output_path}")
        print(f"  Files: {file_count}")
        print(f"  Original size: {total_size / 1024:.1f} KB")
        print(f"  Compressed size: {zip_size / 1024:.1f} KB")
        print(f"  Compression ratio: {(1 - zip_size/total_size)*100:.1f}%")

        return True

    except Exception as e:
        print(f"✗ Error creating zip archive: {e}")
        return False


def load_config() -> Dict[str, str]:
    """
    Load configuration from ~/.aibootcamp/config.json if it exists.

    Returns:
        Configuration dictionary
    """
    config_dir = Path.home() / '.aibootcamp'
    config_file = config_dir / 'config.json'

    default_config = {
        'server_url': 'http://localhost',
        'email': ''
    }

    if config_file.exists():
        try:
            with open(config_file, 'r') as f:
                return {**default_config, **json.load(f)}
        except Exception as e:
            print(f"Warning: Failed to load config from {config_file}: {e}")

    return default_config


def save_config(config: Dict[str, str]):
    """
    Save configuration to ~/.aibootcamp/config.json.

    Args:
        config: Configuration dictionary to save
    """
    config_dir = Path.home() / '.aibootcamp'
    config_file = config_dir / 'config.json'

    try:
        config_dir.mkdir(parents=True, exist_ok=True)
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
    except Exception as e:
        print(f"Warning: Failed to save config to {config_file}: {e}")


def main():
    """Main entry point for the submission script."""
    parser = argparse.ArgumentParser(
        description='Submit assignments to the AI+ Bootcamp homework system',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s -d ./homework1 -a "Assignment 1"
  %(prog)s --directory ./project --assignment "Final Project" --server https://aicamp.iiis.co
  %(prog)s -d ./hw2 -a "Homework 2" --comment "Completed all bonus problems"

Configuration:
  The script saves your server URL and email to ~/.aibootcamp/config.json
  for convenience in future submissions.
        """
    )

    parser.add_argument(
        '-d', '--directory',
        required=True,
        help='Directory to submit (will be zipped)'
    )

    parser.add_argument(
        '-a', '--assignment',
        required=True,
        help='Assignment name (must match exactly)'
    )

    parser.add_argument(
        '-s', '--server',
        help='Server URL (default: from config or http://localhost)'
    )

    parser.add_argument(
        '-e', '--email',
        help='Your email address (will be saved for future use)'
    )

    parser.add_argument(
        '-c', '--comment',
        default='',
        help='Optional comment or text content for the submission'
    )

    parser.add_argument(
        '--no-save',
        action='store_true',
        help='Do not save email and server URL to config file'
    )

    args = parser.parse_args()

    # Load configuration
    config = load_config()

    # Determine server URL
    server_url = args.server or config.get('server_url', 'http://localhost')

    # Determine email
    email = args.email or config.get('email', '')
    if not email:
        email = input("Email: ").strip()

    # Get password (never saved)
    password = getpass.getpass("Password: ")

    print()
    print("=" * 60)
    print("AI+ Bootcamp Assignment Submission")
    print("=" * 60)
    print()

    # Create submission client
    client = SubmissionClient(server_url)

    # Login
    print("Authenticating...")
    if not client.login(email, password):
        sys.exit(1)

    print()

    # Find assignment
    print(f"Looking for assignment: {args.assignment}")
    assignment = client.find_assignment(args.assignment)
    if not assignment:
        sys.exit(1)

    print(f"✓ Found assignment: {assignment['title']}")
    due_date = datetime.fromisoformat(assignment['dueDate'].replace('Z', '+00:00'))
    print(f"  Assignment ID: {assignment['id']}")
    print(f"  Due date: {due_date.strftime('%Y-%m-%d %H:%M')}")

    # Check if past due
    now = datetime.now(due_date.tzinfo)
    if now > due_date:
        if assignment.get('allowLateSubmission'):
            print(f"  ⚠ Warning: This assignment is past due (late submission allowed)")
        else:
            print(f"  ✗ Error: This assignment is past due and late submissions are not allowed")
            sys.exit(1)

    print()

    # Create zip archive
    temp_dir = Path.home() / '.aibootcamp' / 'temp'
    temp_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    directory_name = Path(args.directory).name
    zip_filename = f"{directory_name}_{timestamp}.zip"
    zip_path = temp_dir / zip_filename

    if not create_zip_archive(args.directory, str(zip_path)):
        sys.exit(1)

    print()

    # Submit
    if client.create_submission(assignment['id'], str(zip_path), args.comment):
        # Save configuration
        if not args.no_save:
            config['server_url'] = server_url
            config['email'] = email
            save_config(config)
            print(f"\n✓ Configuration saved to ~/.aibootcamp/config.json")

        # Clean up temp file
        try:
            os.remove(zip_path)
        except:
            pass

        print()
        print("=" * 60)
        print("Submission completed successfully!")
        print("=" * 60)
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == '__main__':
    main()
