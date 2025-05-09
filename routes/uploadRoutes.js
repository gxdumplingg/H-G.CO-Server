const { Router } = require('express');
const { uploadImages } = require('../controllers/imagesController');

const routerImages = Router();

routerImages.post("/upload", uploadImages);
module.exports = routerImages;
