const mail = require('../Service/mailer.service')


// Registration Verification mail
const verificationMail = async (email, verficationCode, username) => {
     const subject = 'User verification'
     const body = `<!DOCTYPE HTML>
     <html>
     <head>
     </head>
     <body>
     <h1>OTP Verification</h1>
     <h1>Hello ${username}</h1>
     <h1> Your One Time Password (OTP) is : ${verficationCode}</h1>
     <P> This password is for a limited time</P>
     <p> If you did not request for OTP kindly ignore this message, your account is safe with us</p>
     </body>
     </html>
     `
     await mail.mailService.sendEmail(email, subject, body)
}

//Resend otp mail
const resendOtpMail = async (email, verficationCode, username) => {
    const subject = 'Resend Otp'
    const body = `<!DOCTYPE HTML>
    <html>
    <head>
    </head>
    <body>
    <h1>OTP</h1>
    <h1>Hello ${username}</h1>
    <h1> Your One Time Password (OTP) is : ${verficationCode}</h1>
    <P> This code is for a limited time</P>
    <p> You got this email because you request for another otp</p>
    <p> If you did not request for OTP kindly ignore this message, your account is safe with us</p>
    </body>
    </html>
    `
    await mail.mailService.sendEmail(email, subject, body)
}

//Reset password link
const passwordResetLinkMail = async (email, resetLink, username) => {
    const subject = 'Reset password Link'
    const body = `<!DOCTYPE HTML>
    <html>
    <head>
    </head>
    <body>
    <h1>Reset link</h1>
    <h1>Hello ${username}</h1>
    <h1> Your reset password link is : ${resetLink}</h1>
    <P> This link is for a limited time</P>
    <p> You got this email because you request for a reset password</p>
    <p> If you did not request for reset password kindly ignore this message, your account is safe with us</p>
    </body>
    </html>
    `
    await mail.mailService.sendEmail(email, subject, body)
}
module.exports = {
    verificationMail,
    resendOtpMail,
    passwordResetLinkMail
}

