const { sheets } = require('../config/google');
const SHEET_ID = process.env.GOOGLE_SHEETS_ID;

class ProductoService {
  async getAllProductos() {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A2:N",
    });
    return response.data.values;
  }

  async getProductoById(id) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A2:N",
      // range: "A2:M",
    });
    return response.data.values.find(row => row[0] === id);
  }

  async createProducto(productoData) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A2:N',
      // range: 'A2:A',
    });

    const rows = response.data.values;
    let lastId = 0;
    if (rows && rows.length > 0) {
      lastId = Math.max(...rows.map(row => parseInt(row[0], 10)));
    }
    const newId = lastId + 1;

    const currentDate = new Date().toLocaleDateString('es-AR');
    const newProduct = this.formatProductData(newId, productoData, currentDate);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'A2:N',
      valueInputOption: 'RAW',
      resource: { values: [newProduct] },
    });

    return { newId, currentDate };
  }

  async updateProducto(id, productoData) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A2:N',
    });

    let rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error("No hay productos en la hoja");
    }

    let rowIndex = rows.findIndex(row => row[0] === id);
    if (rowIndex === -1) {
      throw new Error("Producto no encontrado");
    }

    let googleSheetRow = rowIndex + 2;
    let updatedProduct = [...rows[rowIndex]];
    
    this.updateProductFields(updatedProduct, productoData);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `A${googleSheetRow}:N${googleSheetRow}`,
      valueInputOption: 'RAW',
      resource: {
        values: [updatedProduct],
      },
    });

    return updatedProduct;
  }

  formatProductData(newId, data, currentDate) {
    return [
      String(newId),
      data.nombre,
      data.categoria,
      data.descripcion || '',
      data.tipo_de_producto || '',
      String(data.precio_unitario),
      String(data.stock_disponible),
      currentDate,
      '',
      data.fecha_vencimiento || '',
      data.oferta_mayorista || '-',
      data.proveedor || '',
      data.imagen_url || 'https://via.placeholder.com/150',
      data.public_id || ''
    ];
  }

  updateProductFields(updatedProduct, data) {
    if (data.nombre !== undefined) updatedProduct[1] = data.nombre;
    if (data.categoria !== undefined) updatedProduct[2] = data.categoria;
    if (data.descripcion !== undefined) updatedProduct[3] = data.descripcion;
    if (data.tipo_de_producto !== undefined) updatedProduct[4] = data.tipo_de_producto;
    if (data.precio_unitario !== undefined) updatedProduct[5] = String(data.precio_unitario);
    if (data.stock_disponible !== undefined) updatedProduct[6] = String(data.stock_disponible);
    updatedProduct[8] = new Date().toLocaleDateString('es-AR');
    if (data.fecha_vencimiento !== undefined) updatedProduct[9] = data.fecha_vencimiento;
    if (data.oferta_mayorista !== undefined) updatedProduct[10] = data.oferta_mayorista;
    if (data.proveedor !== undefined) updatedProduct[11] = data.proveedor;
    if (data.imagen_url !== undefined) updatedProduct[12] = data.imagen_url;
    if (data.public_id !== undefined) updatedProduct[13] = data.public_id;
  }
}

module.exports = new ProductoService();
