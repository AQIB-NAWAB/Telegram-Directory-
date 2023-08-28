const express=require("express")
const router=express.Router()

const { isAuthebticatedUser,checkOwnership,authorizeRoles } = require("../middleware/auth");   
const { getInformationOfMedia, createMedia, getAllMedia, getMediaById, updateMedia, deleteMedia, getAllPendingMedia, getAllRejectMedia, createMediaReview, getAllReviewsOfMedia, deleteReview, getAllUserMedia } = require("../controller/mediaController");


router.route("/media/information").get(isAuthebticatedUser,getInformationOfMedia)


// Create a new media
router.route('/media').post(isAuthebticatedUser, createMedia);

// Get all media Approve media
router.route('/medias').get(getAllMedia);


// Get all users media media
router.route('/medias/user').get(isAuthebticatedUser, getAllUserMedia);
// Get all media in pending state
router.route("/medias/pending").get(isAuthebticatedUser, authorizeRoles("admin"),getAllPendingMedia)
// Get all media in reject state
router.route("/medias/reject").get(isAuthebticatedUser, authorizeRoles("admin"),getAllRejectMedia)
// Get media by ID
router.route('/media/:mediaId').get (getMediaById);

// Update media by ID (Only for Admin and Media Owner)
router.route('/media/:mediaId').put(isAuthebticatedUser, checkOwnership, updateMedia);

// Delete media by ID (Only for Admin and Media Owner)
router.route('/media/:mediaId').delete(isAuthebticatedUser,checkOwnership, deleteMedia);
// Rate the media
router.route("/media/user/review").put(isAuthebticatedUser, createMediaReview);
// Get all reviewa of the media
router.route("/media/review/:id").get(isAuthebticatedUser, getAllReviewsOfMedia);

// Delete  the Reviews By Admin
router.route("/media/admin/media/:mediaId/review/:id").delete(isAuthebticatedUser,authorizeRoles("admin"), deleteReview);
module.exports = router;
