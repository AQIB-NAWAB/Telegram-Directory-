const express = require('express');
const app = express();
const errorMiddleware = require('../backend/middleware/error')
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path")


//config// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "config/config.env" });
}

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

//Route imports

// const media = require('./routes/mediaRoute');
const user = require('./routes/userRoutes');
const faqs = require('./routes/faqRoutes');
const testimonial = require('./routes/testimonialRoutes');
const media = require('./routes/mediaRoutes');
const article = require('./routes/articleRoutes');



// app.use('/api/v1',product);
app.use('/api/v1',user);
app.use("/api/v1",faqs)
app.use("/api/v1",testimonial)
app.use("/api/v1",media)
app.use("/api/v1",article)





// app.use(express.static(path.join(__dirname, "../frontend/build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
// });

// middlewarre for errors
app.use(errorMiddleware);

module.exports = app;
// 01:08:47
