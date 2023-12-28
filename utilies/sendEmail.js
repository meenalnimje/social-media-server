const nodemailer = require("nodemailer");
const sentEmail = (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.text,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log("this is the error sendEmail side utilies ", err);
    } else {
      console.log("info from send email side ", info);
    }
  });
};
module.exports = sentEmail;
