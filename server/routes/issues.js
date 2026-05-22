const express = require('express');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const { status, category, building } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (building) filter['location.building'] = building;

  const issues = await Issue.find(filter)
    .populate('submittedBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(issues);
});

router.get('/analytics', verifyToken, async (req, res) => {
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
});

router.get('/:id', verifyToken, async (req, res) => {
  const issue = await Issue.findById(req.params.id)
    .populate('submittedBy', 'name email');

  if (!issue) {
    return res.status(404).json({ message: 'Issue not found' });
  }

  res.json(issue);
});

router.post('/', verifyToken, async (req, res) => {
  const issue = await Issue.create({
    ...req.body,
    submittedBy: req.user._id
  });

  res.status(201).json(issue);
});

router.put('/:id', verifyToken, async (req, res) => {
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
  );

  if (req.body.status && req.body.status !== issue.status) {
    await Notification.create({
      recipient: issue.submittedBy._id,
      issue: issue._id,
      message: `Your issue "${issue.title}" at ${issue.location.building} has been updated to ${req.body.status}`
    });

    await sendEmail(
      issue.submittedBy.email,
      `Reficere Update — ${issue.title}`,
      `Your maintenance issue at ${issue.location.building} has been updated to <strong>${req.body.status}</strong>. Log in to Reficere to view the full details.`
    );
  }

  res.json(updatedIssue);
});

router.post('/:id/comments', verifyToken, async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    return res.status(404).json({ message: 'Issue not found' });
  }

  issue.comments.push({
    text: req.body.text,
    author: req.user.name
  });

  await issue.save();
  res.status(201).json(issue);
});

router.delete('/:id', verifyToken, async (req, res) => {
  const issue = await Issue.findByIdAndDelete(req.params.id);

  if (!issue) {
    return res.status(404).json({ message: 'Issue not found' });
  }

  res.json({ message: 'Issue deleted successfully' });
});

module.exports = router;