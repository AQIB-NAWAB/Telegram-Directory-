const express = require('express');
const articleController = require('../controller/articleController');
const { isAuthebticatedUser, checkOwnership, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create a new article
router.post('/article',isAuthebticatedUser, articleController.createArticle);

// Get all approve articles
router.get('/article',isAuthebticatedUser, articleController.getAllArticles);

// Get all articles of user 
router.get('/article/user',isAuthebticatedUser, articleController.getAllUserArticles);

// Get an pending article by ID
router.get('/article/pending',isAuthebticatedUser, authorizeRoles("admin"), articleController.getAllPendingArticles);

//// Get an reject article by ID
router.get('/article/reject',isAuthebticatedUser,authorizeRoles("admin"), articleController.getAllRejectedArticles);


// Get an article by ID

router.get('/article/:id', articleController.getArticleById);

// Update an article by ID
router.put('/article/:id', isAuthebticatedUser,articleController.updateArticle);

// Delete an article by ID
router.delete('/article/:id',isAuthebticatedUser, articleController.deleteArticle);

module.exports = router;
