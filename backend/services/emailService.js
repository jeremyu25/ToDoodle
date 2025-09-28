import nodemailer from 'nodemailer'

// Create transporter using Mailgun SMTP
const transporter = nodemailer.createTransport({
    host: process.env.MAILGUN_SMTP_SERVER,
    port: process.env.MAILGUN_SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    auth: {
        user: process.env.MAILGUN_USERNAME,
        pass: process.env.MAILGUN_PASSWORD
    }
})

export const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: process.env.MAILGUN_USERNAME,
            to,
            subject,
            text,
            html
        }

        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent: ', info.messageId)
        return info
    } catch (error) {
        console.error('Error sending email:', error)
        throw error
    }
}

export default { sendEmail }