const cloudinary = require('../config/cloudinary');

const uploadImage = async (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'kiosco_productos' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

const updateImage = async (buffer, oldPublicId) => {
  try {
    await cloudinary.uploader.destroy(oldPublicId);
    return await uploadImage(buffer);
  } catch (error) {
    throw new Error(`Error al actualizar imagen: ${error.message}`);
  }
};

module.exports = { uploadImage, updateImage };
