#!/usr/bin/env python3
"""
AI+ Bootcamp Assignment Submission Tool

This script helps students submit their assignments to the homework system.
It packages a directory into a zip file and uploads it to the specified assignment.

Usage:
    python submit.py --list-assignments
    python submit.py --directory ./my-homework --assignment "Assignment 1"
    python submit.py -d ./project -a "Final Project" --server https://aicamp.iiis.co

Author: AI+ Bootcamp
"""

import argparse
import getpass
import json
import mimetypes
import os
import sys
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from urllib.parse import urlencode


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

    def _make_request(self, url: str, method: str = 'GET', data: Any = None,
                     headers: Optional[Dict[str, str]] = None, timeout: int = 10) -> Dict[str, Any]:
        """
        Make an HTTP request using urllib.

        Args:
            url: URL to request
            method: HTTP method (GET, POST, etc.)
            data: Data to send (will be JSON encoded if dict)
            headers: HTTP headers
            timeout: Request timeout in seconds

        Returns:
            Response data as dictionary

        Raises:
            Exception: On request failure
        """
        if headers is None:
            headers = {}

        # Prepare request data
        request_data = None
        if data is not None:
            if isinstance(data, dict):
                request_data = json.dumps(data).encode('utf-8')
                headers['Content-Type'] = 'application/json'
            elif isinstance(data, bytes):
                request_data = data
            else:
                request_data = data.encode('utf-8')

        # Create request
        req = Request(url, data=request_data, headers=headers, method=method)

        try:
            with urlopen(req, timeout=timeout) as response:
                response_data = response.read().decode('utf-8')
                return json.loads(response_data) if response_data else {}
        except HTTPError as e:
            error_body = e.read().decode('utf-8')
            try:
                error_data = json.loads(error_body)
                raise Exception(error_data.get('error', f'HTTP {e.code}'))
            except json.JSONDecodeError:
                raise Exception(f'HTTP {e.code}: {error_body}')
        except URLError as e:
            raise Exception(f'Connection error: {e.reason}')

    def _multipart_request(self, url: str, fields: Dict[str, str],
                          files: Dict[str, tuple], headers: Optional[Dict[str, str]] = None,
                          timeout: int = 60) -> Dict[str, Any]:
        """
        Make a multipart/form-data request.

        Args:
            url: URL to request
            fields: Form fields
            files: Files to upload {field_name: (filename, file_data, content_type)}
            headers: Additional headers
            timeout: Request timeout in seconds

        Returns:
            Response data as dictionary
        """
        if headers is None:
            headers = {}

        boundary = f'----WebKitFormBoundary{os.urandom(16).hex()}'
        headers['Content-Type'] = f'multipart/form-data; boundary={boundary}'

        # Build multipart body
        body = b''

        # Add form fields
        for field_name, field_value in fields.items():
            body += f'--{boundary}\r\n'.encode('utf-8')
            body += f'Content-Disposition: form-data; name="{field_name}"\r\n\r\n'.encode('utf-8')
            body += f'{field_value}\r\n'.encode('utf-8')

        # Add files
        for field_name, (filename, file_data, content_type) in files.items():
            body += f'--{boundary}\r\n'.encode('utf-8')
            body += f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'.encode('utf-8')
            body += f'Content-Type: {content_type}\r\n\r\n'.encode('utf-8')
            body += file_data
            body += b'\r\n'

        # End boundary
        body += f'--{boundary}--\r\n'.encode('utf-8')

        # Create request
        req = Request(url, data=body, headers=headers, method='POST')

        try:
            with urlopen(req, timeout=timeout) as response:
                response_data = response.read().decode('utf-8')
                return json.loads(response_data) if response_data else {}
        except HTTPError as e:
            error_body = e.read().decode('utf-8')
            try:
                error_data = json.loads(error_body)
                raise Exception(error_data.get('error', f'HTTP {e.code}'))
            except json.JSONDecodeError:
                raise Exception(f'HTTP {e.code}: {error_body}')
        except URLError as e:
            raise Exception(f'Connection error: {e.reason}')

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
            data = self._make_request(
                f"{self.api_url}/auth/login",
                method='POST',
                data={"email": email, "password": password}
            )

            self.token = data.get('token')
            self.user_info = data.get('user')
            print(f"✓ Logged in as {self.user_info.get('firstName')} {self.user_info.get('lastName')}")
            print(f"  Email: {self.user_info.get('email')}")
            print(f"  Role: {self.user_info.get('role')}")
            return True

        except Exception as e:
            error_msg = str(e)
            if 'Connection error' in error_msg:
                print(f"✗ Connection error: Unable to reach server at {self.server_url}")
                print("  Please check your internet connection and server URL")
            elif 'Invalid credentials' in error_msg or 'Unauthorized' in error_msg:
                print("✗ Login failed: Invalid email or password")
            else:
                print(f"✗ Login failed: {error_msg}")
            return False

    def get_headers(self) -> Dict[str, str]:
        """Get HTTP headers with authentication token."""
        if not self.token:
            raise ValueError("Not authenticated. Please login first.")
        return {"Authorization": f"Bearer {self.token}"}

    def list_assignments(self, show_all: bool = False) -> List[Dict[str, Any]]:
        """
        List all assignments.

        Args:
            show_all: If True, show all assignments including past due

        Returns:
            List of assignment dictionaries
        """
        try:
            data = self._make_request(
                f"{self.api_url}/assignments",
                headers=self.get_headers()
            )

            # Handle both array and object responses
            assignments = data.get('assignments', data) if isinstance(data, dict) else data

            # Filter out past due assignments unless show_all is True
            if not show_all:
                now = datetime.now()
                active_assignments = []
                for assignment in assignments:
                    due_date = datetime.fromisoformat(assignment['dueDate'].replace('Z', '+00:00'))
                    # Remove timezone info for comparison
                    due_date_naive = due_date.replace(tzinfo=None)
                    if due_date_naive > now or assignment.get('allowLateSubmission'):
                        active_assignments.append(assignment)
                return active_assignments

            return assignments

        except Exception as e:
            print(f"✗ Error fetching assignments: {e}")
            return []

    def find_assignment(self, assignment_name: str) -> Optional[Dict[str, Any]]:
        """
        Find an assignment by name.

        Args:
            assignment_name: Name of the assignment to find

        Returns:
            Assignment data if found, None otherwise
        """
        try:
            assignments = self.list_assignments(show_all=True)

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
            # Read the zip file
            with open(zip_path, 'rb') as f:
                file_data = f.read()

            filename = os.path.basename(zip_path)

            # Prepare multipart form data
            fields = {
                'assignmentId': assignment_id,
                'textContent': text_content,
                'status': 'submitted'
            }

            files = {
                'files': (filename, file_data, 'application/zip')
            }

            print(f"Uploading submission...")
            data = self._multipart_request(
                f"{self.api_url}/submissions",
                fields=fields,
                files=files,
                headers=self.get_headers()
            )

            print(f"✓ Submission successful!")
            print(f"  Submission ID: {data['id']}")
            print(f"  Status: {data['status']}")
            if data.get('submittedAt'):
                submitted_at = datetime.fromisoformat(data['submittedAt'].replace('Z', '+00:00'))
                print(f"  Submitted at: {submitted_at.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"  Attachments: {len(data.get('attachments', []))} file(s)")
            return True

        except Exception as e:
            print(f"✗ Submission error: {e}")
            return False


def create_zip_archive(directory: str, output_path: str, exclude_patterns: list = None) -> bool:
    """
    Create a zip archive from a directory.

    Args:
        directory: Directory to zip
        output_path: Path for the output zip file
        exclude_patterns: List of patterns to exclude

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
        if total_size > 0:
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
        'server_url': 'https://aicamp.iiis.co:9443',
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


def list_assignments_command(server_url: str, email: str, password: str):
    """List all active assignments."""
    client = SubmissionClient(server_url)

    print("Authenticating...")
    if not client.login(email, password):
        sys.exit(1)

    print()
    print("=" * 60)
    print("Active Assignments (Not Yet Due)")
    print("=" * 60)
    print()

    assignments = client.list_assignments(show_all=False)

    if not assignments:
        print("No active assignments found.")
        return

    now = datetime.now()

    for i, assignment in enumerate(assignments, 1):
        due_date = datetime.fromisoformat(assignment['dueDate'].replace('Z', '+00:00'))
        due_date_naive = due_date.replace(tzinfo=None)
        time_left = due_date_naive - now

        print(f"{i}. {assignment['title']}")
        print(f"   Due: {due_date.strftime('%Y-%m-%d %H:%M')}", end='')

        if time_left.days > 0:
            print(f" ({time_left.days} days left)")
        elif time_left.total_seconds() > 3600:
            hours = int(time_left.total_seconds() / 3600)
            print(f" ({hours} hours left)")
        else:
            print(f" (Due soon!)")

        if assignment.get('description'):
            desc = assignment['description']
            if len(desc) > 70:
                desc = desc[:67] + "..."
            print(f"   {desc}")

        if assignment.get('allowLateSubmission'):
            print(f"   ⚠ Late submission allowed")

        print()


def main():
    """Main entry point for the submission script."""
    parser = argparse.ArgumentParser(
        description='Submit assignments to the AI+ Bootcamp homework system',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # List all active assignments
  %(prog)s --list-assignments
  %(prog)s -l

  # Submit an assignment
  %(prog)s -d ./homework1 -a "Assignment 1"
  %(prog)s --directory ./project --assignment "Final Project" --server https://aicamp.iiis.co
  %(prog)s -d ./hw2 -a "Homework 2" --comment "Completed all bonus problems"

Configuration:
  The script saves your server URL and email to ~/.aibootcamp/config.json
  for convenience in future submissions.
        """
    )

    parser.add_argument(
        '-l', '--list-assignments',
        action='store_true',
        help='List all active assignments and exit'
    )

    parser.add_argument(
        '-d', '--directory',
        help='Directory to submit (will be zipped)'
    )

    parser.add_argument(
        '-a', '--assignment',
        help='Assignment name (must match exactly)'
    )

    parser.add_argument(
        '-s', '--server',
        help='Server URL (default: from config or https://aicamp.iiis.co:9443)'
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
    server_url = args.server or config.get('server_url', 'https://aicamp.iiis.co:9443')

    # Handle list assignments command
    if args.list_assignments:
        # Get credentials
        email = args.email or config.get('email', '')
        if not email:
            email = input("Email: ").strip()
        password = getpass.getpass("Password: ")

        print()
        list_assignments_command(server_url, email, password)
        sys.exit(0)

    # For submission, require directory and assignment
    if not args.directory or not args.assignment:
        parser.error("--directory and --assignment are required for submission (or use --list-assignments to list assignments)")

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
    due_date_aware = due_date if due_date.tzinfo else due_date.replace(tzinfo=None)
    now_naive = now.replace(tzinfo=None) if now.tzinfo else now
    due_date_naive = due_date_aware.replace(tzinfo=None) if due_date_aware.tzinfo else due_date_aware

    if now_naive > due_date_naive:
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
