import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API);

export const sendEmail = async (to, subject, text, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `"AnarchKey Support" <${process.env.SENDER_EMAIL}>`,
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

