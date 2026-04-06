const nodemailer = require('nodemailer')

const smtpHost = process.env.SMTP_HOST
const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 587
const smtpSecure = process.env.SMTP_SECURE === 'true'
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const fromAddress = process.env.EMAIL_FROM || 'no-reply@jobconnect.com'

const transporter = smtpHost && smtpUser && smtpPass ? nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
}) : null

const sendMail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.warn('SMTP config missing. Email content below:')
    console.warn('To:', to)
    console.warn('Subject:', subject)
    console.warn('Text:', text)
    console.warn('HTML:', html)
    return null
  }

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    text,
    html
  })

  return info
}

module.exports = { sendMail }
