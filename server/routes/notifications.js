const express = require('express');
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('issue', 'title location')
    .sort({ createdAt: -1 });

  res.json(notifications);
});

router.get('/unread', verifyToken, async (req, res) => {
  const count = await Notification.countDocuments({ 
    recipient: req.user._id, 
    read: false 
  });

  res.json({ count });
});

router.put('/:id/read', verifyToken, async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  res.json(notification);
});

router.put('/markallread', verifyToken, async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  );

  res.json({ message: 'All notifications marked as read' });
});

module.exports = router;