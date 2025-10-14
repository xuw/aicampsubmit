export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'ta' | 'instructor' | 'admin';
  language: 'en' | 'zh-CN';
  createdAt?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  creatorName?: string;
  dueDate: string;
  allowLateSubmission: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle?: string;
  studentId: string;
  studentName?: string;
  textContent: string;
  status: 'draft' | 'submitted' | 'graded';
  submittedAt: string | null;
  grade: number | null;
  attachments: Attachment[];
  feedback?: Feedback[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface Feedback {
  id: string;
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  content: string;
  grade?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
