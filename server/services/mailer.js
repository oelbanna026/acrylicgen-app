const nodemailer = require('nodemailer');

function getMailer() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '0', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !port || !user || !pass) return null;
    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });
}

async function sendOtpEmail(to, code) {
    const transport = getMailer();
    if (!transport) return false;
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!from) return false;
    await transport.sendMail({
        from,
        to,
        subject: 'Your verification code',
        text: `Your verification code is: ${code}`,
        html: `<p>Your verification code is: <strong>${code}</strong></p>`
    });
    return true;
}

module.exports = { sendOtpEmail };
