const nodemailer = require('nodemailer');

const sendEmail = async ({
  to,
  content = 'Hi',
  subject = null,
  text = null,
}) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    // port: 465,
    // secure: true,
    auth: {
      user: 'kmukesh0017@gmail.com',
      // pass: 'twds kvkn egvq mwnn', // personal
      pass: 'pwmv yqya ndyo lquc', // personal 2
    },
  });

  const mailOptions = {
    from: 'Mukesh Kunar <kmukesh0017@gmail.com>',
    to: to,
    html: content,
  };

  if (subject) mailOptions['subject'] = subject;
  if (text) mailOptions['text'] = text;

  const info = await transporter.sendMail(mailOptions);

  return info;
};

// sendEmail({
//   to: 'a42463251@gmail.com',
//   user: {
//     first_name: 'Mukesh',
//     last_name: 'Kumar',
//   },
// });

module.exports = sendEmail;
