const express = require('express');
const router = express.Router();
const {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto
} = require('../controllers/productoController');

router.get('/', getAllProductos);
router.get('/:id', getProductoById);
router.post('/', createProducto);
router.put('/:id', updateProducto);

module.exports = router;
