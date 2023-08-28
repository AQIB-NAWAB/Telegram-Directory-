const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    channel_image: String,
    status:{type:String,default:"pending"},
    featured:{type:Boolean,default:false},
    media_name: { type: String, required: true },
    telegramLink:{type: String, required: true},
    short_description: { type: String, required: true },
    tags: { type: [String], maxlength: 5 },
    long_description: String,
    category: String,
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
ratings: {
  type: Number,
  default: 0,
},
    averageRating: Number,
    numOfReviews: {
      type: Number,
      default: 0,
    },
    memberCount: Number,
    created_time: { type: Date, default: Date.now },
    userId: mongoose.Schema.Types.ObjectId,
  });
module.exports = mongoose.model("Media", mediaSchema);