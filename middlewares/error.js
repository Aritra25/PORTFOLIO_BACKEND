class ErrorHandler extends Error {
  constructor(message,statusCode) {
    super(message);
    this.statusCode = statusCode;
    // this.message = message;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  if (err.statusCode === 11000) {
    // console.error(err.stack);
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Json Web Token is invalid. Try Again!!!";
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Json Web Token is expired. Try Again!!!";
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "CastError") {
    const message = `Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  const errorMessage = err.errors
    ? Object.values(err.errors).map((error) => error.message)
    : err.message;

  res.status(err.statusCode).json({
    message: errorMessage,
    success: false,
  });
};

export default ErrorHandler;
