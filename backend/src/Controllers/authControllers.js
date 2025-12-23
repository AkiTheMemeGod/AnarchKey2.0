import User from "../Models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/mailer.js';
import { getVerificationEmailTemplate } from '../utils/emailTemplates.js';


export async function register_User(req, res) {
  try {
    const { username, email, password } = req.body

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });


    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = new User({
      username,
      email,
      passwordHash,
      otp,
      otpExpires,
      isVerified: false
    });

    await newUser.save();

    const subject = "Verify your email";
    const text = `Your verification code is ${otp}. It expires in 10 minutes.`;
    const html = getVerificationEmailTemplate(otp);

    try {
      await sendEmail(email, subject, text, html);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // We still register the user, but they might need to resend OTP.
      // Alternatively, we could fail registration. For now, let's proceed.
    }

    // Generate token so they can verify
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ "message": "User Registered. Please verify your email.", token, User: newUser });
  } catch (error) {
    console.error("Error Registering User", error);
    res.status(500).json({ "message": "Server error" });
  }
}

export async function login_User(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );


    res.json({ token });
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function sendOtp(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const subject = "Your Verification Code";
    const text = `Your verification code is ${otp}. It expires in 10 minutes.`;
    const html = getVerificationEmailTemplate(otp);

    await sendEmail(user.email, subject, text, html);

    res.json({ msg: "OTP sent to email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { otp } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ msg: "No OTP request found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    res.json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ msg: "Server error" });
  }
}