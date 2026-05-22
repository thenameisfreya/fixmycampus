const nodemailer = require('nodemailer');

const sendEmail = async (recipientEmail, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: Reficere St Marys <${process.env.EMAIL_ADDRESS}>,
    to: recipientEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Reficere — Campus Maintenance Platform</h2>
        <p>St Marys University, Twickenham</p>
        <hr/>
        <p>${message}</p>
        <hr/>
        <p style="color: #999; font-size: 12px;">
          This is an automated message from Reficere. 
          Please do not reply to this email. 
          Contact the Facilities Team at facilities@stmarys.ac.uk
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;