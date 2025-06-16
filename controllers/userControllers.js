import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler, { errorMiddleware } from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { request } from "express";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Please upload an image", 400));
  }
  const { resume, avatar } = req.files;

  const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
    avatar?.tempFilePath,
    {
      folder: "AVATARS",
    }
  );
  if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
    console.error(
      "cloudinary error:",
      cloudinaryResponseForAvatar.error || "unknown cloudinary error"
    );
  }

  const cloudinaryResponseForResume = await cloudinary.uploader.upload(
    resume?.tempFilePath,
    { folder: "PORTFOLIO RESUME" }
  );
  if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponseForResume.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload resume to Cloudinary", 500));
  }

  const {
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    facebookURL,
    twitterURL,
    linkedInURL,
  } = req.body;

  const user = await User.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    avatar: {
      public_id: cloudinaryResponseForAvatar.public_id,
      url: cloudinaryResponseForAvatar.secure_url,
    },
    resume: {
      public_id: cloudinaryResponseForAvatar.public_id,
      url: cloudinaryResponseForAvatar.secure_url,
    },
    portfolioURL,
    githubURL,
    linkedInURL,
    twitterURL,
    facebookURL,
    instagramURL,
  });
  generateToken(user, "User registered successfully", 201, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 404));
  }
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 404));
  }
  generateToken(user, "User logged in successfully", 200, res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  // console.log("logout")
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out!",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    portfolioURL: req.body.portfolioURL,
    githubURL: req.body.githubURL,
    linkedInURL: req.body.linkedInURL,
    twitterURL: req.body.twitterURL,
    facebookURL: req.body.facebookURL,
    instagramURL: req.body.instagramURL,
  };

  // Fix avatar upload check
  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user.id);
    const profileImageId = user.avatar.public_id;
    await cloudinary.uploader.destroy(profileImageId);
    const newProfileImage = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      {
        folder: "AVATARS",
      }
    );
    newUserData.avatar = {
      public_id: newProfileImage.public_id,
      url: newProfileImage.secure_url,
    };
  }

  // Fix resume upload check and request reference
  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    const user = await User.findById(req.user.id);
    const resumeId = user.resume.public_id;
    await cloudinary.uploader.destroy(resumeId);
    const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
      folder: "PORTFOLIO RESUME",
    });
    newUserData.resume = {
      public_id: newResume.public_id,
      url: newResume.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  
  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(currentPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Current Password is incorrect", 400));
  }
  if (newPassword !== confirmNewPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Password reset token is invalid or expired", 400)
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  await generateToken(user, "Reset Password Successfully", 200, res);
});

//FORGOT PASSWORD
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User Not Found!", 404));
  }
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;

  const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl}  \n\n If 
    You've not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Personal Portfolio Dashboard Password Recovery`,
      message,
    });
    res.status(201).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});
