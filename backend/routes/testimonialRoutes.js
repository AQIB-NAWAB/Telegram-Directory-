const express = require("express");
const router = express.Router();
const { isAuthebticatedUser, authorizeRoles } = require("../middleware/auth");
const { createTestimonial, getAllTestimonials, getTestimonialById, deleteTestimonial } = require("../controller/userController");

// Create a new testimonial (Only for Admin)
router.post("/admin/testimonials", isAuthebticatedUser, authorizeRoles("admin"), createTestimonial);

// Get all testimonials
router.get("/testimonials",  getAllTestimonials);

// Get a single testimonial by ID
router.get("/admin/testimonials/:id", isAuthebticatedUser, getTestimonialById);

// Delete a testimonial by ID (Only for Admin)
router.delete("/admin/testimonials/:id", isAuthebticatedUser, authorizeRoles("admin"), deleteTestimonial);

module.exports = router;
