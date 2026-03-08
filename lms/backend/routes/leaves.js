const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/leaves — Employee: Apply for leave
router.post(
  '/',
  authenticate,
  authorize('employee'),
  [
    body('leaveType')
      .isIn(['sick', 'casual', 'annual', 'maternity', 'paternity', 'unpaid'])
      .withMessage('Invalid leave type'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('reason')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Reason must be at least 10 characters')
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const { leaveType, startDate, endDate, reason } = req.body;

      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        return res.status(400).json({ message: 'Start date cannot be in the past.' });
      }
      if (end < start) {
        return res.status(400).json({ message: 'End date must be on or after start date.' });
      }

      const leave = await Leave.create({
        employee: req.user._id,
        leaveType,
        startDate: start,
        endDate: end,
        reason,
      });

      await leave.populate('employee', 'name email department');

      res.status(201).json({ message: 'Leave application submitted successfully', leave });
    } catch (err) {
      res.status(500).json({ message: 'Failed to apply for leave', error: err.message });
    }
  }
);

// GET /api/leaves — Employee: own leaves | Employer: all leaves
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'employee' ? { employee: req.user._id } : {};
    const { status, leaveType } = req.query;

    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;

    const leaves = await Leave.find(filter)
      .populate('employee', 'name email department')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ leaves, total: leaves.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leave applications', error: err.message });
  }
});

// GET /api/leaves/:id — Get single leave
router.get('/:id', authenticate, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'name email department')
      .populate('reviewedBy', 'name email');

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found.' });
    }

    // Employees can only view their own
    if (req.user.role === 'employee' && leave.employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ leave });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leave application', error: err.message });
  }
});

// PATCH /api/leaves/:id/review — Employer: approve or reject
router.patch(
  '/:id/review',
  authenticate,
  authorize('employer'),
  [
    body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
    body('reviewNote').optional().trim().isLength({ max: 300 }).withMessage('Review note cannot exceed 300 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const leave = await Leave.findById(req.params.id);

      if (!leave) {
        return res.status(404).json({ message: 'Leave application not found.' });
      }

      if (leave.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending applications can be reviewed.' });
      }

      leave.status = req.body.status;
      leave.reviewedBy = req.user._id;
      leave.reviewNote = req.body.reviewNote || '';
      leave.reviewedAt = new Date();
      await leave.save();

      await leave.populate('employee', 'name email department');
      await leave.populate('reviewedBy', 'name email');

      res.json({
        message: `Leave application ${req.body.status} successfully`,
        leave,
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to review leave application', error: err.message });
    }
  }
);

// DELETE /api/leaves/:id — Employee: delete own pending leave
router.delete('/:id', authenticate, authorize('employee'), async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found.' });
    }

    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending applications can be deleted.' });
    }

    await leave.deleteOne();
    res.json({ message: 'Leave application deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete leave application', error: err.message });
  }
});

module.exports = router;
