const multer = require("multer");

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ success: 0, message: err.message });
  } else {
    next(err);
  }
};

module.exports = multerErrorHandler;