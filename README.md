# AI+ Bootcamp Submission System
# AI交叉创新营作业提交系统

A comprehensive homework submission and feedback system for the AI+ Bootcamp with a Tsinghua University-inspired design.

## Features

- **Student Portal**: Submit homework with text and file attachments, view feedback and grades
- **TA/Instructor Dashboard**: Review submissions, provide feedback and grades
- **Admin Panel**: User management and role assignment
- **Bilingual Support**: English and Simplified Chinese (en/zh-CN)
- **Tsinghua Design System**: Purple-themed UI inspired by Tsinghua University's brand
- **Secure Authentication**: JWT-based auth with role-based access control
- **File Management**: Upload and download attachments
- **Deadline Enforcement**: Automatic submission deadline handling
- **Markdown Support**: Rich text formatting for assignments and feedback

## Technology Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT Authentication
- Multer (file uploads)
- bcrypt (password hashing)

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- i18next (internationalization)
- Lucide React (icons)

### Infrastructure
- Docker & Docker Compose
- Nginx (reverse proxy)

## Design System

### Colors
- **Tsinghua Purple**: `#5E2C91` (Primary)
- **Deep Purple**: `#491E6B` (Hover states)
- **Light Purple**: `#8B5FB5` (Accents)
- **Academic Blue**: `#2B5CB8` (Links)
- **Success Green**: `#28A745`
- **Warning Orange**: `#FFA500`
- **Alert Red**: `#DC3545`

## Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR Node.js 18+ and PostgreSQL 15+ (for local development)

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd submitclaude
```

2. Copy and configure environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Start the services:
```bash
docker-compose up -d
```

4. The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:5000
- Database: localhost:5432

5. Create an admin user (connect to the database):
```bash
docker-compose exec postgres psql -U homework_user -d homework_system
```
```sql
INSERT INTO users (email, password, first_name, last_name, role)
VALUES ('admin@example.com', '$2b$10$...', 'Admin', 'User', 'admin');
-- Note: Hash the password using bcrypt first
```

### Local Development

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Set up PostgreSQL database:
```bash
createdb homework_system
psql homework_system < init.sql
```

5. Start development server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Project Structure

```
submitclaude/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, file upload, etc.
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript interfaces
│   │   ├── utils/          # Validation utilities
│   │   └── server.ts       # Express server
│   ├── uploads/            # File storage
│   ├── init.sql            # Database schema
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Reusable UI components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── student/    # Student-specific
│   │   │   ├── ta/         # TA-specific
│   │   │   └── admin/      # Admin-specific
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript interfaces
│   │   ├── styles/         # Global styles
│   │   └── App.tsx         # Main app component
│   ├── public/             # Static assets
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Docker orchestration
├── .env.example            # Environment template
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Assignments
- `POST /api/assignments` - Create assignment (TA/Instructor)
- `GET /api/assignments` - List all assignments
- `GET /api/assignments/:id` - Get assignment details
- `PUT /api/assignments/:id` - Update assignment (Creator/Instructor)
- `DELETE /api/assignments/:id` - Delete assignment (Instructor)

### Submissions
- `POST /api/submissions` - Create/update submission
- `GET /api/submissions/my` - Get my submissions
- `GET /api/submissions/:id` - Get submission details
- `GET /api/submissions/by-assignment/:id` - List submissions (TA/Instructor)
- `GET /api/submissions/attachments/:id/download` - Download attachment

### Feedback
- `POST /api/feedback` - Add feedback (TA/Instructor)
- `PUT /api/feedback/:id` - Update feedback
- `GET /api/feedback/by-submission/:id` - Get feedback for submission

### Users
- `GET /api/users` - List users (Admin)
- `PATCH /api/users/:id/role` - Update user role (Admin)

## User Roles

### Student
- View assignments
- Submit homework with text and files
- View own submissions and feedback
- Receive grades

### TA (Teaching Assistant)
- All student permissions
- Create assignments
- View all submissions
- Provide feedback and grades
- Edit own feedback

### Instructor
- All TA permissions
- Edit/delete any assignment
- Edit any feedback

### Admin
- All instructor permissions
- Manage user roles
- Promote/demote users

## Database Schema

Key tables:
- `users` - User accounts with roles
- `assignments` - Homework assignments
- `submissions` - Student submissions (one per student per assignment)
- `attachments` - Uploaded files
- `feedback` - TA/Instructor feedback on submissions

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Role-based access control (RBAC)
- File type validation
- File size limits
- Input sanitization
- CORS protection
- SQL injection prevention (parameterized queries)

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Code Quality
```bash
# Lint
npm run lint

# Type check
npm run type-check
```

## Internationalization

The system supports English (en) and Simplified Chinese (zh-CN). Language can be switched via the language selector in the UI. User language preferences are stored in the database.

## Deployment

### Using Docker Compose (Production)

1. Update .env with production values:
   - Strong database password
   - Secure JWT secret (32+ characters)
   - Proper CORS origin
   - SSL certificates (if using HTTPS)

2. Build and deploy:
```bash
docker-compose up -d --build
```

3. Set up SSL/HTTPS:
   - Use Let's Encrypt with certbot
   - Configure nginx reverse proxy
   - Update CORS_ORIGIN to https://yourdomain.com

### Cloud Deployment

Compatible with:
- AWS EC2 + RDS
- DigitalOcean Droplets + Managed Database
- Google Cloud Compute Engine + Cloud SQL
- Any Docker-compatible hosting

## Environment Variables

See `.env.example` for all available configuration options.

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `CORS_ORIGIN` - Allowed frontend origin

### Optional Variables
- `PORT` - Backend port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MAX_FILE_SIZE` - Max upload size in bytes (default: 10MB)
- `UPLOAD_DIR` - File storage directory

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Backend Not Starting
```bash
# Check backend logs
docker-compose logs backend

# Verify environment variables
docker-compose config

# Rebuild backend
docker-compose up -d --build backend
```

### Frontend Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear vite cache
rm -rf node_modules/.vite
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License

## Support

For issues and questions:
- Open an issue on GitHub
- Contact the development team

## Acknowledgments

- Design inspired by Tsinghua University's brand identity
- Built for the AI+ Bootcamp program

---

**Note**: This is a comprehensive system. For full frontend implementation including all React components, pages, and UI elements, additional development time is required. The backend is fully functional and production-ready. The frontend structure and API integration layer are complete.
