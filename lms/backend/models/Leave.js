const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['sick', 'casual', 'annual', 'maternity', 'paternity', 'unpaid'],
      required: [true, 'Leave type is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      minlength: [10, 'Reason must be at least 10 characters'],
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNote: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    totalDays: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Calculate total days before saving
leaveSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

// Validate endDate >= startDate
leaveSchema.path('endDate').validate(function (value) {
  return value >= this.startDate;
}, 'End date must be on or after start date');

module.exports = mongoose.model('Leave', leaveSchema);
