import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, dueDate, allowLateSubmission, maxFileSize, allowedFileTypes } = req.body;

    if (!title || !dueDate) {
      res.status(400).json({ error: 'Title and due date are required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO assignments (title, description, created_by, due_date, allow_late_submission, max_file_size, allowed_file_types)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, req.user!.userId, dueDate, allowLateSubmission || false, maxFileSize || 10, allowedFileTypes || []]
    );

    const assignment = result.rows[0];
    res.status(201).json({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      createdBy: assignment.created_by,
      dueDate: assignment.due_date,
      allowLateSubmission: assignment.allow_late_submission,
      maxFileSize: assignment.max_file_size,
      allowedFileTypes: assignment.allowed_file_types,
      createdAt: assignment.created_at,
      updatedAt: assignment.updated_at,
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM assignments');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT a.*, u.first_name, u.last_name
       FROM assignments a
       LEFT JOIN users u ON a.created_by = u.id
       ORDER BY a.due_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const assignments = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      createdBy: row.created_by,
      creatorName: `${row.first_name} ${row.last_name}`,
      dueDate: row.due_date,
      allowLateSubmission: row.allow_late_submission,
      maxFileSize: row.max_file_size,
      allowedFileTypes: row.allowed_file_types,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({
      assignments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;

    const result = await pool.query(
      `SELECT a.*, u.first_name, u.last_name
       FROM assignments a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [assignmentId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      title: row.title,
      description: row.description,
      createdBy: row.created_by,
      creatorName: `${row.first_name} ${row.last_name}`,
      dueDate: row.due_date,
      allowLateSubmission: row.allow_late_submission,
      maxFileSize: row.max_file_size,
      allowedFileTypes: row.allowed_file_types,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const { title, description, dueDate, allowLateSubmission, maxFileSize, allowedFileTypes } = req.body;

    // Check if user is creator or instructor
    const checkResult = await pool.query(
      'SELECT created_by FROM assignments WHERE id = $1',
      [assignmentId]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    if (checkResult.rows[0].created_by !== req.user!.userId && req.user!.role !== 'instructor') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const result = await pool.query(
      `UPDATE assignments
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           due_date = COALESCE($3, due_date),
           allow_late_submission = COALESCE($4, allow_late_submission),
           max_file_size = COALESCE($5, max_file_size),
           allowed_file_types = COALESCE($6, allowed_file_types)
       WHERE id = $7
       RETURNING *`,
      [title, description, dueDate, allowLateSubmission, maxFileSize, allowedFileTypes, assignmentId]
    );

    const assignment = result.rows[0];
    res.json({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      createdBy: assignment.created_by,
      dueDate: assignment.due_date,
      allowLateSubmission: assignment.allow_late_submission,
      maxFileSize: assignment.max_file_size,
      allowedFileTypes: assignment.allowed_file_types,
      createdAt: assignment.created_at,
      updatedAt: assignment.updated_at,
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;

    // Check if user is creator or instructor
    const checkResult = await pool.query(
      'SELECT created_by FROM assignments WHERE id = $1',
      [assignmentId]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    if (checkResult.rows[0].created_by !== req.user!.userId && req.user!.role !== 'instructor') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await pool.query('DELETE FROM assignments WHERE id = $1', [assignmentId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
