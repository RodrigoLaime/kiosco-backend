const cloudinary = require('./cloudinaryConfig.js');

const uploadImage = async (fileBuffer) => {
    try {
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: "kiosco_productos" },
                (error, result) => {
                    if (error) {
                        console.error("Error al subir imagen a Cloudinary:", error);
                        reject(error);  // En caso de error, rechazamos la promesa
                    } else {
                        resolve(result);  // Resolvemos con el objeto result
                    }
                }
            ).end(fileBuffer); // Subimos el archivo desde el buffer
        });

        return result.secure_url;  // Devolvemos directamente la URL
    } catch (error) {
        throw new Error("Error al subir la imagen: " + error.message);
    }
};

module.exports = { uploadImage };
