const { uploadImage, updateImage } = require('../services/uploadService');

const upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se proporcionó ninguna imagen" });
    }

    const result = await uploadImage(req.file.buffer);
    res.json({
      imageUrl: result.url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error("Error en la subida de imagen:", error);
    res.status(500).json({ error: "Error al subir la imagen" });
  }
};

const updateImageController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se proporcionó ninguna imagen" });
    }

    const oldPublicId = req.params[0];
    console.log('Public ID recibido:', oldPublicId);

    const result = await updateImage(req.file.buffer, oldPublicId);

    res.json({
      imageUrl: result.url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error("Error al actualizar la imagen:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  upload,
  updateImageController
};
