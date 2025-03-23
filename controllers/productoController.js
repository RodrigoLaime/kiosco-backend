const productoService = require('../services/productoService');

const getAllProductos = async (req, res) => {
  try {
    const rows = await productoService.getAllProductos();
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
      public_id: row[13] || ''
    }));

    res.json(productos);
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productoService.getProductoById(id);
    
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
      public_id: producto[13] || ''
    };

    res.json(productoDetails);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};

const createProducto = async (req, res) => {
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

    if (!nombre || !categoria || !precio_unitario || !stock_disponible) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const { newId, currentDate } = await productoService.createProducto(req.body);

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
};

const updateProducto = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProduct = await productoService.updateProducto(productId, req.body);

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
        imagen_url: updatedProduct[12],
        public_id: updatedProduct[13] 
      }
    });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto
};
