const { google } = require('googleapis');
const stream = require('stream');

const auth = new google.auth.GoogleAuth({
  credentials: {
    // client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
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
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: 'v3', auth });

async function uploadImage(fileBuffer, fileName) {
  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'image/jpeg', // Ajusta según el tipo de imagen
        parents: [process.env.CARPETA_DRIVE_ID], // Carpeta destino en Google Drive
      },
      media: {
        mimeType: 'image/jpeg',
        body: bufferStream,
      },
    });

    return `https://drive.google.com/uc?id=${response.data.id}`; // URL pública de la imagen
  } catch (error) {
    console.error("Error subiendo la imagen a Google Drive:", error);
    throw new Error("No se pudo subir la imagen");
  }
}

module.exports = { uploadImage };
