const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upload, updateImageController } = require('../controllers/uploadController');

const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage });

router.post('/', uploadMiddleware.single('image'), upload);
router.put('/*', uploadMiddleware.single('image'), updateImageController);

module.exports = router;
