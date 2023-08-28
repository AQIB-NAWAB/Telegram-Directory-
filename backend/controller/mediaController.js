const error = require("../middleware/error");
const Media = require("../models/MediaModel");
const ErrorHander = require("../utilis/errorHander");
const catchAsyncError = require("../middleware/catchAsyncErrors");
const ApiFeature = require("../utilis/apiFeatures");
const TelegramBot = require('node-telegram-bot-api');
const { checkOwnership } = require("../middleware/auth");
const sendEmail = require("../utilis/sendEmail");

exports.getInformationOfMedia = catchAsyncError(async (req, res, next) => {
  const botToken = process.env.BOT_TOKEN;
  const bot = new TelegramBot(botToken, { polling: false });
  const mediaName = req.body.mediaName;

  try {
    // Get information about the channel or group
    const chat = await bot.getChat(`@${mediaName}`);

    if (!chat.photo) {
      return next(new ErrorHander("Media  not found", 404));
    }

    const iconFileId = chat.photo.big_file_id;
    const fileInfo = await bot.getFile(iconFileId);
    const iconLink = `https://api.telegram.org/file/bot${botToken}/${fileInfo.file_path}`;

    const memberCount = await bot.getChatMemberCount(`@${mediaName}`);

    // Construct the Telegram channel link
    const telegramLink = `https://t.me/${chat.username}`;

    const information = {
      username: chat.username,
      title: chat.title,
      type: chat.type,
      media_image: iconLink,
      memberCount,
      telegramLink, // Add the Telegram channel link to the information object.
    };


    res.status(200).json({
      success: true,
      information,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHander("Media not found with this Id", 404));
  }
});

// Create a new media
exports.createMedia = catchAsyncError(async (req, res, next) => {
  const {
    media_image,
    media_name,
    short_description,
    tags,
    long_description,
    telegramLink,
    category,
    members,
  } = req.body;

  const media = await Media.create({
    media_image,
    media_name,
    short_description,
    tags,
    telegramLink,
    long_description,
    category,
    members,
    userId:req.user._id,
  });
try{
  await sendEmail({
    email: user.email,
    subject:`Media creation  `,
    message:"Your Media is created but it is in under review after review we will update the status of your media if it is not violating the our terms ",
  });
}catch(error){
  console.log(error)
}
  res.status(201).json({
    success: true,
    data: media,
    message:"Your media is under review now  "
  });
});

// Get all Approve  media
exports.getAllMedia = catchAsyncError(async (req, res, next) => {
  const allMedia = await Media.find({status:"approve"});

  res.status(200).json({
    success: true,
    medias: allMedia,
  });
});

//
// Get all Approve  media
exports.getAllUserMedia = catchAsyncError(async (req, res, next) => {
  const allMedia = await Media.find({userId:req.user._id});

  res.status(200).json({
    success: true,
    medias: allMedia,
  });
});


// Get all reject  media
exports.getAllRejectMedia = catchAsyncError(async (req, res, next) => {
  const allMedia = await Media.find({status:"reject"});

  res.status(200).json({
    success: true,
    medias: allMedia,
  });
});

// get all media that are in pending state means newly created 
// Get all media
exports.getAllPendingMedia = catchAsyncError(async (req, res, next) => {
  const allMedia = await Media.find({status:"pending"});

  res.status(200).json({
    success: true,
    medias: allMedia,
  });
});

// Get media by ID
exports.getMediaById = catchAsyncError(async (req, res, next) => {
  const media = await Media.findById(req.params.mediaId);

  if (!media) {
    return next(new ErrorHander(`Media not found with ID: ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: media,
  });
});

// Update media by ID (Only for Admin and Media Owner)
exports.updateMedia = catchAsyncError( async (req, res, next) => {

  const media=await Media.findByIdAndUpdate(req.params.mediaId,req.body)
  const user=await User.findById(media.userId)
  if(user.role=="admin"){
try{
  await sendEmail({
    email: user.email,
    subject:` Media status Update `,
    message:`Your media status has been updated to  ${req.body.status}` ,
  });
}catch(error){
  console.log(error)
}
  }
  res.json({success:true,media,message:"Media  updated succesfuly . "})
});

// Delete media by ID (Only for Admin and Media Owner)
exports.deleteMedia = catchAsyncError( async (req, res, next) => {
 await Media.findByIdAndDelete(req.params.mediaId);


  res.json({status:true})
});



// Create New Review or Update the review
exports.createMediaReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, mediaId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const media = await Media.findById(mediaId);

  const isReviewed = media.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    media.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    media.reviews.push(review);
    media.numOfReviews = media.reviews.length;
  }

  let avg = 0;

  media.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  media.ratings = avg / media.reviews.length;

  await media.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// get All reviews of a media 
exports.getAllReviewsOfMedia = catchAsyncError(async (req, res, next) => {
  const media = await Media.findById(req.params.id);

  if (!media) {
    return next(new ErrorHander("Media Not  not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: media.reviews,
  });
});

// Delete Review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const media = await Media.findById(req.params.mediaId);

  if (!media) {
    return next(new ErrorHander("Media not found", 404));
  }

  const reviews = media.reviews.filter(
    (rev) => rev._id.toString() !== req.params.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Media.findByIdAndUpdate(
    req.params.mediaId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
