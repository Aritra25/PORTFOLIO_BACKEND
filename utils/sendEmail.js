import nodeMailer from 'nodemailer';

export const sendEmail = async (options) => {
    if (!process.env.SMPT_EMAIL ||!process.env.SMPT_PASSWORD) {
        console.error("Missing SMTP credentials");
        throw new Error("Missing SMTP credentials");
    }
    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        host: process.env.SMPT_HOST,
        secure: true,
        port: process.env.SMPT_PORT,
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_EMAIL,
            pass: process.env.SMPT_PASSWORD,
        },
    });
    const mailOptions = {
        from: process.env.SMPT_EMAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    }
    await transporter.sendMail(mailOptions);
}