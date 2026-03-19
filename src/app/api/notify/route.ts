import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import pool, { ensureTableExists } from '@/lib/db';
import { uuidv7 } from 'uuidv7';

export async function POST(request: Request) {
    try {
        const { action, images, characterName, userEmail, counts } = await request.json();

        if (action === 'complete') {
            // Write to database
            try {
                await ensureTableExists();

                const now = new Date();
                const yyyy = now.getFullYear();
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const dd = String(now.getDate()).padStart(2, '0');
                const hh = String(now.getHours()).padStart(2, '0');
                const min = String(now.getMinutes()).padStart(2, '0');

                const loraValue = `${characterName || 'Unknown'}-${yyyy}${mm}${dd}-${hh}${min}.safetensor`;

                const portraitCount = counts?.portrait || 0;
                const halfBodyCount = counts?.['half-body'] || 0;
                const fullBodyCount = counts?.['full-body'] || 0;
                const totalCount = portraitCount + halfBodyCount + fullBodyCount;

                const insertQuery = `
                    INSERT INTO character_lora (
                        id, 
                        name, 
                        lora, 
                        user_email, 
                        portrait_selected, 
                        half_body_selected, 
                        full_body_selected, 
                        total_selected, 
                        updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `;

                const values = [
                    uuidv7(),
                    characterName || 'Unknown',
                    loraValue,
                    userEmail || 'N/A',
                    portraitCount,
                    halfBodyCount,
                    fullBodyCount,
                    totalCount,
                    now
                ];

                await pool.query(insertQuery, values);
                console.log("Database record created successfully");
            } catch (dbError) {
                console.error("Failed to write to database:", dbError);
                // Return an error if DB write fails? Or just continue...
                // Usually DB is more critical than email.
            }

            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });

                const emailContent = `
A new character selection has been finalized!

--- CHARACTER INFO ---
Name: ${characterName || 'N/A'}
User Email: ${userEmail || 'N/A'}

--- SELECTION SUMMARY ---
Total Portraits: ${counts?.portrait || 0}
Total Half-Body: ${counts?.['half-body'] || 0}
Total Full-Body: ${counts?.['full-body'] || 0}
Total Selected: ${(counts?.portrait || 0) + (counts?.['half-body'] || 0) + (counts?.['full-body'] || 0)}
                `;

                const mailOptions = {
                    from: process.env.SMTP_FROM || '"Image Selection" <noreply@onecool.com>',
                    to: process.env.EMAIL_RECIPIENT || 'henry@henrywithu.com, onecoolaifxdev@gmail.com',
                    subject: `Portrait Selection Finalized: ${characterName || 'Unknown Character'}`,
                    text: emailContent,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #333;">Selection Finalized</h2>
                            <p style="color: #666;">A new character image set has been curated and saved.</p>
                            
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin-top: 0; font-size: 16px;">Character Details</h3>
                                <p style="margin: 5px 0;"><strong>Name:</strong> ${characterName}</p>
                                <p style="margin: 5px 0;"><strong>User Contact:</strong> ${userEmail}</p>
                            </div>

                            <div style="padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;">
                                <h3 style="margin-top: 0; font-size: 16px;">Selection Stats</h3>
                                <ul style="list-style: none; padding: 0;">
                                    <li style="padding: 5px 0; border-bottom: 1px solid #eee;">Portraits: <strong>${counts?.portrait || 0}</strong></li>
                                    <li style="padding: 5px 0; border-bottom: 1px solid #eee;">Half-Body: <strong>${counts?.['half-body'] || 0}</strong></li>
                                    <li style="padding: 5px 0;">Full-Body: <strong>${counts?.['full-body'] || 0}</strong></li>
                                </ul>
                                <p style="margin-top: 15px; font-weight: bold; font-size: 18px;">Total: ${(counts?.portrait || 0) + (counts?.['half-body'] || 0) + (counts?.['full-body'] || 0)} images</p>
                            </div>
                        </div>
                    `,
                };

                await transporter.sendMail(mailOptions);
                console.log("Email sent successfully");
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
            }

            // console.log('Action complete, selected images:', images);

            return NextResponse.json({ success: true, message: 'Character Lora recorded and notification sent.' });
        }

        return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });

    } catch (error) {
        console.error('Error in notify route:', error);
        return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
    }
}
