// const cloudinary = require('./cloudinaryConfig.js');

// const uploadImage = async (fileBuffer) => {
//     try {
//         const result = await new Promise((resolve, reject) => {
//             cloudinary.uploader.upload_stream(
//                 { folder: "kiosco_productos" },
//                 (error, result) => {
//                     if (error) {
//                         console.error("Error al subir imagen a Cloudinary:", error);
//                         reject(error);  // En caso de error, rechazamos la promesa
//                     } else {
//                         resolve(result);  // Resolvemos con el objeto result
//                     }
//                 }
//             ).end(fileBuffer); // Subimos el archivo desde el buffer
//         });

//         return result.secure_url;  // Devolvemos directamente la URL
//     } catch (error) {
//         throw new Error("Error al subir la imagen: " + error.message);
//     }
// };

// module.exports = { uploadImage };
const cloudinary = require('./cloudinaryConfig.js');

const uploadImage = async (fileBuffer) => {
    try {
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { 
                    folder: "kiosco_productos",
                    resource_type: "auto"
                },
                (error, result) => {
                    if (error) {
                        console.error("Error al subir imagen a Cloudinary:", error);
                        reject(error);
                    } else {
                        resolve({
                            url: result.secure_url,
                            public_id: result.public_id
                        });
                    }
                }
            ).end(fileBuffer);
        });

        return result;
    } catch (error) {
        throw new Error("Error al subir la imagen: " + error.message);
    }
};

const updateImage = async (fileBuffer, oldPublicId) => {
    try {
        console.log('Iniciando actualización de imagen');
        console.log('Public ID recibido:', oldPublicId);

        const result = await new Promise((resolve, reject) => {
            console.log('Configurando upload stream con public_id:', oldPublicId);
            
            cloudinary.uploader.upload_stream(
                { 
                    public_id: oldPublicId,
                    overwrite: true,
                    resource_type: "auto"
                },
                (error, result) => {
                    if (error) {
                        console.error('Error en upload_stream:', error);
                        reject(error);
                    } else {
                        console.log('Imagen actualizada exitosamente:', result);
                        resolve({
                            url: result.secure_url,
                            public_id: result.public_id
                        });
                    }
                }
            ).end(fileBuffer);
        });

        return result;
    } catch (error) {
        console.error("Error completo:", error);
        throw new Error("Error al actualizar la imagen: " + error.message);
    }
};


module.exports = { uploadImage, updateImage };
