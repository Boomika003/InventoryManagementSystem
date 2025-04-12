const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");

const contactUs = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  if (!subject || !message) {
    res.status(400);
    throw new Error("Please add subject and message");
  }

  // Mail transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 1. Send to admin (you)
  const mailToAdmin = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New Contact Message: ${subject}`,
    text: `Message: ${message}\n\nFrom: ${user.name} <${user.email}>`,
    replyTo: user.email,
  };

  // 2. Auto-reply to user
  const replyToUser = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Re: ${subject}`,
    text: `Hi ${user.name},\n\nThanks for contacting us. We received your message and will get back to you shortly.\n\nYour message: "${message}"\n\n- Boomika's Team`,
  };

  try {
    await transporter.sendMail(mailToAdmin);
    await transporter.sendMail(replyToUser);
    res
      .status(200)
      .json({ success: true, message: "Message sent and user replied." });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

module.exports = {
  contactUs,
};
