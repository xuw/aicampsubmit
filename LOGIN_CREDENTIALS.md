# Login Credentials for Example Users

All example users have been configured with the password: **admin123**

## Available Test Accounts

### Admin User
- **Email:** admin@aibootcamp.edu
- **Password:** admin123
- **Role:** admin
- **Permissions:** Full system access, user management, all instructor permissions

### Instructor User
- **Email:** instructor@aibootcamp.edu
- **Password:** admin123
- **Role:** instructor
- **Permissions:** Edit/delete any assignment, edit any feedback, all TA permissions

### TA (Teaching Assistant) User
- **Email:** ta@aibootcamp.edu
- **Password:** admin123
- **Role:** ta
- **Permissions:** Create assignments, view all submissions, provide feedback and grades, all student permissions

### Student User
- **Email:** student@aibootcamp.edu
- **Password:** admin123
- **Role:** student
- **Permissions:** View assignments, submit homework, view own submissions and feedback

## Issue Resolution

### Problem
The bcrypt hash stored in the database did not match the password "admin123". The hash in [create-default-users.sql](backend/create-default-users.sql) was invalid or generated incorrectly.

### Solution
1. Generated a new valid bcrypt hash for "admin123" using `bcrypt.hash('admin123', 10)`
2. Updated all example user passwords in the database using [fix-passwords.js](backend/fix-passwords.js)
3. Updated [create-default-users.sql](backend/create-default-users.sql) with the correct hash for future deployments

### Verification
All four example users have been tested and can successfully log in with password: **admin123**

## Security Note

⚠️ **Important:** These are example credentials for development/testing only. In production:
- Use strong, unique passwords
- Never commit real credentials to version control
- Change all default passwords immediately
- Implement proper user registration and password reset flows
