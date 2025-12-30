import { RelayMail } from 'relaymail';
import dotenv from 'dotenv';

dotenv.config();

const relay = new RelayMail({apiKey: process.env.RELAY_API});

export const sendEmail = async (to, subject, body, html) => {
  try {
    const senderEmail = process.env.SENDER_EMAIL

    const { data, error } = await relay.send({
      to: to,
      subject: subject,
      body: body,
      html: html,
    });

    if (error) {
      console.error("Relay API Error:", error);
      throw new Error(error.message);
    }

    console.log('Message sent:', data);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

