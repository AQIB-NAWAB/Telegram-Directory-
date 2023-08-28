const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Media = require("../models/MediaModel");

const ErrorHander = require("../utilis/errorHander");

exports.isAuthebticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  // console.log(token);

  if (!token) {
    return next(new ErrorHander("please login to access this recsource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData.id);

  next();
});



// Authorize Roles --admin

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHander(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }

    next();
  };
};


// checkOwner Ship
exports.checkOwnership = async (req, res, next) => {
  const { mediaId } = req.params;

  try {
    const media = await Media.findById(mediaId);

    if (!media) {
      return next(new ErrorHander(`Media not found with ID: ${mediaId}`, 404));
    }

    // Check if the user is the admin or the owner of the media
    if (req.user.role !== 'admin' && req.user._id.toString() !== media.userId.toString()) {
      return next(new ErrorHander('You are not authorized to perform this action', 403));
    }

    next();
  } catch (error) {
    return next(new ErrorHander('Something went wrong while checking ownership', 500));
  }
};