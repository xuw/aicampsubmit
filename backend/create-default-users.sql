-- Create default users for AI+ Bootcamp Submission System
-- All users have password: admin123
-- Hash generated with: bcrypt.hash('admin123', 10)

-- Admin user
INSERT INTO users (email, password, first_name, last_name, role, language)
VALUES ('admin@aibootcamp.edu', '$2b$10$xmeV.UG98QPXx4XExmiLEO.u60xPVDMZp5WXyYZ/AEvxpLwCxyDjC', 'Admin', 'User', 'admin', 'en')
ON CONFLICT (email) DO NOTHING;

-- Instructor user
INSERT INTO users (email, password, first_name, last_name, role, language)
VALUES ('instructor@aibootcamp.edu', '$2b$10$xmeV.UG98QPXx4XExmiLEO.u60xPVDMZp5WXyYZ/AEvxpLwCxyDjC', 'John', 'Instructor', 'instructor', 'en')
ON CONFLICT (email) DO NOTHING;

-- TA user
INSERT INTO users (email, password, first_name, last_name, role, language)
VALUES ('ta@aibootcamp.edu', '$2b$10$xmeV.UG98QPXx4XExmiLEO.u60xPVDMZp5WXyYZ/AEvxpLwCxyDjC', 'Jane', 'TA', 'ta', 'en')
ON CONFLICT (email) DO NOTHING;

-- Student user
INSERT INTO users (email, password, first_name, last_name, role, language)
VALUES ('student@aibootcamp.edu', '$2b$10$xmeV.UG98QPXx4XExmiLEO.u60xPVDMZp5WXyYZ/AEvxpLwCxyDjC', 'Alice', 'Student', 'student', 'en')
ON CONFLICT (email) DO NOTHING;
