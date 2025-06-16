import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  senderName: {
    type: String,
    minLength: [2, "Name must contain at least two characters"],
  },
  subject: {
    type: String,
    minLength: [2, "subject must contain at least two characters"],
  },
  message: {
    type: String,
    minLength: [2, "message must contain at least two characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Message = mongoose.model("Message", messageSchema);
