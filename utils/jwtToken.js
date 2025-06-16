export const generateToken = async(user, message, statusCode, res) => {
  const token = await user.generateJsonWebToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/'
  };

//   console.log("generating", token)

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      token,
      message,
      user,
    });
};
