import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { TImeline } from "../models/timelineSchema.js";

export const postTimeline = catchAsyncErrors(async (req, res, next) => {
  const { title, description, from, to } = req.body;
  const newTimeline = await TImeline.create({
    title,
    description,
    timeline: {
      from,
      to,
    },
  });
  res.status(200).json({
    status: "success",
    message: "Timeline created successfully",
    newTimeline,
  });
});

export const getAllTimelines = catchAsyncErrors(async (req, res, next) => {
  const timelines = await TImeline.find({});
  res.status(200).json({
    status: "success",
    message: "All Timelines",
    timelines,
  });
});

export const deleteTimeline = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let timeline = await TImeline.findById(id);
  if (!timeline) {
    return next(new ErrorHandler("Timeline not found", 404));
  }
  await timeline.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Timeline deleted successfully",
  });
});
