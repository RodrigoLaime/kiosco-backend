// const { google } = require('googleapis');
// const fs = require('fs');

// const auth = new google.auth.GoogleAuth({
//   keyFile: 'credenciales.json',
//   scopes: ['https://www.googleapis.com/auth/drive.file'],
// });

// const drive = google.drive({ version: 'v3', auth });

// const CARPETA_DRIVE_ID = process.env.CARPETA_DRIVE_ID; // Reemplaza con el ID de tu carpeta en Drive

// async function uploadImage(filePath, fileName) {
//     try {
//       console.log("📤 Subiendo imagen:", filePath);
  
//       const fileMetadata = {
//         name: fileName,
//         parents: [CARPETA_DRIVE_ID], // Asegúrate de que esta carpeta existe en tu Drive
//       };
  
//       const media = {
//         mimeType: 'image/jpeg',
//         body: fs.createReadStream(filePath),
//       };
  
//       const response = await drive.files.create({
//         resource: fileMetadata,
//         media: media,
//         fields: 'id',
//       });
  
//       console.log("✅ Imagen subida con ID:", response.data.id);
  
//       const fileId = response.data.id;
  
//       // 🔹 Hacer pública la imagen
//       await drive.permissions.create({
//         fileId: fileId,
//         requestBody: {
//           role: 'reader',
//           type: 'anyone',
//         },
//       });
  
//       console.log("🔓 Imagen ahora es pública");
  
//       // 🔹 Crear la URL pública
//       const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
//       console.log("🌐 URL pública generada:", imageUrl);
  
//       return imageUrl;
//     } catch (error) {
//       console.error("❌ Error al subir la imagen:", error);
//       throw new Error("Error al subir la imagen");
//     }
//   }
  
  
//   module.exports = { uploadImage };
const { google } = require('googleapis');
const fs = require('fs');

// Cargar las credenciales desde las variables de entorno
const auth = new google.auth.GoogleAuth({
  credentials: {
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Asegúrate de reemplazar saltos de línea
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],  // Acceso para subir archivos
});

const drive = google.drive({ version: 'v3', auth });

const CARPETA_DRIVE_ID = process.env.CARPETA_DRIVE_ID; // ID de la carpeta en Drive, también cargado desde .env

// Función para subir la imagen
async function uploadImage(filePath, fileName) {
  try {
    console.log("📤 Subiendo imagen:", filePath);

    const fileMetadata = {
      name: fileName,
      parents: [CARPETA_DRIVE_ID], // Asegúrate de que esta carpeta existe en tu Drive
    };

    const media = {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log("✅ Imagen subida con ID:", response.data.id);

    const fileId = response.data.id;

    // Hacer pública la imagen
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log("🔓 Imagen ahora es pública");

    // Crear la URL pública
    const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    console.log("🌐 URL pública generada:", imageUrl);

    return imageUrl;
  } catch (error) {
    console.error("❌ Error al subir la imagen:", error);
    throw new Error("Error al subir la imagen");
  }
}

module.exports = { uploadImage };
