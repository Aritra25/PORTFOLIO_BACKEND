import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Message } from "../models/messageSchema.js";
import { sendEmail } from "../utils/sendEmail.js";

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { senderName, subject, message } = req.body;
  if (!senderName || !subject || !message) {
    return next(new ErrorHandler("Please fill in all fields", 400));
  }
  const data = await Message.create({ senderName, subject, message });
  // console.log(process.env.RECEIVER_EMAIL)
  await sendEmail({
    email: process.env.RECEIVER_EMAIL,
    subject: `New Message from ${senderName}: ${subject}`,
    message: message,
  });
  res
    .status(201)
    .json({ success: true, data, message: "Message sent successfully" });
});

export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
  const messages = await Message.find({});
  res.status(200).json({ success: true, messages });
});

export const deleteMessages = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const message = await Message.findById(id);
  if (!message) {
    return next(new ErrorHandler("Message not found", 404));
  }
  await message.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Message deleted successfully" });
});
