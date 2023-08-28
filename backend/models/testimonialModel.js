const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Testimonial", testimonialSchema);
