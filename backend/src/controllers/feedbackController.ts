import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId, content, grade } = req.body;

    if (!submissionId || !content) {
      res.status(400).json({ error: 'Submission ID and content are required' });
      return;
    }

    if (grade !== undefined && grade !== null) {
      if (grade < 0 || grade > 100) {
        res.status(400).json({ error: 'Grade must be between 0 and 100' });
        return;
      }
    }

    // Check if submission exists
    const submissionResult = await pool.query(
      'SELECT id FROM submissions WHERE id = $1',
      [submissionId]
    );

    if (submissionResult.rows.length === 0) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    // Create feedback
    const feedbackResult = await pool.query(
      `INSERT INTO feedback (submission_id, reviewer_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [submissionId, req.user!.userId, content]
    );

    // Update submission grade and status if provided
    if (grade !== undefined && grade !== null) {
      await pool.query(
        `UPDATE submissions SET grade = $1, status = 'graded' WHERE id = $2`,
        [grade, submissionId]
      );
    }

    const feedback = feedbackResult.rows[0];
    res.status(201).json({
      id: feedback.id,
      submissionId: feedback.submission_id,
      reviewerId: feedback.reviewer_id,
      content: feedback.content,
      grade,
      createdAt: feedback.created_at,
      updatedAt: feedback.updated_at,
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { feedbackId } = req.params;
    const { content, grade } = req.body;

    if (!content && grade === undefined) {
      res.status(400).json({ error: 'Content or grade is required' });
      return;
    }

    if (grade !== undefined && grade !== null && (grade < 0 || grade > 100)) {
      res.status(400).json({ error: 'Grade must be between 0 and 100' });
      return;
    }

    // Check if feedback exists and if user is authorized
    const feedbackResult = await pool.query(
      'SELECT reviewer_id, submission_id FROM feedback WHERE id = $1',
      [feedbackId]
    );

    if (feedbackResult.rows.length === 0) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }

    const feedback = feedbackResult.rows[0];

    // Only original reviewer or instructor can edit
    if (feedback.reviewer_id !== req.user!.userId && req.user!.role !== 'instructor') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Update feedback
    const updateResult = await pool.query(
      `UPDATE feedback
       SET content = COALESCE($1, content)
       WHERE id = $2
       RETURNING *`,
      [content, feedbackId]
    );

    // Update grade if provided
    if (grade !== undefined && grade !== null) {
      await pool.query(
        `UPDATE submissions SET grade = $1, status = 'graded' WHERE id = $2`,
        [grade, feedback.submission_id]
      );
    }

    const updatedFeedback = updateResult.rows[0];
    res.json({
      id: updatedFeedback.id,
      submissionId: updatedFeedback.submission_id,
      reviewerId: updatedFeedback.reviewer_id,
      content: updatedFeedback.content,
      grade,
      createdAt: updatedFeedback.created_at,
      updatedAt: updatedFeedback.updated_at,
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFeedbackBySubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;

    // Check if submission exists and if user is authorized
    const submissionResult = await pool.query(
      'SELECT student_id FROM submissions WHERE id = $1',
      [submissionId]
    );

    if (submissionResult.rows.length === 0) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    const submission = submissionResult.rows[0];

    // Check authorization
    if (submission.student_id !== req.user!.userId && !['ta', 'instructor', 'admin'].includes(req.user!.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Get feedback
    const result = await pool.query(
      `SELECT f.*, u.first_name, u.last_name, s.grade
       FROM feedback f
       JOIN users u ON f.reviewer_id = u.id
       LEFT JOIN submissions s ON f.submission_id = s.id
       WHERE f.submission_id = $1
       ORDER BY f.created_at DESC`,
      [submissionId]
    );

    const feedback = result.rows.map(row => ({
      id: row.id,
      submissionId: row.submission_id,
      reviewerId: row.reviewer_id,
      reviewerName: `${row.first_name} ${row.last_name}`,
      content: row.content,
      grade: row.grade,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback by submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
