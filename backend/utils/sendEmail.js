import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.mailtrap.io', // Using arbitrary host or from env
            port: process.env.EMAIL_PORT || 2525,
            auth: {
                user: process.env.EMAIL_USER || 'testuser',
                pass: process.env.EMAIL_PASS || 'testpass'
            }
        });

        // Define email options
        const mailOptions = {
            from: 'WaterSense System <noreply@watersense.com>',
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.htmlMessage || `<p>${options.message}</p>`
        };

        // Actually send the email (if mock credentials work, otherwise it logs error but app won't crash)
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${options.email}`);
    } catch (error) {
        console.error("Email could not be sent", error);
    }
};

export default sendEmail;
