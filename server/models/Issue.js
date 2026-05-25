const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Electrical', 'Plumbing', 'Heating', 'Cleaning', 'Structural',
      'IT Equipment', 'Furniture', 'Windows and Doors', 'Lighting',
      'Pest Control', 'Lift and Accessibility', 'Other'
    ]
  },
  location: {
  building: {
    type: String,
    required: true,
    enum: [
      'K Block', 'Main Building', 'Waldegrave Suite', 'Block B', 'Block C',
      'Block D', 'Block E', 'Block F', 'Block G', 'K Block', '1850 Theatre',
      'Sports Centre', 'Library', 'Student Union', 'Chaplaincy', 'Car Park',
      'The Pub', 'Other'
    ]
  },
  room: {
    type: String,
    default: ''
  }
},
  description: {
    type: String,
    required: true
  },
  photoUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Awaiting Parts', 'Resolved', 'Closed'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [
    {
      text: {
        type: String,
        required: true
      },
      user: {
        name: { type: String, default: 'Facilities Team' },
        email: { type: String, default: '' },
        role: { type: String, default: 'facilities' }
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);