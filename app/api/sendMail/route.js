import nodemailer from 'nodemailer';

export async function POST(req) {
  console.log('Received request:', req);
  try {
    // Agregar console.log para depuración

    const { name, email, message } = await req.json();
    console.log('Parsed data:', { name, email, message });

    const transporter = nodemailer.createTransport({
      service: 'outlook',
      auth: {
        user: process.env.NEXT_PUBLIC_OUTLOOK_USER,
        pass: process.env.NEXT_PUBLIC_OUTLOOK_PASS,
      },
    });

    const mailOptions = {
      from: process.env.NEXT_PUBLIC_OUTLOOK_USER,
      to: process.env.NEXT_PUBLIC_RECEIVER_EMAIL,
      subject: `Contact Form Submission from ${name} (${email})`,
      text: message,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br>${message}</p>`,
    };

    console.log('Mail options:', mailOptions);

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: 'Mail sent successfully' }), { status: 200 });
  } catch (error) {
    // Agregar console.error para depuración
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: 'Error sending email' }), { status: 500 });
  }
}
