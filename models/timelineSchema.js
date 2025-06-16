import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "title required"],
  },
  description: {
    type: String,
    required: [true, "description required"],
  },
  timeline: {
    from: {
      type: Date,
    },
    to: {
      type: Date,
    },
  },
});

export const TImeline = mongoose.model("Timeline", timelineSchema);