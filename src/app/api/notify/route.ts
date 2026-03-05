import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { action, images, message } = await request.json();

        if (action === 'complete') {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });

                const emailContent = message || 'selection ok';

                const mailOptions = {
                    from: process.env.SMTP_FROM || '"Image Selection" <noreply@onecool.com>',
                    to: process.env.EMAIL_RECIPIENT || 'henry@henrywithu.com, onecoolaifxdev@gmail.com',
                    subject: 'Selection OK',
                    text: emailContent,
                    html: `<p>${emailContent.replace(/\n/g, '<br>')}</p>`,
                };

                await transporter.sendMail(mailOptions);
                console.log("Email sent successfully");
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
                // We'll proceed even if email fails, or we could return an error. Let's return a partial success or just log it.
                // If it's critical, we could throw here. We will just log it for now.
            }

            console.log('Action complete, selected images:', images);

            return NextResponse.json({ success: true, message: 'Notification sent and selection completed.' });
        }

        return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });

    } catch (error) {
        console.error('Error in notify route:', error);
        return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
    }
}
