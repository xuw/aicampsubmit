import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, email, first_name, last_name, role, language, created_at FROM users';
    const params: any[] = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      query += ` WHERE role = $${paramCount}`;
      params.push(role);
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users';
    if (role) {
      countQuery += ' WHERE role = $1';
    }
    const countResult = await pool.query(countQuery, role ? [role] : []);
    const total = parseInt(countResult.rows[0].count);

    // Get users
    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const users = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      language: row.language,
      createdAt: row.created_at,
    }));

    res.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['student', 'ta', 'instructor', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update role
    const result = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2
       RETURNING id, email, first_name, last_name, role, language, created_at`,
      [role, userId]
    );

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      language: user.language,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
