var nodemailer = require('nodemailer');
const myEmail = 'jcom.94@live.com';
const myPass = '';

var transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: myEmail,
    pass: myPass
  }
});

var mailOptions = {
  from: myEmail,
  to: 'jcom94m@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
