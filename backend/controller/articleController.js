const Article = require('../models/articleModel');
const catchAsyncError = require('../middleware/catchAsyncErrors');
const ErrorHander = require('../utilis/errorHander');

// Create a new article
exports.createArticle = catchAsyncError(async (req, res) => {
  const { title, content } = req.body;

  const article = await Article.create({ title, content,userId:req.user._id });

  res.status(201).json({ success: true, article });
});

// Get all articles
exports.getAllArticles = catchAsyncError(async (req, res) => {
    const articles = await Article.find({ status: 'approve' })
    .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
    .exec();

  res.status(200).json({ success: true, articles });
});

//// Get all Pending
exports.getAllPendingArticles = catchAsyncError(async (req, res) => {
    const articles = await Article.find({status:"pending"});
  
    res.status(200).json({ success: true, articles });
  });

// Get all reject articles
exports.getAllRejectedArticles = catchAsyncError(async (req, res) => {
    const articles = await Article.find({status:"reject"});
  
    res.status(200).json({ success: true, articles });
  });


// Get all  user articles
exports.getAllUserArticles = catchAsyncError(async (req, res) => {
    const articles = await Article.find({userId:req.user._id});
  
    res.status(200).json({ success: true, articles });
  });

// Get an article by ID
exports.getArticleById = catchAsyncError(async (req, res) => {
  const { id } = req.params;

  const article = await Article.findById(id);

  if (!article) {
    return res.status(404).json({ success: false, message: 'Article not found' });
  }

  res.status(200).json({ success: true, article });
});

// Update an article by ID
exports.updateArticle = catchAsyncError(async (req, res,next) => {
  const  id  = req.params.id;
  
  const article = await Article.findById(id);

  if (!article) {
    return res.status(404).json({ success: false, message: 'Article not found' });
  }
   // Check if the user is the admin or the owner of the media
   if (req.user.role !== 'admin' && req.user._id.toString() !== article.userId.toString()) {
    return next(new ErrorHander('You are not authorized to perform this action', 403));
  }

  const updatedArticle=await Article.findByIdAndUpdate(id,req.body, { new: true });
  await   updatedArticle.save()
  res.json({ success: true, updatedArticle });
});

// Delete an article by ID
exports.deleteArticle = catchAsyncError(async (req, res,next) => {
  const { id } = req.params;

  const article = await Article.findById(id);

  if (!article) {
    return res.status(404).json({ success: false, message: 'Article not found' });
  }

    // Check if the user is the admin or the owner of the media
    if (req.user.role !== 'admin' && req.user._id.toString() !== article.userId.toString()) {
        return next(new ErrorHander('You are not authorized to perform this action', 403));
      }

  await article.remove();

  res.json({ success: true, message: 'Article deleted successfully' });
});
