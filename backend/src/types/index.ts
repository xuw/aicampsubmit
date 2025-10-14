export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'ta' | 'instructor' | 'admin';
  language: 'en' | 'zh-CN';
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  dueDate: Date;
  allowLateSubmission: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  textContent: string;
  status: 'draft' | 'submitted' | 'graded';
  submittedAt: Date | null;
  grade: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  submissionId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadedAt: Date;
}

export interface Feedback {
  id: string;
  submissionId: string;
  reviewerId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}
