require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
app.use(cors());
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

app.get('/api/productos', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A:K", // Ajusta según el rango de tus datos
    });

    const rows = response.data.values;
    if (!rows) return res.status(404).json({ error: "No se encontraron productos" });
    console.log(rows);
    const productos = rows.map(row => ({
      // id: row[0],
      // nombre: row[1],
      // precio: parseFloat(row[2]),
      // tipo: row[3],
      // stock: parseInt(row[4]),
      // ofertaMayorista: row[5] === "true",
      // fecha: row[6],
      id: row[0],  // ID
      nombre: row[1],  // Nombre del Producto
      categoria: row[2],  // Categoría
      precioUnitario: parseFloat(row[3]),  // Precio Unitario
      cantidadStock: parseInt(row[4]),  // Cantidad en Stock
      fechaIngreso: row[5],  // Fecha de Ingreso
      tipoProducto: row[6],  // Tipo de Producto
      ofertaMayorista: row[7] === "Sí",  // Oferta Mayorista (booleano)
      precioMayorista: row[8] === "-" ? null : parseFloat(row[8]),  // Precio Mayorista (si no está, es null)
      proveedor: row[9],  // Proveedor
      codigoBarra: row[10],  // Código de Barra
    }));

    res.json(productos);
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// app.post('/api/productos', async (req, res) => {
//   const { nombre, categoria, precioUnitario, cantidadStock, fechaIngreso, tipoProducto, ofertaMayorista, precioMayorista, proveedor, codigoBarra } = req.body;
//   console.log(req.body);
//   try {
//     const newProduct = [
//       [
//         nombre, categoria, precioUnitario, cantidadStock, fechaIngreso, tipoProducto, ofertaMayorista ? "Sí" : "No", precioMayorista || "-", proveedor, codigoBarra
//       ]
//     ];

//     console.log("---------------------- - - - -", newProduct);
    
//     const response = await sheets.spreadsheets.values.append({
//       spreadsheetId: SHEET_ID,
//       range: "A2:K",  // Se especifica el rango donde se agregará la fila
//       valueInputOption: "RAW",  // Se usa RAW para insertar los valores tal cual
//       requestBody: {
//         values: newProduct,
//       },
//     });

//     console.log(response.data);
    
//     res.status(201).json({ message: "Producto creado correctamente", product: newProduct });
//   } catch (error) {
//     console.error("Error al crear el producto:", error);
//     res.status(500).json({ error: "Error al crear el producto" });
//   }
// });
app.post('/api/productos', async (req, res) => {
  try {
    const { nombre, categoria, precio, cantidadStock, fechaIngreso, tipoProducto, ofertaMayorista, precioMayorista, proveedor, codigoBarra } = req.body;

    // Verificar si faltan campos esenciales
    if (!nombre || !categoria || !precio || !cantidadStock || !fechaIngreso || !tipoProducto) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Obtener los datos de la hoja para calcular el siguiente ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A2:A', // Solo obtenemos la columna de IDs para verificar el último
    });

    const rows = response.data.values;
    let lastId = 0;

    // Si hay datos, buscamos el último ID
    if (rows && rows.length > 0) {
      lastId = Math.max(...rows.map(row => parseInt(row[0], 10)));
    }

    // Generar el siguiente ID
    const newId = lastId + 1;

    // Ahora, insertamos el nuevo producto con el ID generado
    const newProduct = [
      [newId, nombre, categoria, precio, cantidadStock, fechaIngreso, tipoProducto, ofertaMayorista ? 'Sí' : 'No', precioMayorista, proveedor, codigoBarra]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'A2:K', // Ajusta el rango a las columnas que tienes en la hoja
      valueInputOption: 'RAW',
      resource: {
        values: newProduct,
      },
    });

    res.status(201).json({ message: "Producto creado correctamente", id: newId });
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    res.status(500).json({ error: "Error al guardar el producto" });
  }
});


// app.put('/api/productos/:id', async (req, res) => {
//   const { id } = req.params;
//   const { nombre, categoria, precioUnitario, cantidadStock, fechaIngreso, tipoProducto, ofertaMayorista, precioMayorista, proveedor, codigoBarra } = req.body;
  
//   try {
//     // Encontrar la fila correspondiente al ID (en este caso, buscaremos por el valor en la primera columna 'ID')
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SHEET_ID,
//       range: "A2:K",  // Rango de filas
//     });
    
//     const rows = response.data.values;
//     const rowIndex = rows.findIndex(row => row[0] === id.toString());  // Buscar el índice de la fila con el ID
    
//     if (rowIndex === -1) {
//       return res.status(404).json({ error: "Producto no encontrado" });
//     }
    
//     // Crear la fila con los nuevos valores
//     const updatedProduct = [
//       nombre, categoria, precioUnitario, cantidadStock, fechaIngreso, tipoProducto, ofertaMayorista ? "Sí" : "No", precioMayorista || "-", proveedor, codigoBarra
//     ];
    
//     // Actualizar la fila en Google Sheets
//     await sheets.spreadsheets.values.update({
//       spreadsheetId: SHEET_ID,
//       range: `A${rowIndex + 2}:K${rowIndex + 2}`,  // Especificamos la fila a actualizar
//       valueInputOption: "RAW",  // Usamos RAW para mantener el formato de los valores tal cual
//       requestBody: {
//         values: [updatedProduct],  // Nueva fila con datos actualizados
//       },
//     });
    
//     res.json({ message: "Producto actualizado correctamente", product: updatedProduct });
//   } catch (error) {
//     console.error("Error al actualizar el producto:", error);
//     res.status(500).json({ error: "Error al actualizar el producto" });
//   }
// });
app.put('/api/productos/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { nombre, categoria, precio, cantidadStock, fechaIngreso, tipoProducto, ofertaMayorista, precioMayorista, proveedor, codigoBarra } = req.body;

    // Obtener todos los datos para encontrar la fila con el ID dado
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A2:K', // Asegura obtener todas las columnas
    });

    let rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No hay productos en la hoja" });
    }

    // Buscar la fila donde está el producto con el ID
    let rowIndex = rows.findIndex(row => parseInt(row[0], 10) === productId);
    if (rowIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Convertir el índice basado en A1 (Google Sheets empieza desde 1, y hay encabezados)
    let googleSheetRow = rowIndex + 2; // +2 porque la primera fila es el encabezado y Google Sheets empieza en 1

    // Crear un array con los valores actuales
    let updatedProduct = [...rows[rowIndex]];

    // Solo actualizar los campos enviados en el body (para evitar sobrescribir con undefined)
    if (nombre !== undefined) updatedProduct[1] = nombre;
    if (categoria !== undefined) updatedProduct[2] = categoria;
    if (precio !== undefined) updatedProduct[3] = precio;
    if (cantidadStock !== undefined) updatedProduct[4] = cantidadStock;
    if (fechaIngreso !== undefined) updatedProduct[5] = fechaIngreso;
    if (tipoProducto !== undefined) updatedProduct[6] = tipoProducto;
    if (ofertaMayorista !== undefined) updatedProduct[7] = ofertaMayorista ? 'Sí' : 'No';
    if (precioMayorista !== undefined) updatedProduct[8] = precioMayorista;
    if (proveedor !== undefined) updatedProduct[9] = proveedor;
    if (codigoBarra !== undefined) updatedProduct[10] = codigoBarra;

    // Actualizar la fila en la hoja
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `A${googleSheetRow}:K${googleSheetRow}`, // Selecciona la fila correcta
      valueInputOption: 'RAW',
      resource: {
        values: [updatedProduct], // Pasa el array con los valores actualizados
      },
    });

    res.json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
