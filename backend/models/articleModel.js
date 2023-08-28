const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,required:true},
  title: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, default: 'pending' }, // Default status is "pending"
  createdAt: { type: Date, default: Date.now },
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
