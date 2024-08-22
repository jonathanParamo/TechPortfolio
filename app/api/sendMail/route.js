import nodemailer from 'nodemailer';

export async function POST(req) {
  console.log('Received request:', req);
  try {

    const { name, email, message } = await req.json();
    console.log('Parsed data:', { name, email, message });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NEXT_PUBLIC_GMAIL_USER,
        pass: process.env.NEXT_PUBLIC_GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.NEXT_PUBLIC_GMAIL_USER,
      to: process.env.NEXT_PUBLIC_RECEIVER_EMAIL,
      subject: `Contact Form Submission from ${name} (${email})`,
      text: message,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br>${message}</p>`,
    };

    console.log('Mail options:', mailOptions);

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: 'Mail sent successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: 'Error sending email' }), { status: 500 });
  }
}
