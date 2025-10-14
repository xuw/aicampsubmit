import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';
import fs from 'fs/promises';
import path from 'path';

export const createOrUpdateSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId, textContent, status } = req.body;
    const files = req.files as Express.Multer.File[];
    const studentId = req.user!.userId;

    if (!assignmentId) {
      res.status(400).json({ error: 'Assignment ID is required' });
      return;
    }

    // Check if assignment exists and is not past due (unless late submission allowed)
    const assignmentResult = await pool.query(
      'SELECT due_date, allow_late_submission FROM assignments WHERE id = $1',
      [assignmentId]
    );

    if (assignmentResult.rows.length === 0) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    const assignment = assignmentResult.rows[0];
    const now = new Date();
    const dueDate = new Date(assignment.due_date);

    if (now > dueDate && !assignment.allow_late_submission && status === 'submitted') {
      res.status(400).json({ error: 'Submission deadline has passed' });
      return;
    }

    // Check if submission exists
    const existingSubmission = await pool.query(
      'SELECT id, submitted_at FROM submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignmentId, studentId]
    );

    let submissionId: string;
    let result;
    let isNewSubmission = false;

    if (existingSubmission.rows.length > 0) {
      // Update existing submission
      submissionId = existingSubmission.rows[0].id;
      // Only update submitted_at if status is being changed to 'submitted' and it's not already set
      const submittedAt = status === 'submitted' && !existingSubmission.rows[0].submitted_at ? new Date() : existingSubmission.rows[0].submitted_at;
      result = await pool.query(
        `UPDATE submissions
         SET text_content = $1, status = $2, submitted_at = $4
         WHERE id = $3
         RETURNING *`,
        [textContent, status, submissionId, submittedAt]
      );
    } else {
      // Create new submission
      isNewSubmission = true;
      const submittedAt = status === 'submitted' ? new Date() : null;
      result = await pool.query(
        `INSERT INTO submissions (assignment_id, student_id, text_content, status, submitted_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [assignmentId, studentId, textContent, status, submittedAt]
      );
      submissionId = result.rows[0].id;
    }

    // Handle file uploads
    if (files && files.length > 0) {
      for (const file of files) {
        await pool.query(
          `INSERT INTO attachments (submission_id, file_name, file_size, file_type, file_path)
           VALUES ($1, $2, $3, $4, $5)`,
          [submissionId, file.originalname, file.size, file.mimetype, file.path]
        );
      }
    }

    // Get attachments
    const attachmentsResult = await pool.query(
      'SELECT * FROM attachments WHERE submission_id = $1',
      [submissionId]
    );

    const submission = result.rows[0];
    const statusCode = isNewSubmission ? 201 : 200;
    res.status(statusCode).json({
      id: submission.id,
      assignmentId: submission.assignment_id,
      studentId: submission.student_id,
      textContent: submission.text_content,
      status: submission.status,
      submittedAt: submission.submitted_at,
      grade: submission.grade,
      attachments: attachmentsResult.rows.map(a => ({
        id: a.id,
        fileName: a.file_name,
        fileSize: a.file_size,
        fileType: a.file_type,
        uploadedAt: a.uploaded_at,
      })),
      createdAt: submission.created_at,
      updatedAt: submission.updated_at,
    });
  } catch (error) {
    console.error('Create/update submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMySubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user!.userId;
    const assignmentId = req.query.assignmentId as string;

    let query = `
      SELECT s.*, a.title as assignment_title, a.due_date
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.student_id = $1
    `;
    const params: any[] = [studentId];

    if (assignmentId) {
      query += ' AND s.assignment_id = $2';
      params.push(assignmentId);
    }

    query += ' ORDER BY s.updated_at DESC';

    const result = await pool.query(query, params);

    const submissions = await Promise.all(
      result.rows.map(async (row) => {
        const attachmentsResult = await pool.query(
          'SELECT * FROM attachments WHERE submission_id = $1',
          [row.id]
        );

        return {
          id: row.id,
          assignmentId: row.assignment_id,
          assignmentTitle: row.assignment_title,
          dueDate: row.due_date,
          textContent: row.text_content,
          status: row.status,
          submittedAt: row.submitted_at,
          grade: row.grade,
          attachments: attachmentsResult.rows.map(a => ({
            id: a.id,
            fileName: a.file_name,
            fileSize: a.file_size,
            fileType: a.file_type,
            uploadedAt: a.uploaded_at,
          })),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      })
    );

    res.json(submissions);
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSubmissionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;

    const result = await pool.query(
      `SELECT s.*, a.title as assignment_title, u.first_name, u.last_name
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN users u ON s.student_id = u.id
       WHERE s.id = $1`,
      [submissionId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    const submission = result.rows[0];

    // Check authorization
    if (submission.student_id !== req.user!.userId && !['ta', 'instructor', 'admin'].includes(req.user!.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Get attachments
    const attachmentsResult = await pool.query(
      'SELECT * FROM attachments WHERE submission_id = $1',
      [submissionId]
    );

    // Get feedback
    const feedbackResult = await pool.query(
      `SELECT f.*, u.first_name, u.last_name
       FROM feedback f
       JOIN users u ON f.reviewer_id = u.id
       WHERE f.submission_id = $1
       ORDER BY f.created_at DESC`,
      [submissionId]
    );

    res.json({
      id: submission.id,
      assignmentId: submission.assignment_id,
      assignmentTitle: submission.assignment_title,
      studentId: submission.student_id,
      studentName: `${submission.first_name} ${submission.last_name}`,
      textContent: submission.text_content,
      status: submission.status,
      submittedAt: submission.submitted_at,
      grade: submission.grade,
      attachments: attachmentsResult.rows.map(a => ({
        id: a.id,
        fileName: a.file_name,
        fileSize: a.file_size,
        fileType: a.file_type,
        uploadedAt: a.uploaded_at,
      })),
      feedback: feedbackResult.rows.map(f => ({
        id: f.id,
        content: f.content,
        reviewerId: f.reviewer_id,
        reviewerName: `${f.first_name} ${f.last_name}`,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      })),
      createdAt: submission.created_at,
      updatedAt: submission.updated_at,
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSubmissionsByAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM submissions WHERE assignment_id = $1',
      [assignmentId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT s.*, u.first_name, u.last_name
       FROM submissions s
       JOIN users u ON s.student_id = u.id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC
       LIMIT $2 OFFSET $3`,
      [assignmentId, limit, offset]
    );

    const submissions = result.rows.map(row => ({
      id: row.id,
      assignmentId: row.assignment_id,
      studentId: row.student_id,
      studentName: `${row.first_name} ${row.last_name}`,
      status: row.status,
      submittedAt: row.submitted_at,
      grade: row.grade,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({
      submissions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get submissions by assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const downloadAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attachmentId } = req.params;

    const result = await pool.query(
      `SELECT a.*, s.student_id
       FROM attachments a
       JOIN submissions s ON a.submission_id = s.id
       WHERE a.id = $1`,
      [attachmentId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Attachment not found' });
      return;
    }

    const attachment = result.rows[0];

    // Check authorization
    if (attachment.student_id !== req.user!.userId && !['ta', 'instructor', 'admin'].includes(req.user!.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const filePath = path.resolve(attachment.file_path);
    res.download(filePath, attachment.file_name);
  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const viewAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attachmentId } = req.params;

    const result = await pool.query(
      `SELECT a.*, s.student_id
       FROM attachments a
       JOIN submissions s ON a.submission_id = s.id
       WHERE a.id = $1`,
      [attachmentId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Attachment not found' });
      return;
    }

    const attachment = result.rows[0];

    // Check authorization
    if (attachment.student_id !== req.user!.userId && !['ta', 'instructor', 'admin'].includes(req.user!.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const filePath = path.resolve(attachment.file_path);
    const fs = require('fs');

    // Set appropriate content type based on file extension
    const ext = path.extname(attachment.file_name).toLowerCase();
    const contentTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.txt': 'text/plain; charset=utf-8',
      '.md': 'text/markdown; charset=utf-8',
      '.ipynb': 'application/json; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');

    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('View attachment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
