const express = require('express');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const { verifyToken } = require('../middleware/verifyToken');
const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, category, building } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (building) filter['location.building'] = building;

    const issues = await Issue.find(filter)
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    const mapped = issues.map(i => ({
      ...i.toObject(),
      user: i.submittedBy
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/analytics', verifyToken, async (req, res) => {
  try {
    const byCategory = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const byStatus = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byBuilding = await Issue.aggregate([
      { $group: { _id: '$location.building', count: { $sum: 1 } } }
    ]);
    res.json({ byCategory, byStatus, byBuilding });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('submittedBy', 'name email');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const mapped = {
      ...issue.toObject(),
      user: issue.submittedBy
    };

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const issue = await Issue.create({
      ...req.body,
      submittedBy: req.user._id
    });
    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('submittedBy', 'name email');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const isOwner = issue.submittedBy._id.toString() === req.user._id.toString();
    const isFacilities = ['facilities', 'staff', 'admin'].includes(req.user.role);

    if (!isOwner && !isFacilities) {
      return res.status(403).json({ message: 'You do not have permission to update this issue' });
    }

    if (req.body.status === 'Resolved') {
      req.body.resolvedAt = new Date();
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('submittedBy', 'name email');

    if (req.body.status && req.body.status !== issue.status) {
      await Notification.create({
        recipient: issue.submittedBy._id,
        issue: issue._id,
        message: `Your issue "${issue.title}" at ${issue.location.building} has been updated to ${req.body.status}`
      });

      try {
        await sendEmail(
          issue.submittedBy.email,
          `Reficere Update — ${issue.title}`,
          `Your maintenance issue at ${issue.location.building} has been updated to <strong>${req.body.status}</strong>. Log in to Reficere to view the full details.`
        );
      } catch (emailErr) {
        console.log('Email failed:', emailErr.message);
      }
    }

    const mapped = {
      ...updatedIssue.toObject(),
      user: updatedIssue.submittedBy
    };

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.comments.push({
      text: req.body.text,
      user: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      createdAt: new Date()
    });

    await issue.save();

    const populated = await Issue.findById(req.params.id)
      .populate('submittedBy', 'name email');

    const mapped = {
      ...populated.toObject(),
      user: populated.submittedBy
    };

    res.status(201).json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;