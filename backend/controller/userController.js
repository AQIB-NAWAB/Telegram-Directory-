const ErrorHander = require("../utilis/errorHander");
const catchAsyncError = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const Faq = require("../models/faq");
const Testimonial=require("../models/testimonialModel")

const sendToken = require("../utilis/jwtToken");
const sendEmail = require('../utilis/sendEmail');
const crypto = require("crypto");



// register a user

exports.registerUser = catchAsyncError(async (req, res, next) => {

  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
  });

  sendToken(user, 201, res);
});

// login user

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has entered email and pass both
  if (!email || !password) {
    return next(new ErrorHander("please enter email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHander("Invalid email. or password", 401));
  }

  const isPasswordMatched =await user.comparePassword(password);

  // console.log(isPasswordMatched);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password.", 401));
  }

  sendToken(user, 200, res);
});

// Logout User
exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "logged out",
  });
});

// Forgot password

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHander("User not Found", 404));
  }

  // Get ResetPassword Token From UserMOdel
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;
  // const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your Password reset token is TEMP :- \n\n ${resetPasswordUrl} \n\n If you have not requestedthis email then please ignore it`;

  try {
      await sendEmail({
        email: user.email,
        subject:`OneMoreStep password recovery`,
        message,
      });
      res.status(200).json({
          success: true,
          message: `Email sent to ${user.email} succesfully`,
      })
      
  } catch (error) {
      user.getResetPasswordToken = undefined;
      user.resetPasswordUrl = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorHander(error.message, 500))
  }
});


// Reset password

exports.resetPassword = catchAsyncError(async (req, res, next) => {
    // creating token hash
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user = await  User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if(!user){
      return next(new ErrorHander("Reset password token is invalid or has been expired", 400));
    }

    if(req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHander("Passowrd does not match confirm passowrd", 400));
    }

    user.password = req.body.password;
    user.getResetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);

});



// Get user detail

exports.getUserDetails = catchAsyncError(async (req,res,next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});


// UPDATE user detail

exports.updatePassowrd = catchAsyncError(async (req,res,next) => {

  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old password is incorrect", 400));
  }

  
  if(req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("Passowrd does not match confirm passowrd", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user,200,res);

  
});





// UPDATE user detail

exports.updateProfile = catchAsyncError(async (req,res,next) => {

  const newUserData={
    name:req.body.name,
    email: req.body.email
  }
// console.log(req.body);

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new:true,
    runValidators:true,
    useFindAmdModify:false,
  })

  
  res.status(200).json({
    success: true,
     user,
  });
});


// GET all users (--ADMIN)
exports.getAllUser = catchAsyncError (async (req,res,next)=>{
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
})



// GET single users (--ADMIN)
exports.getSingleUser = catchAsyncError (async (req,res,next)=>{
  const user = await User.findById(req.params.id);

  if(!user){
    return next(
      new ErrorHander (`User does not exist with id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });

})





// UPDATE profile (--ADMIN)

exports.updateProfile = catchAsyncError(async (req,res,next) => {

  const newUserData={
    name:req.body.name,
    email: req.body.email,
    role: req.body.role,
  }

  // we will add avator later


  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new:true,
    runValidators:true,
    useFindAmdModify:false,
  })

  
  res.status(200).json({
    success: true,
    user,
  });
});




// UPDATE user Role (--ADMIN)

exports.updateUserRole = catchAsyncError(async (req,res,next) => {

  const newUserData={
    name:req.body.name,
    email: req.body.email,
    role: req.body.role,
  }

  // we will add avator later


  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new:true,
    runValidators:true,
    useFindAmdModify:false,
  })

  
  res.status(200).json({
    success: true,
  });
});




// Delete User --Admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  const imageId = user.avatar.public_id;

  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});



// Create FAQ
exports.createFaq = catchAsyncError(async (req, res, next) => {
  const newFaqData = {
    question: req.body.question,
    answer: req.body.answer,
    // Add more fields if needed
  };

  const faq = await Faq.create(newFaqData);

  res.status(201).json({
    success: true,
    data: faq,
  });
});






// Delete FAQ
exports.deleteFaq = catchAsyncError(async (req, res, next) => {
  const faq = await Faq.findById(req.params.id);

  if (!faq) {
    return next(new ErrorHander(`FAQ does not exist with ID: ${req.params.id}`, 404));
  }

  await Faq.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "FAQ Deleted Successfully",
  });
});


// Get All FAQs
exports.getAllFaqs = catchAsyncError(async (req, res, next) => {
  const allFaqs = await Faq.find({});

  res.status(200).json({
    success: true,
    AllFaqs: allFaqs,
  });
}); 


// Get Single FAQ by ID
exports.getFaqById = catchAsyncError(async (req, res, next) => {
  const faq = await Faq.findById(req.params.id);

  if (!faq) {
    return next(new ErrorHandler(`FAQ does not exist with ID: ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: faq,
  });
});





// Create a new testimonial (Only for Admin)
exports.createTestimonial = catchAsyncError(async (req, res, next) => {
  const { authorName, message } = req.body;


  const testimonial = await Testimonial.create({ authorName, message });

  res.status(201).json({
    success: true,
    data: testimonial,
  });
});

// Get all testimonials
exports.getAllTestimonials = catchAsyncError(async (req, res, next) => {
  const allTestimonials = await Testimonial.find({});

  res.status(200).json({
    success: true,
    data: allTestimonials,
  });
});

// Get a single testimonial by ID
exports.getTestimonialById = catchAsyncError(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return next(new ErrorHander(`Testimonial not found with ID: ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: testimonial,
  });
});

// Delete a testimonial by ID (Only for Admin)
exports.deleteTestimonial = catchAsyncError(async (req, res, next) => {


  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return next(new ErrorHander(`Testimonial not found with ID: ${req.params.id}`, 404));
  }

  await Testimonial.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Testimonial Deleted Successfully",
  });
});