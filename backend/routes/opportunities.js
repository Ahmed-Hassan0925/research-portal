const express = require('express');
const router = express.Router();
const db = require('../db');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/opportunities  →  Create a new research opportunity
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      research_area,
      faculty_name,
      department,
      required_skills,
      available_positions,
      application_deadline,
      status,
    } = req.body;

    // Validation
    if (
      !title || !description || !research_area ||
      !faculty_name || !department || !required_skills ||
      !available_positions || !application_deadline
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided.',
      });
    }

    if (parseInt(available_positions) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Available positions must be at least 1.',
      });
    }

    const deadlineDate = new Date(application_deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application deadline date.',
      });
    }

    const finalStatus = status === 'Closed' ? 'Closed' : 'Open';

    const [result] = await db.execute(
      `INSERT INTO opportunities
        (title, description, research_area, faculty_name, department,
         required_skills, available_positions, application_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, research_area, faculty_name,
        department, required_skills, parseInt(available_positions),
        application_deadline, finalStatus,
      ]
    );

    const [newOpp] = await db.execute(
      'SELECT * FROM opportunities WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Research opportunity created successfully.',
      data: newOpp[0],
    });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/opportunities  →  Retrieve all research opportunities
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, research_area, search } = req.query;
    let query = 'SELECT * FROM opportunities WHERE 1=1';
    const params = [];

    if (status && (status === 'Open' || status === 'Closed')) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (research_area) {
      query += ' AND research_area = ?';
      params.push(research_area);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR faculty_name LIKE ? OR department LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.execute(query, params);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/opportunities/:id  →  Retrieve a single research opportunity
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid opportunity ID.',
      });
    }

    const [rows] = await db.execute(
      'SELECT * FROM opportunities WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/opportunities/:id  →  Update a research opportunity
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid opportunity ID.',
      });
    }

    // Check if opportunity exists
    const [existing] = await db.execute(
      'SELECT * FROM opportunities WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity with ID ${id} not found.`,
      });
    }

    const {
      title,
      description,
      research_area,
      faculty_name,
      department,
      required_skills,
      available_positions,
      application_deadline,
      status,
    } = req.body;

    // Validation
    if (
      !title || !description || !research_area ||
      !faculty_name || !department || !required_skills ||
      !available_positions || !application_deadline
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided.',
      });
    }

    if (parseInt(available_positions) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Available positions must be at least 1.',
      });
    }

    if (status && status !== 'Open' && status !== 'Closed') {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Open" or "Closed".',
      });
    }

    const finalStatus = status === 'Closed' ? 'Closed' : 'Open';

    await db.execute(
      `UPDATE opportunities SET
        title = ?, description = ?, research_area = ?, faculty_name = ?,
        department = ?, required_skills = ?, available_positions = ?,
        application_deadline = ?, status = ?
       WHERE id = ?`,
      [
        title, description, research_area, faculty_name,
        department, required_skills, parseInt(available_positions),
        application_deadline, finalStatus, id,
      ]
    );

    const [updated] = await db.execute(
      'SELECT * FROM opportunities WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Research opportunity updated successfully.',
      data: updated[0],
    });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/opportunities/:id  →  Delete a research opportunity
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid opportunity ID.',
      });
    }

    const [existing] = await db.execute(
      'SELECT * FROM opportunities WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity with ID ${id} not found.`,
      });
    }

    await db.execute('DELETE FROM opportunities WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: `Research opportunity "${existing[0].title}" deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
});

module.exports = router;
