import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API);

export const sendEmail = async (to, subject, text, html) => {
  try {
    // Resend does not allow sending from generic domains like gmail.com.
    // We must use a verified domain or the Resend testing domain.
    const senderEmail = process.env.SENDER_EMAIL && !process.env.SENDER_EMAIL.includes('gmail.com')
      ? process.env.SENDER_EMAIL
      : 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: `"AnarchKey Support" <${senderEmail}>`,
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error(error.message);
    }

    console.log('Message sent:', data);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

