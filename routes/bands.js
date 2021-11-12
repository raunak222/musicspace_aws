const express = require('express');
const router = express.Router();
const bands = require('../controllers/bands');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateband } = require('../middleware'); 
const multer = require('multer');           //multer is used to handle the uploading of multiple files.
const { storage } = require('../cloudinary');  //cloudinary is used for cloud storage.
const upload = multer({ storage });   

const band = require('../models/band');

router.route('/')
      .get(catchAsync(bands.index))
      .post(isLoggedIn, upload.array('image'), validateband, catchAsync(bands.createband));  

router.get('/new', isLoggedIn, bands.renderNewForm);

router.route('/:id')
      .get(catchAsync(bands.showband))
      .put(isLoggedIn, isAuthor, upload.array('image'), validateband, catchAsync(bands.updateband))
      .delete(isLoggedIn, isAuthor, catchAsync(bands.deleteband));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(bands.renderEditForm));


module.exports = router;