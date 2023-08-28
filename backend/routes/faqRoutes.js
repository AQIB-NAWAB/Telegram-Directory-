const express = require("express");
const {

  createFaq,
  updateFaq,
  deleteFaq,
  getAllFaqs,
  getFaqById,

} = require("../controller/userController");

const { isAuthebticatedUser, authorizeRoles } = require("../middleware/auth");    
const router=express.Router()    
    // Create a new FAQ
    router.route("/admin/faqs").post(isAuthebticatedUser, authorizeRoles("admin"),createFaq);


    // Delete an existing FAQ by ID
    router.route("/admin/faqs/:id").delete(isAuthebticatedUser, authorizeRoles("admin"), deleteFaq);
    
    // Get all FAQs
    router.route("/faqs").get(isAuthebticatedUser, getAllFaqs);
    
    // Get a single FAQ by ID
    router.route("/admin/faqs/:id").get(isAuthebticatedUser,getFaqById);
    
    
    
    
    module.exports = router;