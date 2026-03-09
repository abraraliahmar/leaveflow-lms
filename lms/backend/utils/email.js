const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendLeaveStatusEmail({ employeeEmail, employeeName, leaveType, startDate, endDate, totalDays, status, reviewNote, reviewerName }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const isApproved = status === 'approved';
  const statusColor = isApproved ? '#10b981' : '#ef4444';
  const statusLabel = isApproved ? 'Approved' : 'Rejected';
  try {
    await transporter.sendMail({
      from: `"LeaveFlow" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: `Leave ${statusLabel} — ${leaveType} Leave`,
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:20px;border-radius:10px;border:1px solid #e5e7eb">
        <h2 style="color:${statusColor}">Leave ${statusLabel}</h2>
        <p>Hi <strong>${employeeName}</strong>,</p>
        <p>Your <strong>${leaveType}</strong> leave request has been <strong style="color:${statusColor}">${statusLabel}</strong> by ${reviewerName}.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#6b7280">From</td><td style="padding:8px;font-weight:600">${new Date(startDate).toDateString()}</td></tr>
          <tr><td style="padding:8px;color:#6b7280">To</td><td style="padding:8px;font-weight:600">${new Date(endDate).toDateString()}</td></tr>
          <tr><td style="padding:8px;color:#6b7280">Days</td><td style="padding:8px;font-weight:600">${totalDays}</td></tr>
          ${reviewNote ? `<tr><td style="padding:8px;color:#6b7280">Note</td><td style="padding:8px;font-style:italic">${reviewNote}</td></tr>` : ''}
        </table>
        <p style="color:#9ca3af;font-size:12px">This is an automated email from LeaveFlow.</p>
      </div>`,
    });
    console.log('Email sent to', employeeEmail);
  } catch (err) {
    console.error('Email failed:', err.message);
  }
}

async function sendWelcomeEmail({ email, name, role }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  try {
    await transporter.sendMail({
      from: `"LeaveFlow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to LeaveFlow, ${name}! 🎉`,
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:20px;border-radius:10px;border:1px solid #e5e7eb">
        <h2 style="color:#4f6ef7">Welcome to LeaveFlow! 📅</h2>
        <p>Hi <strong>${name}</strong> 👋</p>
        <p>Your account has been created as a <strong>${role}</strong>. You can now log in and start using LeaveFlow.</p>
        <p style="color:#9ca3af;font-size:12px">This is an automated email from LeaveFlow.</p>
      </div>`,
    });
  } catch (err) {
    console.error('Welcome email failed:', err.message);
  }
}

module.exports = { sendLeaveStatusEmail, sendWelcomeEmail };