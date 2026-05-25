const nodemailer = require('nodemailer');

const sendEmail = async (recipientEmail, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: `Reficere St Mary's <${process.env.EMAIL_ADDRESS}>`,
      to: recipientEmail,
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #f9fafb;">
          <div style="background: #1a1a2e; padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 32px; height: 32px; background: #00e87a; border-radius: 8px; display: inline-block; text-align: center; line-height: 32px;">
                <span style="color: #1a1a2e; font-weight: 900; font-size: 16px;">R</span>
              </div>
              <span style="color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: 2px; margin-left: 10px;">REFICERE</span>
            </div>
            <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 8px 0 0; letter-spacing: 1px;">
              ST MARY'S UNIVERSITY, TWICKENHAM
            </p>
          </div>

          <div style="background: #ffffff; padding: 32px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
            <p style="color: #111827; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
              ${message}
            </p>
            <a href="http://localhost:3000/dashboard"
              style="display: inline-block; padding: 12px 24px; background: #00e87a; color: #1a1a2e; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
              View in Reficere
            </a>
          </div>

          <div style="background: #f9fafb; padding: 20px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
              This is an automated message from Reficere — the campus maintenance platform at St Mary's University.<br/>
              Please do not reply to this email. For queries contact
              <a href="mailto:facilities@stmarys.ac.uk" style="color: #00b85e;">facilities@stmarys.ac.uk</a>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log('Email error:', error.message);
    throw error;
  }
};

module.exports = sendEmail;