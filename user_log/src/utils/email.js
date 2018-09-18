
const nodemailer = require('nodemailer')

class Email {
  constructor(email_options){
    this.myEmail = email_options.sender_email
    this.myPass = email_options.sender_password
    this.receiverEmail = email_options.receiver_email

    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      service: 'gmail',
      auth: {
        user: this.myEmail,
        pass: this.myPass
      }
    })
  }


  sendMail(mailOptions){
    mailOptions.from = this.myEmail
    mailOptions.to = this.receiverEmail

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          return reject(error);
        } else {
          return resolve(`Email sent: ${info.response}`);
        }
      })
    })
  }
}

module.exports = {
  Email
}
