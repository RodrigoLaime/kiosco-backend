require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
// const { uploadImage } = require('./driveService');///comentado por que el servicio no me deja ver imagenes publica
const { uploadImage, updateImage } = require('./uploadService.js');

const app = express();
const multer = require('multer');
const storage = multer.memoryStorage(); // Almacenamiento en memoria
// const upload = multer({ dest: 'uploads/' }); // Carpeta temporal
const upload = multer({ storage }); // Usar almacenamiento en memoria

const allowedOrigins = [
  'http://localhost:5173',
  'https://kiosco-frontend.vercel.app'
];
app.use(cors({
  origin: allowedOrigins, // Permitir solo solicitudes desde esta URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Encabezados permitidos
}));
app.use(express.json());

const sheets = google.sheets({
  version: "v4", auth: new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
});

const SHEET_ID = process.env.GOOGLE_SHEETS_ID;

/* LISTAR */
app.get('/api/productos', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A2:M", // Ajusta según el rango de tus datos
    });

    const rows = response.data.values;
    if (!rows) return res.status(404).json({ error: "No se encontraron productos" });

    const productos = rows.map(row => ({
      id: row[0] || '',
      nombre: row[1] || '',
      categoria: row[2] || '',
      descripcion: row[3] || '',
      tipo_de_producto: row[4] || '',
      precio_unitario: row[5] || '',
      stock_disponible: row[6] || '',
      fecha_creacion: row[7] || '',
      fecha_actualizacion: row[8] || '',
      fecha_vencimiento: row[9] || '',
      oferta_mayorista: row[10] || '',
      proveedor: row[11] || '',
      imagen_url: row[12] || '',
    }));

    res.json(productos);
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});
// /* VER */
// app.get('/api/productos/:id', async (req, res) => {
//   try {
//     const { id } = req.params; // Obtener el id del producto desde los parámetros de la URL
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SHEET_ID,
//       range: "A2:K", // Ajusta según el rango de tus datos
//     });

//     const rows = response.data.values;
//     if (!rows) return res.status(404).json({ error: "No se encontraron productos" });

//     // Buscar el producto con el id correspondiente
//     const producto = rows.find(row => row[0] === id); // Asumiendo que el ID está en la primera columna (A)

//     if (!producto) {
//       return res.status(404).json({ error: "Producto no encontrado" });
//     }

//     // Mapeo del producto encontrado
//     const productoDetails = {
//       id: producto[0],  // ID
//       nombre: producto[1],  // Nombre del Producto
//       categoria: producto[2],  // Categoría
//       precioUnitario: parseFloat(producto[3]),  // Precio Unitario
//       cantidadStock: parseInt(producto[4]),  // Cantidad en Stock
//       fechaIngreso: producto[5],  // Fecha de Ingreso
//       tipoProducto: producto[6],  // Tipo de Producto
//       ofertaMayorista: producto[7] === "Sí",  // Oferta Mayorista (booleano)
//       precioMayorista: producto[8] === "-" ? null : parseFloat(producto[8]),  // Precio Mayorista
//       proveedor: producto[9],  // Proveedor
//       codigoBarra: producto[10],  // Código de Barra
//     };

//     res.json(productoDetails);
//   } catch (error) {
//     console.error("Error al obtener el producto:", error);
//     res.status(500).json({ error: "Error al obtener el producto" });
//   }
// });
/* VER UN PRODUCTO */
app.get('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A2:M",
    });

    const rows = response.data.values;
    if (!rows) return res.status(404).json({ error: "No se encontraron productos" });

    const producto = rows.find(row => row[0] === id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const productoDetails = {
      id: producto[0] || '',
      nombre: producto[1] || '',
      categoria: producto[2] || '',
      descripcion: producto[3] || '',
      tipo_de_producto: producto[4] || '',
      precio_unitario: producto[5] || '',
      stock_disponible: producto[6] || '',
      fecha_creacion: producto[7] || '',
      fecha_actualizacion: producto[8] || '',
      fecha_vencimiento: producto[9] || '',
      oferta_mayorista: producto[10] || '',
      proveedor: producto[11] || '',
      imagen_url: producto[12] || '',
    };

    res.json(productoDetails);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

// /* CREAR */
// app.post('/api/productos', async (req, res) => {
//   try {
//     const { nombre, categoria, precio, cantidadStock, fechaIngreso, tipoProducto, ofertaMayorista, precioMayorista, proveedor, codigoBarra } = req.body;

//     // Verificar si faltan campos esenciales
//     if (!nombre || !categoria || !precio || !cantidadStock || !fechaIngreso || !tipoProducto) {
//       return res.status(400).json({ error: "Faltan campos requeridos" });
//     }

//     // Obtener los datos de la hoja para calcular el siguiente ID
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SHEET_ID,
//       range: 'A2:A', // Solo obtenemos la columna de IDs para verificar el último
//     });

//     const rows = response.data.values;
//     let lastId = 0;

//     // Si hay datos, buscamos el último ID
//     if (rows && rows.length > 0) {
//       lastId = Math.max(...rows.map(row => parseInt(row[0], 10)));
//     }

//     // Generar el siguiente ID
//     const newId = lastId + 1;

//     // Ahora, insertamos el nuevo producto con el ID generado
//     const newProduct = [
//       [newId, nombre, categoria, precio, cantidadStock, fechaIngreso, tipoProducto, ofertaMayorista ? 'Sí' : 'No', precioMayorista, proveedor, codigoBarra]
//     ];

//     await sheets.spreadsheets.values.append({
//       spreadsheetId: SHEET_ID,
//       range: 'A2:K', // Ajusta el rango a las columnas que tienes en la hoja
//       valueInputOption: 'RAW',
//       resource: {
//         values: newProduct,
//       },
//     });

//     res.status(201).json({ message: "Producto creado correctamente", id: newId });
//   } catch (error) {
//     console.error("Error al guardar el producto:", error);
//     res.status(500).json({ error: "Error al guardar el producto" });
//   }
// });
/* VER UN PRODUCTO */
app.get('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A2:M",
    });

    const rows = response.data.values;
    if (!rows) return res.status(404).json({ error: "No se encontraron productos" });

    const producto = rows.find(row => row[0] === id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const productoDetails = {
      id: producto[0] || '',
      nombre: producto[1] || '',
      categoria: producto[2] || '',
      descripcion: producto[3] || '',
      tipo_de_producto: producto[4] || '',
      precio_unitario: producto[5] || '',
      stock_disponible: producto[6] || '',
      fecha_creacion: producto[7] || '',
      fecha_actualizacion: producto[8] || '',
      fecha_vencimiento: producto[9] || '',
      oferta_mayorista: producto[10] || '',
      proveedor: producto[11] || '',
      imagen_url: producto[12] || '',
    };

    res.json(productoDetails);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

/* CREAR PRODUCTO */
app.post('/api/productos', async (req, res) => {
  try {
    const {
      nombre,
      categoria,
      descripcion,
      tipo_de_producto,
      precio_unitario,
      stock_disponible,
      fecha_vencimiento,
      oferta_mayorista,
      proveedor
    } = req.body;

    // Verificar campos requeridos
    if (!nombre || !categoria || !precio_unitario || !stock_disponible) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Obtener último ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A2:A',
    });

    const rows = response.data.values;
    let lastId = 0;
    if (rows && rows.length > 0) {
      lastId = Math.max(...rows.map(row => parseInt(row[0], 10)));
    }
    const newId = lastId + 1;

    // Fecha actual para creación y actualización
    const currentDate = new Date().toISOString().split('T')[0];

    // URL de imagen fake para pruebas
    const fakeImageUrl = 'https://via.placeholder.com/150';

    const newProduct = [
      [
        newId,
        nombre,
        categoria,
        descripcion || '',
        tipo_de_producto || '',
        precio_unitario,
        stock_disponible,
        currentDate, // fecha_creacion
        currentDate, // fecha_actualizacion
        fecha_vencimiento || '',
        oferta_mayorista || 'No',
        proveedor || '',
        fakeImageUrl // imagen_url fake
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'A2:M',
      valueInputOption: 'RAW',
      resource: { values: newProduct },
    });

    res.status(201).json({ message: "Producto creado correctamente", id: newId });
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    res.status(500).json({ error: "Error al guardar el producto" });
  }
});


// /* EDITAR */
// app.put('/api/productos/:id', async (req, res) => {
//   try {
//     const productId = parseInt(req.params.id, 10);
//     const { nombre, categoria, precioUnitario, cantidadStock, fechaIngreso, tipoProducto, ofertaMayorista, precioMayorista, proveedor, codigoBarra } = req.body;

//     // Obtener todos los datos para encontrar la fila con el ID dado
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SHEET_ID,
//       range: 'A2:K', // Asegura obtener todas las columnas
//     });

//     let rows = response.data.values;
//     if (!rows || rows.length === 0) {
//       return res.status(404).json({ error: "No hay productos en la hoja" });
//     }

//     // Buscar la fila donde está el producto con el ID
//     let rowIndex = rows.findIndex(row => parseInt(row[0], 10) === productId);
//     if (rowIndex === -1) {
//       return res.status(404).json({ error: "Producto no encontrado" });
//     }

//     // Convertir el índice basado en A1 (Google Sheets empieza desde 1, y hay encabezados)
//     let googleSheetRow = rowIndex + 2; // +2 porque la primera fila es el encabezado y Google Sheets empieza en 1

//     // Crear un array con los valores actuales
//     let updatedProduct = [...rows[rowIndex]];

//     // Solo actualizar los campos enviados en el body (para evitar sobrescribir con undefined)
//     if (nombre !== undefined) updatedProduct[1] = nombre;
//     if (categoria !== undefined) updatedProduct[2] = categoria;

//     // Convertir los valores numéricos a strings antes de enviar a Google Sheets
//     if (precioUnitario !== undefined) updatedProduct[3] = String(precioUnitario); // Convertir precio a string
//     if (cantidadStock !== undefined) updatedProduct[4] = String(cantidadStock); // Convertir cantidadStock a string
//     if (fechaIngreso !== undefined) updatedProduct[5] = fechaIngreso;
//     if (tipoProducto !== undefined) updatedProduct[6] = tipoProducto;
//     if (ofertaMayorista !== undefined) updatedProduct[7] = ofertaMayorista ? 'Sí' : 'No';
//     if (precioMayorista !== undefined) updatedProduct[8] = precioMayorista !== null ? String(precioMayorista) : ''; // Asegurarse de que precioMayorista es un string o vacío
//     if (proveedor !== undefined) updatedProduct[9] = proveedor;
//     if (codigoBarra !== undefined) updatedProduct[10] = codigoBarra;

//     // Actualizar la fila en la hoja
//     await sheets.spreadsheets.values.update({
//       spreadsheetId: SHEET_ID,
//       range: `A${googleSheetRow}:K${googleSheetRow}`, // Selecciona la fila correcta
//       valueInputOption: 'RAW',
//       resource: {
//         values: [updatedProduct], // Pasa el array con los valores actualizados
//       },
//     });

//     res.json({ message: "Producto actualizado correctamente" });
//   } catch (error) {
//     console.error("Error al actualizar el producto:", error);
//     res.status(500).json({ error: "Error al actualizar el producto" });
//   }
// });
/* VER UN PRODUCTO */
app.get('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A2:M",
    });

    const rows = response.data.values;
    if (!rows) return res.status(404).json({ error: "No se encontraron productos" });

    const producto = rows.find(row => row[0] === id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const productoDetails = {
      id: producto[0] || '',
      nombre: producto[1] || '',
      categoria: producto[2] || '',
      descripcion: producto[3] || '',
      tipo_de_producto: producto[4] || '',
      precio_unitario: producto[5] || '',
      stock_disponible: producto[6] || '',
      fecha_creacion: producto[7] || '',
      fecha_actualizacion: producto[8] || '',
      fecha_vencimiento: producto[9] || '',
      oferta_mayorista: producto[10] || '',
      proveedor: producto[11] || '',
      imagen_url: producto[12] || '',
    };

    res.json(productoDetails);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

/* CREAR PRODUCTO */
app.post('/api/productos', async (req, res) => {
  try {
    const {
      nombre,
      categoria,
      descripcion,
      tipo_de_producto,
      precio_unitario,
      stock_disponible,
      fecha_vencimiento,
      oferta_mayorista,
      proveedor,
      imagen_url
    } = req.body;

    // Verificar campos requeridos
    if (!nombre || !categoria || !precio_unitario || !stock_disponible) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Obtener último ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A2:A',
    });

    const rows = response.data.values;
    let lastId = 0;
    if (rows && rows.length > 0) {
      lastId = Math.max(...rows.map(row => parseInt(row[0], 10)));
    }
    const newId = lastId + 1;

    // Fecha actual para creación y actualización
    const currentDate = new Date().toLocaleDateString('es-AR'); // Formato dd/mm/yyyy

    const newProduct = [
      [
        String(newId),
        nombre,
        categoria,
        descripcion || '',
        tipo_de_producto || '',
        String(precio_unitario),
        String(stock_disponible),
        currentDate, // fecha_creacion
        '', // fecha_actualizacion (inicialmente vacía)
        fecha_vencimiento || '',
        oferta_mayorista || '-',
        proveedor || '',
        imagen_url || 'https://via.placeholder.com/150' // URL de imagen por defecto
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'A2:M',
      valueInputOption: 'RAW',
      resource: { values: newProduct },
    });

    res.status(201).json({
      message: "Producto creado correctamente",
      id: newId,
      producto: {
        id: newId,
        ...req.body,
        fecha_creacion: currentDate,
        fecha_actualizacion: '',
        imagen_url: imagen_url || 'https://via.placeholder.com/150'
      }
    });
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    res.status(500).json({ error: "Error al guardar el producto" });
  }
});

/* VER UN PRODUCTO */
app.get('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A2:M",
    });

    const rows = response.data.values;
    if (!rows) return res.status(404).json({ error: "No se encontraron productos" });

    const producto = rows.find(row => row[0] === id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const productoDetails = {
      id: producto[0] || '',
      nombre: producto[1] || '',
      categoria: producto[2] || '',
      descripcion: producto[3] || '',
      tipo_de_producto: producto[4] || '',
      precio_unitario: producto[5] || '',
      stock_disponible: producto[6] || '',
      fecha_creacion: producto[7] || '',
      fecha_actualizacion: producto[8] || '',
      fecha_vencimiento: producto[9] || '',
      oferta_mayorista: producto[10] || '',
      proveedor: producto[11] || '',
      imagen_url: producto[12] || ''
    };

    res.json(productoDetails);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

/* CREAR PRODUCTO */
app.post('/api/productos', async (req, res) => {
  try {
    const {
      nombre,
      categoria,
      descripcion,
      tipo_de_producto,
      precio_unitario,
      stock_disponible,
      fecha_vencimiento,
      oferta_mayorista,
      proveedor,
      imagen_url
    } = req.body;

    // Verificar campos requeridos
    if (!nombre || !categoria || !precio_unitario || !stock_disponible) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Obtener último ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A2:A',
    });

    const rows = response.data.values;
    let lastId = 0;
    if (rows && rows.length > 0) {
      lastId = Math.max(...rows.map(row => parseInt(row[0], 10)));
    }
    const newId = lastId + 1;

    // Fecha actual para creación y actualización
    const currentDate = new Date().toLocaleDateString('es-AR'); // Formato dd/mm/yyyy

    const newProduct = [
      [
        String(newId),
        nombre,
        categoria,
        descripcion || '',
        tipo_de_producto || '',
        String(precio_unitario),
        String(stock_disponible),
        currentDate, // fecha_creacion
        '', // fecha_actualizacion (inicialmente vacía)
        fecha_vencimiento || '',
        oferta_mayorista || '-',
        proveedor || '',
        imagen_url || 'https://via.placeholder.com/150' // URL de imagen por defecto
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'A2:M',
      valueInputOption: 'RAW',
      resource: { values: newProduct },
    });

    res.status(201).json({
      message: "Producto creado correctamente",
      id: newId,
      producto: {
        id: newId,
        ...req.body,
        fecha_creacion: currentDate,
        fecha_actualizacion: '',
        imagen_url: imagen_url || 'https://via.placeholder.com/150'
      }
    });
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    res.status(500).json({ error: "Error al guardar el producto" });
  }
});

/* ACTUALIZAR PRODUCTO */
app.put('/api/productos/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      nombre,
      categoria,
      descripcion,
      tipo_de_producto,
      precio_unitario,
      stock_disponible,
      fecha_vencimiento,
      oferta_mayorista,
      proveedor,
      imagen_url
    } = req.body;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A2:M',
    });

    let rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No hay productos en la hoja" });
    }

    let rowIndex = rows.findIndex(row => row[0] === productId);
    if (rowIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    let googleSheetRow = rowIndex + 2;
    let updatedProduct = [...rows[rowIndex]];

    // Actualizar solo los campos proporcionados
    if (nombre !== undefined) updatedProduct[1] = nombre;
    if (categoria !== undefined) updatedProduct[2] = categoria;
    if (descripcion !== undefined) updatedProduct[3] = descripcion;
    if (tipo_de_producto !== undefined) updatedProduct[4] = tipo_de_producto;
    if (precio_unitario !== undefined) updatedProduct[5] = String(precio_unitario);
    if (stock_disponible !== undefined) updatedProduct[6] = String(stock_disponible);
    // La fecha de creación (índice 7) no se modifica
    updatedProduct[8] = new Date().toLocaleDateString('es-AR'); // Actualizar fecha_actualizacion
    if (fecha_vencimiento !== undefined) updatedProduct[9] = fecha_vencimiento;
    if (oferta_mayorista !== undefined) updatedProduct[10] = oferta_mayorista;
    if (proveedor !== undefined) updatedProduct[11] = proveedor;
    if (imagen_url !== undefined) updatedProduct[12] = imagen_url;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `A${googleSheetRow}:M${googleSheetRow}`,
      valueInputOption: 'RAW',
      resource: {
        values: [updatedProduct],
      },
    });

    res.json({
      message: "Producto actualizado correctamente",
      producto: {
        id: productId,
        nombre: updatedProduct[1],
        categoria: updatedProduct[2],
        descripcion: updatedProduct[3],
        tipo_de_producto: updatedProduct[4],
        precio_unitario: updatedProduct[5],
        stock_disponible: updatedProduct[6],
        fecha_creacion: updatedProduct[7],
        fecha_actualizacion: updatedProduct[8],
        fecha_vencimiento: updatedProduct[9],
        oferta_mayorista: updatedProduct[10],
        proveedor: updatedProduct[11],
        imagen_url: updatedProduct[12]
      }
    });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

/* drive service */ //no eliminar es para futuros test con drive e imagenes
// app.post('/upload', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No se proporcionó ninguna imagen" });
//     }

//     // Enviar buffer y nombre del archivo a la función uploadImage
//     const imageUrl = await uploadImage(req.file.buffer, req.file.originalname);

//     res.json({ success: true, imageUrl });
//   } catch (error) {
//     console.error("Error al subir la imagen:", error);
//     res.status(500).json({ error: "Error al subir la imagen" });
//   }
// });

// cloudinary service 
app.post('/api/upload', upload.single('image'), async (req, res) => {
  console.log('req.file--------------------------:', req.file);
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
});

// Nueva ruta para actualizar imagen
app.put('/api/upload/*', upload.single('image'), async (req, res) => {
  console.log('req.file--------------------------:', req.file);
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se proporcionó ninguna imagen" });
    }

    // Obtener el public_id completo
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
});

// app.post('/api/upload', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No se proporcionó ninguna imagen" });
//     }

//     const imageUrl = await uploadImage(req.file.buffer); // Subir imagen a Cloudinary
//     res.json({ imageUrl }); // Retorna la URL de la imagen subida
//   } catch (error) {
//     console.error("Error en la subida de imagen:", error);
//     res.status(500).json({ error: "Error al subir la imagen" });
//   }
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
