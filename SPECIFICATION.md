# AI+ Bootcamp Submission System - Technical Specification
## AI交叉创新营作业提交系统

## 1. System Overview

### 1.1 Purpose
A web-based homework submission and feedback system for the AI+ Bootcamp (AI交叉创新营) that enables students to submit assignments online and allows TAs/instructors to provide feedback. The system supports file attachments and markdown text submissions.

### 1.2 System Branding
- **English Name**: AI+ Bootcamp Submission System
- **Chinese Name**: AI交叉创新营作业提交系统
- **Short Name (EN)**: AI+ Bootcamp
- **Short Name (CN)**: AI交叉创新营

### 1.2 User Roles
- **Student**: Can submit homework, view their submissions, and receive feedback
- **TA (Teaching Assistant)**: Can view all submissions, provide feedback, and create assignments
- **Instructor**: Same permissions as TA, plus can create/edit assignments
- **Admin**: Can promote users to TA/Instructor roles

### 1.2 System Branding
- **English Name**: AI+ Bootcamp Submission System
- **Chinese Name**: AI交叉创新营作业提交系统
- **Short Name (EN)**: AI+ Bootcamp
- **Short Name (CN)**: AI交叉创新营

### 1.3 User Roles
- **Student**: Can submit homework, view their submissions, and receive feedback
- **TA (Teaching Assistant)**: Can view all submissions, provide feedback, and create assignments
- **Instructor**: Same permissions as TA, plus can create/edit assignments
- **Admin**: Can promote users to TA/Instructor roles

### 1.4 UI Design System (Tsinghua Style)

#### 1.4.1 Design Philosophy
The interface follows Tsinghua University's design language - clean, scholarly, and professional with a modern academic aesthetic. The design emphasizes clarity, accessibility, and a sense of prestige befitting an academic institution.

#### 1.4.2 Color Palette

**Primary Colors:**
- **Tsinghua Purple**: `#5E2C91` (Primary brand color)
- **Deep Purple**: `#491E6B` (Hover states, emphasis)
- **Light Purple**: `#8B5FB5` (Secondary elements, backgrounds)

**Accent Colors:**
- **Academic Blue**: `#2B5CB8` (Links, informational elements)
- **Success Green**: `#28A745` (Success messages, submitted status)
- **Warning Orange**: `#FFA500` (Draft status, warnings)
- **Alert Red**: `#DC3545` (Past due, errors)

**Neutral Colors:**
- **White**: `#FFFFFF` (Background)
- **Light Gray**: `#F8F9FA` (Secondary backgrounds)
- **Gray**: `#6C757D` (Body text)
- **Dark Gray**: `#343A40` (Headings, emphasis)
- **Border Gray**: `#DEE2E6` (Dividers, borders)

#### 1.4.3 Typography

**Font Families:**
```css
/* For English text */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;

/* For Chinese text */
font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;

/* For both (recommended) */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
```

**Type Scale:**
- **Display Heading (H1)**: 32px / 2rem, font-weight: 600
- **Page Heading (H2)**: 24px / 1.5rem, font-weight: 600
- **Section Heading (H3)**: 20px / 1.25rem, font-weight: 600
- **Subsection (H4)**: 18px / 1.125rem, font-weight: 500
- **Body Large**: 16px / 1rem, font-weight: 400
- **Body Regular**: 14px / 0.875rem, font-weight: 400
- **Small Text**: 12px / 0.75rem, font-weight: 400

**Line Height:**
- Headings: 1.3
- Body text: 1.6
- Small text: 1.5

#### 1.4.4 Layout & Spacing

**Container Max Width:** 1200px (centered)

**Spacing Scale (based on 8px grid):**
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px

**Card Component:**
- Background: White
- Border: 1px solid #DEE2E6
- Border Radius: 8px
- Box Shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
- Padding: 24px

#### 1.4.5 Component Styles

**Buttons:**
```css
/* Primary Button */
.btn-primary {
  background: #5E2C91;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.btn-primary:hover {
  background: #491E6B;
  box-shadow: 0 4px 12px rgba(94, 44, 145, 0.25);
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: #5E2C91;
  border: 1px solid #5E2C91;
  border-radius: 6px;
  padding: 10px 24px;
}
.btn-secondary:hover {
  background: #F8F9FA;
}

/* Danger Button */
.btn-danger {
  background: #DC3545;
  color: white;
  border: none;
  border-radius: 6px;
}
```

**Input Fields:**
```css
.input-field {
  border: 1px solid #DEE2E6;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  transition: all 0.2s ease;
}
.input-field:focus {
  border-color: #5E2C91;
  box-shadow: 0 0 0 3px rgba(94, 44, 145, 0.1);
  outline: none;
}
```

**Status Badges:**
```css
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.badge-draft { background: #FFF3CD; color: #856404; }
.badge-submitted { background: #D1ECF1; color: #0C5460; }
.badge-graded { background: #D4EDDA; color: #155724; }
.badge-past-due { background: #F8D7DA; color: #721C24; }
```

**Navigation Bar:**
- Height: 64px
- Background: White
- Border Bottom: 1px solid #DEE2E6
- Logo: Left aligned
- User menu: Right aligned
- Box Shadow: 0 2px 4px rgba(0, 0, 0, 0.05)

#### 1.4.6 Login Page Design (Tsinghua Style)

**Layout:**
- Split-screen design (desktop): 40% left brand panel, 60% right login form
- Mobile: Single column with brand header
- Minimum height: 100vh

**Left Panel (Brand Section):**
- Background: Linear gradient from #5E2C91 to #491E6B
- Contains:
  - Logo (centered, large size)
  - System name in English and Chinese
  - Tagline: "智能未来，创新先行" / "Innovating for an Intelligent Future"
  - Decorative geometric patterns (subtle)

**Right Panel (Form Section):**
- Background: White
- Centered form container (max-width: 400px)
- Contains:
  - Welcome heading
  - Email input with icon
  - Password input with icon and show/hide toggle
  - "Remember me" checkbox
  - Primary login button (full width)
  - Link to registration
  - Language switcher (top-right corner)

**Form Styling:**
- Inputs have subtle borders with focus states
- Gentle animations on input focus
- Form validation with inline error messages
- Loading state on button during submission

#### 1.4.7 Dashboard Design

**Header Section:**
- Welcome message with user name
- Quick stats cards (3-4 cards in a row)
  - Card style: White background, subtle shadow
  - Icon + number + label
  - Hover effect: Slight elevation

**Main Content:**
- Card-based layout
- Each assignment/submission in a card
- Hover effects: Subtle elevation and border color change
- Clear visual hierarchy

**Sidebar (Desktop):**
- Fixed left sidebar with navigation
- Active state: Purple background
- Icons + labels for navigation items

#### 1.4.8 Icons
Use a consistent icon library (recommended: Lucide React or Heroicons)
- Stroke width: 2px
- Size: 20px for navigation, 16px for inline
- Color: Inherits from text or specified theme color

#### 1.4.9 Animations & Transitions

**Standard Transitions:**
```css
transition: all 0.2s ease;
```

**Hover Effects:**
- Buttons: Slight elevation (translateY(-1px)) + shadow
- Cards: Border color change + subtle shadow increase
- Links: Color change

**Page Transitions:**
- Fade in: 0.3s ease
- Slide in (modals): 0.2s ease-out

#### 1.4.10 Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile Adaptations:**
- Hamburger menu for navigation
- Stack cards vertically
- Full-width buttons
- Reduced padding (16px instead of 24px)
- Simplified tables (card view instead)

#### 1.4.11 Accessibility
- WCAG 2.1 AA compliance
- Color contrast ratio minimum 4.5:1 for normal text
- Focus indicators on all interactive elements
- Keyboard navigation support
- ARIA labels for screen readers
- Skip navigation links

#### 1.4.12 Loading States
- Skeleton screens for initial page load
- Spinner for button actions (inline, small)
- Progress bars for file uploads
- Shimmer effect for loading cards

#### 1.4.13 Error States
- Inline form validation errors (red text below field)
- Toast notifications for system errors (top-right)
- Empty states with helpful messaging and actions

#### 1.4.14 Logo & Branding Assets

**Logo Design:**
The system logo features:
- A neural network/circuit-inspired icon representing AI and connectivity
- Central node with radiating connections (symbolizing learning and collaboration)
- Plus (+) symbol emphasizing the "AI+" brand
- Purple color scheme matching Tsinghua University's brand identity
- Bilingual text: "AI+ Bootcamp" in English and "AI交叉创新营" in Chinese
- Decorative underline accent

**Logo Variants:**
1. **Full Logo** (with icon and text): Use in headers, login page, emails
2. **Icon Only**: Use in favicons, mobile apps, loading screens
3. **Text Only**: Use when space is constrained
4. **Monochrome**: White version for dark backgrounds

**Logo Placement Guidelines:**
- Minimum clear space: 16px on all sides
- Minimum size: 120px width for full logo, 32px for icon only
- Always maintain aspect ratio
- Use on white or light backgrounds; use white version on purple backgrounds

**Favicon:**
- 32x32px: Icon only, simplified version
- 16x16px: Ultra-simplified version (just central node and circle)

**File Format:**
- SVG for web (scalable, crisp at any size)
- PNG with transparent background for emails and documents
- ICO for browser favicon

### 1.5 Technology Stack Recommendations
- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL or MongoDB
- **Authentication**: JWT tokens
- **File Storage**: Local filesystem or cloud storage (S3-compatible)
- **Markdown Support**: markdown-it or react-markdown

## 2. Data Models

### 2.1 User
```typescript
interface User {
  id: string; // UUID
  email: string; // unique
  password: string; // hashed
  firstName: string;
  lastName: string;
  role: 'student' | 'ta' | 'instructor' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 Assignment
```typescript
interface Assignment {
  id: string; // UUID
  title: string;
  description: string; // markdown supported
  createdBy: string; // User ID
  dueDate: Date;
  allowLateSubmission: boolean;
  maxFileSize: number; // in MB
  allowedFileTypes: string[]; // ['pdf', 'docx', 'zip', etc.]
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.3 Submission
```typescript
interface Submission {
  id: string; // UUID
  assignmentId: string;
  studentId: string;
  textContent: string; // markdown supported
  attachments: Attachment[];
  status: 'draft' | 'submitted' | 'graded';
  submittedAt: Date | null;
  grade: number | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.4 Attachment
```typescript
interface Attachment {
  id: string; // UUID
  submissionId: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string; // MIME type
  filePath: string; // storage path
  uploadedAt: Date;
}
```

### 2.5 Feedback
```typescript
interface Feedback {
  id: string; // UUID
  submissionId: string;
  reviewerId: string; // TA/Instructor User ID
  content: string; // markdown supported
  createdAt: Date;
  updatedAt: Date;
}
```

## 3. API Endpoints

### 3.1 Authentication Endpoints

#### POST /api/auth/register
- **Description**: Register a new student account
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response**: `{ token: string, user: User }`
- **Default Role**: student

#### POST /api/auth/login
- **Description**: Login user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: `{ token: string, user: User }`

#### GET /api/auth/me
- **Description**: Get current user profile
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `User`

### 3.2 User Management Endpoints (Admin Only)

#### GET /api/users
- **Description**: List all users
- **Auth**: Admin only
- **Query Params**: `?role=student&page=1&limit=20`
- **Response**: `{ users: User[], total: number, page: number }`

#### PATCH /api/users/:userId/role
- **Description**: Promote user to TA or Instructor
- **Auth**: Admin only
- **Request Body**: `{ role: 'ta' | 'instructor' }`
- **Response**: `User`

### 3.3 Assignment Endpoints

#### POST /api/assignments
- **Description**: Create new assignment
- **Auth**: TA, Instructor
- **Request Body**:
  ```json
  {
    "title": "Homework 1",
    "description": "Complete the following problems...",
    "dueDate": "2025-10-20T23:59:59Z",
    "allowLateSubmission": false,
    "maxFileSize": 10,
    "allowedFileTypes": ["pdf", "docx", "zip"]
  }
  ```
- **Response**: `Assignment`

#### GET /api/assignments
- **Description**: List all assignments
- **Auth**: All authenticated users
- **Query Params**: `?page=1&limit=20`
- **Response**: `{ assignments: Assignment[], total: number }`

#### GET /api/assignments/:assignmentId
- **Description**: Get assignment details
- **Auth**: All authenticated users
- **Response**: `Assignment`

#### PUT /api/assignments/:assignmentId
- **Description**: Update assignment
- **Auth**: Creator or Instructor
- **Request Body**: Partial Assignment
- **Response**: `Assignment`

#### DELETE /api/assignments/:assignmentId
- **Description**: Delete assignment
- **Auth**: Creator or Instructor
- **Response**: `{ success: boolean }`

### 3.4 Submission Endpoints

#### POST /api/submissions
- **Description**: Create or update submission
- **Auth**: Student
- **Request Body** (multipart/form-data):
  ```
  assignmentId: string
  textContent: string
  files: File[]
  status: 'draft' | 'submitted'
  ```
- **Response**: `Submission`

#### GET /api/submissions/my
- **Description**: Get current student's submissions
- **Auth**: Student
- **Query Params**: `?assignmentId=xxx`
- **Response**: `Submission[]`

#### GET /api/submissions/:submissionId
- **Description**: Get submission details
- **Auth**: Owner or TA/Instructor
- **Response**: `Submission` (with attachments and feedback)

#### PUT /api/submissions/:submissionId
- **Description**: Update submission (before deadline)
- **Auth**: Student (owner)
- **Request Body** (multipart/form-data): Similar to POST
- **Response**: `Submission`
- **Business Rule**: Only allowed if current time < assignment due date

#### GET /api/submissions/by-assignment/:assignmentId
- **Description**: List submissions for an assignment
- **Auth**: TA/Instructor
- **Query Params**: `?page=1&limit=20`
- **Response**: `{ submissions: Submission[], total: number }`

#### GET /api/submissions/by-student/:studentId
- **Description**: List submissions by a student
- **Auth**: TA/Instructor
- **Query Params**: `?page=1&limit=20`
- **Response**: `{ submissions: Submission[], total: number }`

### 3.5 Feedback Endpoints

#### POST /api/feedback
- **Description**: Add feedback to submission
- **Auth**: TA/Instructor
- **Request Body**:
  ```json
  {
    "submissionId": "uuid",
    "content": "Great work! Consider...",
    "grade": 95
  }
  ```
- **Response**: `Feedback`

#### PUT /api/feedback/:feedbackId
- **Description**: Update feedback
- **Auth**: Original reviewer or Instructor
- **Request Body**: `{ content: string, grade?: number }`
- **Response**: `Feedback`

#### GET /api/feedback/by-submission/:submissionId
- **Description**: Get feedback for a submission
- **Auth**: Student (owner) or TA/Instructor
- **Response**: `Feedback[]`

### 3.6 File Download Endpoint

#### GET /api/attachments/:attachmentId/download
- **Description**: Download attachment file
- **Auth**: Student (owner) or TA/Instructor
- **Response**: File stream

## 4. Frontend UI Specifications

### 4.1 Student Interface

#### 4.1.1 Login Page (`/login`)
**Layout:** Split-screen design (responsive)

**Desktop Layout (≥768px):**
- Left Panel (40% width):
  - Background: Linear gradient (purple)
  - Logo (large, centered)
  - System name (bilingual)
  - Tagline: "智能未来，创新先行" / "Innovating for an Intelligent Future"
  - Subtle geometric pattern overlay
- Right Panel (60% width):
  - White background
  - Centered form card (max-width: 400px)
  - Welcome heading
  - Form fields with icons
  - Primary action button
  - Registration link
  - Language switcher (top-right)

**Mobile Layout (<768px):**
- Single column
- Brand header (logo + name, purple background, 120px height)
- Form section below
- Full-width form

**Form Elements:**
- Email input with envelope icon
- Password input with lock icon and show/hide toggle
- "Remember me" checkbox
- Full-width login button (purple, white text)
- "Don't have an account? Register" link
- Language switcher (EN/中文)

**Form Validation:**
- Inline error messages in red below fields
- Disabled button state while submitting
- Success/error toast notifications

**Implementation Example:**
```typescript
// LoginPage.tsx - Key elements
<div className="flex min-h-screen">
  {/* Left Brand Panel */}
  <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-primary to-primary-dark text-white flex-col justify-center items-center p-12">
    <img src="/logo.svg" alt="AI+ Bootcamp" className="w-48 mb-6" />
    <h1 className="text-3xl font-bold mb-2">{t('app.title')}</h1>
    <p className="text-primary-light text-lg">{t('app.tagline')}</p>
  </div>
  
  {/* Right Form Panel */}
  <div className="flex-1 flex items-center justify-center p-6 bg-white">
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-semibold mb-6">{t('auth.loginTitle')}</h2>
      {/* Form fields... */}
    </div>
  </div>
</div>
```

#### 4.1.2 Registration Page (`/register`)
Similar layout to login page with additional fields:
- Email input field
- Password input field
- "Login" button
- Link to registration page
- Error message display

#### 4.1.2 Registration Page (`/register`)
- Email input field
- Password input field (with confirmation)
- First name input field
- Last name input field
- "Register" button
- Link to login page
- Error message display

#### 4.1.3 Student Dashboard (`/student/dashboard`)
- Navigation bar with:
  - User name display
  - Logout button
- List of available assignments with:
  - Assignment title
  - Due date (with color coding: green if >3 days, yellow if 1-3 days, red if <1 day)
  - Submission status (Not Started, Draft, Submitted, Graded)
  - "View/Submit" button
- Filter options: All, Not Submitted, Submitted, Graded

#### 4.1.4 Submission Page (`/student/submissions/:assignmentId`)
- Assignment details section:
  - Title
  - Description (rendered markdown)
  - Due date
- Submission form:
  - Text editor (with markdown preview toggle)
  - File upload area (drag-and-drop + browse)
  - List of uploaded files with remove option
  - "Save Draft" button
  - "Submit" button (disabled after deadline)
- If after deadline:
  - All inputs are read-only
  - Display "Submitted on: [date]"
- Feedback section (visible after submission):
  - Feedback content (rendered markdown)
  - Grade display
  - Reviewer name and date

#### 4.1.5 My Submissions List (`/student/submissions`)
- Filterable list of all submissions
- Table columns:
  - Assignment title
  - Submission date
  - Status
  - Grade
  - Actions (View)

### 4.2 TA/Instructor Interface

#### 4.2.1 TA Dashboard (`/ta/dashboard`)
- Navigation bar with:
  - User name and role display
  - Links: Dashboard, Assignments, Submissions
  - Logout button
- Statistics cards:
  - Total assignments
  - Pending submissions
  - Graded submissions
- Recent submissions list (last 10)

#### 4.2.2 Create Assignment Page (`/ta/assignments/create`)
- Form fields:
  - Title (required)
  - Description (markdown editor with preview)
  - Due date picker
  - Allow late submission checkbox
  - Max file size input (MB)
  - Allowed file types (multi-select)
- "Create Assignment" button
- "Cancel" button

#### 4.2.3 Assignments List (`/ta/assignments`)
- List/table of all assignments
- Columns:
  - Title
  - Due date
  - Submissions count
  - Actions (View, Edit, Delete)
- "Create New Assignment" button

#### 4.2.4 Assignment Details Page (`/ta/assignments/:assignmentId`)
- Assignment information display
- Tabs:
  - Overview
  - Submissions (list all submissions)
- Each submission in list shows:
  - Student name
  - Submission date
  - Status
  - Grade (if graded)
  - "Review" button

#### 4.2.5 Submissions List (`/ta/submissions`)
- Two view modes (toggle):
  - By Student: Groups submissions by student
  - By Assignment: Groups submissions by assignment
- Filters:
  - Status (All, Submitted, Graded, Pending)
  - Assignment (dropdown)
  - Student (search)
- Table columns:
  - Student name
  - Assignment title
  - Submission date
  - Status
  - Grade
  - Actions (Review)

#### 4.2.6 Review Submission Page (`/ta/review/:submissionId`)
- Student information section
- Assignment details
- Submission content:
  - Text content (rendered markdown)
  - Attachments list with download links
- Feedback form:
  - Markdown editor
  - Grade input (0-100)
  - "Save Feedback" button
  - "Update Feedback" button (if feedback exists)
- Previous feedback history (if multiple feedback entries)

### 4.3 Admin Interface

#### 4.3.1 Admin Dashboard (`/admin/dashboard`)
- Navigation bar with admin-specific links
- User management section

#### 4.3.2 User Management Page (`/admin/users`)
- Searchable/filterable list of users
- Table columns:
  - Name
  - Email
  - Current role
  - Registration date
  - Actions
- For each user:
  - "Promote to TA" button (if student)
  - "Promote to Instructor" button (if student or TA)
  - "Demote to Student" button (if TA/Instructor)
- Confirmation dialog for role changes

## 5. Business Rules

### 5.1 Submission Rules
1. Students can create/edit submissions only before the due date
2. After the due date, submissions become read-only
3. Students can save drafts multiple times before final submission
4. Once submitted, the submission status changes and timestamp is recorded
5. Students can only view their own submissions
6. File size must not exceed the assignment's maxFileSize limit
7. Only allowed file types can be uploaded

### 5.2 Feedback Rules
1. Feedback can only be added by TAs or Instructors
2. Feedback is visible to students only after it's submitted
3. Grade must be between 0 and 100
4. Feedback can be edited by the original reviewer or any Instructor
5. Students receive read-only access to feedback

### 5.3 Role Permissions
1. **Student**:
   - Create/edit own submissions (before deadline)
   - View own submissions and feedback
   - View assignments
2. **TA**:
   - All student permissions
   - Create assignments
   - View all submissions
   - Provide feedback
   - Edit own feedback
3. **Instructor**:
   - All TA permissions
   - Edit any assignment
   - Edit any feedback
   - Delete assignments
4. **Admin**:
   - All instructor permissions
   - Promote/demote users
   - Access user management

### 5.4 Deadline Enforcement
1. System checks current time against assignment due date
2. If current time > due date:
   - Submission form becomes read-only
   - "Submit" and "Save Draft" buttons are disabled
   - Warning message displayed: "This assignment is past due. Submissions are no longer accepted."

## 6. Security Requirements

### 6.1 Authentication
- Passwords must be hashed using bcrypt (min 10 rounds)
- JWT tokens expire after 24 hours
- Implement refresh token mechanism
- HTTPS required for all endpoints

### 6.2 Authorization
- All endpoints must verify user authentication
- Role-based access control (RBAC) for all operations
- Students can only access their own data
- TAs/Instructors can access all student data within their scope

### 6.3 File Upload Security
- Validate file types on server side
- Scan uploaded files for malware (if possible)
- Store files outside web root
- Generate unique file names to prevent overwrites
- Implement file size limits

### 6.4 Input Validation
- Sanitize all user inputs
- Validate markdown content (prevent XSS)
- Validate email format
- Enforce password strength (min 8 characters, mix of letters, numbers)

## 7. Technical Requirements

### 7.1 Performance
- API response time < 200ms for most endpoints
- File upload progress indicator
- Pagination for all list endpoints (default 20 items per page)
- Lazy loading for file downloads

### 7.2 Responsiveness
- Mobile-friendly UI (responsive design)
- Breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)

### 7.3 Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### 7.4 Error Handling
- Graceful error messages for users
- Detailed error logging for developers
- Network error handling with retry mechanism
- Form validation with inline error messages

## 8. Database Schema

### 8.1 PostgreSQL Schema Example

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  due_date TIMESTAMP NOT NULL,
  allow_late_submission BOOLEAN DEFAULT false,
  max_file_size INTEGER DEFAULT 10,
  allowed_file_types TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id),
  text_content TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  submitted_at TIMESTAMP,
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assignment_id, student_id)
);

-- Attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100),
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_attachments_submission ON attachments(submission_id);
CREATE INDEX idx_feedback_submission ON feedback(submission_id);
CREATE INDEX idx_users_role ON users(role);
```

## 9. File Structure Recommendation

```
homework-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── assignmentController.ts
│   │   │   ├── submissionController.ts
│   │   │   ├── feedbackController.ts
│   │   │   └── userController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── roleCheck.ts
│   │   │   └── fileUpload.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Assignment.ts
│   │   │   ├── Submission.ts
│   │   │   ├── Attachment.ts
│   │   │   └── Feedback.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── assignments.ts
│   │   │   ├── submissions.ts
│   │   │   ├── feedback.ts
│   │   │   └── users.ts
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   └── fileHandler.ts
│   │   └── server.ts
│   ├── uploads/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   └── MarkdownEditor.tsx
│   │   │   ├── student/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── SubmissionForm.tsx
│   │   │   │   └── SubmissionsList.tsx
│   │   │   ├── ta/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── CreateAssignment.tsx
│   │   │   │   ├── ReviewSubmission.tsx
│   │   │   │   └── SubmissionsList.tsx
│   │   │   └── admin/
│   │   │       └── UserManagement.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useApi.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── TADashboard.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── dateHelpers.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

### 9.1 Design System Implementation

#### 9.1.1 CSS Variables Setup
Create a global CSS file with design tokens:

```css
/* src/styles/theme.css */
:root {
  /* Colors - Primary */
  --color-primary: #5E2C91;
  --color-primary-dark: #491E6B;
  --color-primary-light: #8B5FB5;
  
  /* Colors - Accent */
  --color-accent: #2B5CB8;
  --color-success: #28A745;
  --color-warning: #FFA500;
  --color-danger: #DC3545;
  
  /* Colors - Neutral */
  --color-white: #FFFFFF;
  --color-bg-light: #F8F9FA;
  --color-text: #6C757D;
  --color-text-dark: #343A40;
  --color-border: #DEE2E6;
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 2rem;      /* 32px */
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
  
  /* Layout */
  --container-max-width: 1200px;
  --header-height: 64px;
  --sidebar-width: 240px;
  
  /* Borders */
  --border-radius: 6px;
  --border-radius-sm: 4px;
  --border-radius-lg: 8px;
  --border-radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.12);
  --shadow-purple: 0 4px 12px rgba(94, 44, 145, 0.25);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
}
```

#### 9.1.2 Tailwind Configuration (if using Tailwind CSS)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5E2C91',
          dark: '#491E6B',
          light: '#8B5FB5',
        },
        accent: '#2B5CB8',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      boxShadow: {
        'purple': '0 4px 12px rgba(94, 44, 145, 0.25)',
      },
    },
  },
};
```

#### 9.1.3 Component Library Structure
```
frontend/src/components/
├── ui/                    # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   ├── Dropdown.tsx
│   └── FileUpload.tsx
├── layout/               # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── Container.tsx
└── ...
```

#### 9.1.4 Example Component Implementation

**Button Component:**
```typescript
// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = 'font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary disabled:bg-gray-300',
    secondary: 'bg-white text-primary border border-primary hover:bg-gray-50 focus:ring-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
};
```

**Card Component:**
```typescript
// src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div className={`
      bg-white rounded-lg border border-gray-200 p-6 shadow-sm
      ${hover ? 'transition-all duration-200 hover:shadow-md hover:border-primary-light' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};
```

## 10. Implementation Phases

### Phase 1: Core Authentication & User Management
- User registration and login
- JWT authentication
- Role-based access control
- Admin user management

### Phase 2: Assignment Management
- Create/edit/delete assignments
- List assignments
- Due date management

### Phase 3: Submission System
- Student submission form
- File upload functionality
- Markdown text editor
- Deadline enforcement
- Submission listing

### Phase 4: Feedback System
- TA/Instructor review interface
- Feedback submission
- Grade assignment
- Student feedback viewing

### Phase 5: UI Polish & Testing
- Responsive design
- Error handling
- Performance optimization
- Security audit
- End-to-end testing

## 11. Environment Variables

```env
# Backend .env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/homework_system
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=24h
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
CORS_ORIGIN=http://localhost:3000

# Frontend .env
VITE_API_URL=http://localhost:5000/api
```

## 12. Testing Requirements

### 12.1 Backend Tests
- Unit tests for all controllers
- Integration tests for API endpoints
- Authentication middleware tests
- File upload tests
- Database query tests

### 12.2 Frontend Tests
- Component unit tests
- Integration tests for forms
- E2E tests for critical user flows:
  - Student submission workflow
  - TA feedback workflow
  - Admin user promotion

## 13. Internationalization (i18n) - English and Chinese Support

### 13.1 i18n Strategy
- **Library**: react-i18next for frontend, i18next for backend
- **Default Language**: English (en)
- **Supported Languages**: English (en), Simplified Chinese (zh-CN)
- **Language Detection**: Browser preference, then user preference from database
- **Storage**: User language preference stored in user profile

### 13.2 Frontend i18n Implementation

#### 13.2.1 Setup
```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import zhTranslations from './locales/zh-CN.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      'zh-CN': { translation: zhTranslations }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

#### 13.2.2 Translation File Structure
```
frontend/src/i18n/
├── config.ts
└── locales/
    ├── en.json
    └── zh-CN.json
```

#### 13.2.3 English Translation File (en.json)
```json
{
  "app": {
    "title": "AI+ Bootcamp Submission System",
    "shortTitle": "AI+ Bootcamp",
    "tagline": "Innovating for an Intelligent Future"
  },
  "common": {
    "login": "Login",
    "logout": "Logout",
    "register": "Register",
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "edit": "Edit",
    "delete": "Delete",
    "confirm": "Confirm",
    "back": "Back",
    "loading": "Loading...",
    "search": "Search",
    "filter": "Filter",
    "download": "Download",
    "upload": "Upload",
    "saveDraft": "Save Draft",
    "language": "Language"
  },
  "auth": {
    "emailLabel": "Email",
    "passwordLabel": "Password",
    "confirmPassword": "Confirm Password",
    "firstNameLabel": "First Name",
    "lastNameLabel": "Last Name",
    "loginButton": "Login",
    "registerButton": "Register",
    "loginTitle": "Student Login",
    "registerTitle": "Create Account",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "loginError": "Invalid email or password",
    "registerSuccess": "Registration successful!"
  },
  "student": {
    "dashboard": "My Dashboard",
    "assignments": "Assignments",
    "mySubmissions": "My Submissions",
    "notStarted": "Not Started",
    "draft": "Draft",
    "submitted": "Submitted",
    "graded": "Graded",
    "dueDate": "Due Date",
    "status": "Status",
    "grade": "Grade",
    "viewSubmit": "View/Submit",
    "submissionDetails": "Submission Details",
    "textContent": "Text Content",
    "attachments": "Attachments",
    "feedback": "Feedback",
    "noFeedback": "No feedback yet",
    "pastDue": "This assignment is past due. Submissions are no longer accepted.",
    "submittedOn": "Submitted on"
  },
  "ta": {
    "dashboard": "TA Dashboard",
    "createAssignment": "Create Assignment",
    "assignmentsList": "Assignments List",
    "submissionsList": "Submissions List",
    "reviewSubmission": "Review Submission",
    "provideFeedback": "Provide Feedback",
    "assignmentTitle": "Assignment Title",
    "description": "Description",
    "allowLateSubmission": "Allow Late Submission",
    "maxFileSize": "Max File Size (MB)",
    "allowedFileTypes": "Allowed File Types",
    "totalAssignments": "Total Assignments",
    "pendingSubmissions": "Pending Submissions",
    "gradedSubmissions": "Graded Submissions",
    "byStudent": "By Student",
    "byAssignment": "By Assignment",
    "studentName": "Student Name",
    "submissionDate": "Submission Date",
    "reviewButton": "Review",
    "feedbackContent": "Feedback Content",
    "gradeLabel": "Grade (0-100)",
    "saveFeedback": "Save Feedback",
    "updateFeedback": "Update Feedback"
  },
  "admin": {
    "dashboard": "Admin Dashboard",
    "userManagement": "User Management",
    "promoteToTA": "Promote to TA",
    "promoteToInstructor": "Promote to Instructor",
    "demoteToStudent": "Demote to Student",
    "role": "Role",
    "registrationDate": "Registration Date",
    "confirmPromotion": "Are you sure you want to change this user's role?",
    "roleChangeSuccess": "User role updated successfully"
  },
  "validation": {
    "required": "This field is required",
    "emailInvalid": "Invalid email format",
    "passwordTooShort": "Password must be at least 8 characters",
    "passwordsNotMatch": "Passwords do not match",
    "fileTooLarge": "File size exceeds the limit",
    "fileTypeNotAllowed": "File type not allowed",
    "gradeMustBeNumber": "Grade must be a number between 0 and 100"
  },
  "errors": {
    "networkError": "Network error. Please try again.",
    "unauthorized": "You are not authorized to perform this action",
    "serverError": "Server error. Please try again later.",
    "notFound": "Resource not found"
  }
}
```

#### 13.2.4 Chinese Translation File (zh-CN.json)
```json
{
  "app": {
    "title": "AI交叉创新营作业提交系统",
    "shortTitle": "AI交叉创新营",
    "tagline": "智能未来，创新先行"
  },
  "common": {
    "login": "登录",
    "logout": "退出登录",
    "register": "注册",
    "submit": "提交",
    "cancel": "取消",
    "save": "保存",
    "edit": "编辑",
    "delete": "删除",
    "confirm": "确认",
    "back": "返回",
    "loading": "加载中...",
    "search": "搜索",
    "filter": "筛选",
    "download": "下载",
    "upload": "上传",
    "saveDraft": "保存草稿",
    "language": "语言"
  },
  "auth": {
    "emailLabel": "邮箱",
    "passwordLabel": "密码",
    "confirmPassword": "确认密码",
    "firstNameLabel": "名字",
    "lastNameLabel": "姓氏",
    "loginButton": "登录",
    "registerButton": "注册",
    "loginTitle": "学生登录",
    "registerTitle": "创建账户",
    "noAccount": "还没有账户？",
    "hasAccount": "已有账户？",
    "loginError": "邮箱或密码错误",
    "registerSuccess": "注册成功！"
  },
  "student": {
    "dashboard": "我的控制台",
    "assignments": "作业",
    "mySubmissions": "我的提交",
    "notStarted": "未开始",
    "draft": "草稿",
    "submitted": "已提交",
    "graded": "已评分",
    "dueDate": "截止日期",
    "status": "状态",
    "grade": "成绩",
    "viewSubmit": "查看/提交",
    "submissionDetails": "提交详情",
    "textContent": "文本内容",
    "attachments": "附件",
    "feedback": "反馈",
    "noFeedback": "暂无反馈",
    "pastDue": "此作业已过期，不再接受提交。",
    "submittedOn": "提交于"
  },
  "ta": {
    "dashboard": "助教控制台",
    "createAssignment": "创建作业",
    "assignmentsList": "作业列表",
    "submissionsList": "提交列表",
    "reviewSubmission": "审阅提交",
    "provideFeedback": "提供反馈",
    "assignmentTitle": "作业标题",
    "description": "描述",
    "allowLateSubmission": "允许延迟提交",
    "maxFileSize": "最大文件大小（MB）",
    "allowedFileTypes": "允许的文件类型",
    "totalAssignments": "作业总数",
    "pendingSubmissions": "待审阅提交",
    "gradedSubmissions": "已评分提交",
    "byStudent": "按学生",
    "byAssignment": "按作业",
    "studentName": "学生姓名",
    "submissionDate": "提交日期",
    "reviewButton": "审阅",
    "feedbackContent": "反馈内容",
    "gradeLabel": "成绩（0-100）",
    "saveFeedback": "保存反馈",
    "updateFeedback": "更新反馈"
  },
  "admin": {
    "dashboard": "管理员控制台",
    "userManagement": "用户管理",
    "promoteToTA": "提升为助教",
    "promoteToInstructor": "提升为讲师",
    "demoteToStudent": "降级为学生",
    "role": "角色",
    "registrationDate": "注册日期",
    "confirmPromotion": "确定要更改此用户的角色吗？",
    "roleChangeSuccess": "用户角色更新成功"
  },
  "validation": {
    "required": "此字段为必填项",
    "emailInvalid": "邮箱格式无效",
    "passwordTooShort": "密码必须至少8个字符",
    "passwordsNotMatch": "密码不匹配",
    "fileTooLarge": "文件大小超过限制",
    "fileTypeNotAllowed": "不允许此文件类型",
    "gradeMustBeNumber": "成绩必须是0到100之间的数字"
  },
  "errors": {
    "networkError": "网络错误，请重试。",
    "unauthorized": "您无权执行此操作",
    "serverError": "服务器错误，请稍后重试。",
    "notFound": "未找到资源"
  }
}
```

#### 13.2.5 Language Switcher Component
```typescript
// src/components/common/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Optionally save to backend
    // api.updateUserPreference({ language: lng });
  };

  return (
    <select 
      value={i18n.language} 
      onChange={(e) => changeLanguage(e.target.value)}
      className="language-selector"
    >
      <option value="en">English</option>
      <option value="zh-CN">中文</option>
    </select>
  );
};
```

#### 13.2.6 Usage in Components
```typescript
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('auth.loginTitle')}</h1>
      <input placeholder={t('auth.emailLabel')} />
      <input placeholder={t('auth.passwordLabel')} type="password" />
      <button>{t('auth.loginButton')}</button>
    </div>
  );
};
```

### 13.3 Backend i18n Implementation

#### 13.3.1 Setup
```typescript
// backend/src/i18n/config.ts
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

i18next
  .use(Backend)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'zh-CN'],
    backend: {
      loadPath: './src/i18n/locales/{{lng}}.json'
    }
  });

export default i18next;
```

#### 13.3.2 Error Messages Translation
```json
// backend/src/i18n/locales/en.json
{
  "errors": {
    "invalidCredentials": "Invalid email or password",
    "userNotFound": "User not found",
    "unauthorized": "Unauthorized access",
    "assignmentNotFound": "Assignment not found",
    "submissionNotFound": "Submission not found",
    "pastDueDate": "Cannot submit after due date",
    "fileTooLarge": "File size exceeds maximum allowed size"
  },
  "success": {
    "assignmentCreated": "Assignment created successfully",
    "submissionSaved": "Submission saved successfully",
    "feedbackAdded": "Feedback added successfully"
  }
}
```

```json
// backend/src/i18n/locales/zh-CN.json
{
  "errors": {
    "invalidCredentials": "邮箱或密码错误",
    "userNotFound": "用户未找到",
    "unauthorized": "未授权访问",
    "assignmentNotFound": "作业未找到",
    "submissionNotFound": "提交未找到",
    "pastDueDate": "截止日期后无法提交",
    "fileTooLarge": "文件大小超过最大允许值"
  },
  "success": {
    "assignmentCreated": "作业创建成功",
    "submissionSaved": "提交保存成功",
    "feedbackAdded": "反馈添加成功"
  }
}
```

### 13.4 Database Changes for Language Preference
```sql
-- Add language preference to users table
ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en';
```

Update User model:
```typescript
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'ta' | 'instructor' | 'admin';
  language: 'en' | 'zh-CN'; // Added
  createdAt: Date;
  updatedAt: Date;
}
```

### 13.5 Date and Time Localization
```typescript
// src/utils/dateHelpers.ts
import { format } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';

const locales = { en: enUS, 'zh-CN': zhCN };

export const formatDate = (date: Date, formatStr: string, language: string) => {
  return format(date, formatStr, { 
    locale: locales[language as keyof typeof locales] 
  });
};
```

## 14. Docker Configuration

### 14.1 Project Structure with Docker
```
homework-system/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── public/
│   │   ├── logo.svg
│   │   ├── logo-icon.svg
│   │   ├── favicon.ico
│   │   └── favicon-32x32.png
│   └── ...
└── nginx/
    └── nginx.conf
```

### 14.2 Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/i18n/locales ./dist/i18n/locales

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# Use non-root user
USER node

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/server.js"]
```

### 14.3 Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 14.4 Frontend Nginx Configuration
```nginx
# frontend/nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 14.5 Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: homework-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: homework_system
      POSTGRES_USER: homework_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-change_me_in_production}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - homework-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U homework_user -d homework_system"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: homework-backend
    restart: unless-stopped
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 5000
      DATABASE_URL: postgresql://homework_user:${DB_PASSWORD:-change_me_in_production}@postgres:5432/homework_system
      JWT_SECRET: ${JWT_SECRET:-your_jwt_secret_here}
      JWT_EXPIRE: 24h
      MAX_FILE_SIZE: 10485760
      UPLOAD_DIR: /app/uploads
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost}
    volumes:
      - upload_data:/app/uploads
    ports:
      - "5000:5000"
    networks:
      - homework-network
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend Application
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: homework-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    networks:
      - homework-network
    depends_on:
      - backend
    environment:
      - VITE_API_URL=${API_URL:-http://localhost:5000/api}

  # Nginx Reverse Proxy (Optional - for production)
  nginx:
    image: nginx:alpine
    container_name: homework-nginx
    restart: unless-stopped
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    networks:
      - homework-network
    depends_on:
      - frontend
      - backend
    profiles:
      - production

volumes:
  postgres_data:
    driver: local
  upload_data:
    driver: local

networks:
  homework-network:
    driver: bridge
```

### 14.6 Environment File Template
```bash
# .env.example
# Copy this file to .env and fill in your values

# Database
DB_PASSWORD=your_secure_database_password_here

# Backend
NODE_ENV=production
JWT_SECRET=your_very_secure_jwt_secret_minimum_32_characters
CORS_ORIGIN=http://localhost

# Frontend
API_URL=http://localhost:5000/api

# Optional: For production with SSL
# SSL_CERT_PATH=/path/to/ssl/cert.pem
# SSL_KEY_PATH=/path/to/ssl/key.pem
```

### 14.7 Docker Ignore Files

#### Backend .dockerignore
```
node_modules
npm-debug.log
dist
uploads
.env
.env.local
.git
.gitignore
README.md
.vscode
.idea
*.test.ts
*.spec.ts
coverage
```

#### Frontend .dockerignore
```
node_modules
npm-debug.log
dist
.env
.env.local
.git
.gitignore
README.md
.vscode
.idea
*.test.tsx
*.spec.tsx
coverage
```

### 14.8 Production Nginx Reverse Proxy Configuration
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5000;
    }

    upstream frontend {
        server frontend:80;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # API requests
        location /api/ {
            proxy_pass http://backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # File upload size
            client_max_body_size 50M;
        }

        # Frontend
        location / {
            proxy_pass http://frontend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### 14.9 Docker Commands Reference

#### Development
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose up -d --build backend

# Access database
docker-compose exec postgres psql -U homework_user -d homework_system
```

#### Production
```bash
# Build and start with production profile
docker-compose --profile production up -d

# Scale backend service
docker-compose up -d --scale backend=3

# View resource usage
docker stats

# Backup database
docker-compose exec postgres pg_dump -U homework_user homework_system > backup.sql

# Restore database
docker-compose exec -T postgres psql -U homework_user homework_system < backup.sql
```

### 14.10 Health Check Endpoints

Add to backend:
```typescript
// backend/src/routes/health.ts
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 15. Deployment Considerations

### 15.1 Production Checklist
- [ ] Environment variables configured in .env file
- [ ] Database migrations run
- [ ] HTTPS enabled (SSL certificates configured)
- [ ] CORS properly configured
- [ ] File upload directory permissions set
- [ ] Database backups scheduled
- [ ] Monitoring and logging configured
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] Docker volumes for persistent data
- [ ] Docker health checks working
- [ ] Language files complete for both English and Chinese
- [ ] Default language set appropriately

### 15.2 Recommended Hosting
- **Docker-based**: DigitalOcean Droplet, AWS EC2, Google Cloud Compute Engine
- **Container Orchestration**: Docker Swarm or Kubernetes for scaling
- **Database**: AWS RDS, DigitalOcean Managed Database, or PostgreSQL in Docker
- **File Storage**: AWS S3, DigitalOcean Spaces, or Docker volumes
- **SSL Certificates**: Let's Encrypt (certbot), Cloudflare

### 15.3 Monitoring and Logging
```yaml
# Add to docker-compose.yml for monitoring
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
    profiles:
      - monitoring

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
    profiles:
      - monitoring
```

---

## Notes for Implementation

This specification provides a complete blueprint for building the homework submission system. Key priorities:

1. Start with authentication and authorization
2. Implement role-based access control early
3. Ensure deadline enforcement is robust
4. Test file upload security thoroughly
5. Implement proper error handling throughout
6. Consider scalability in database design

The system should be built with modularity in mind, allowing for future enhancements such as:
- Email notifications
- Real-time collaboration
- Plagiarism detection
- Analytics dashboard
- Mobile app
- Calendar integration