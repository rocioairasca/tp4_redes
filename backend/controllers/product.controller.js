const Product = require('../models/Product');

// Crear un producto
const createProduct = async (req, res) => {
    console.log('Crear producto:', req.body);
    try {
        const product = new Product({ ...req.body, availableQuantity: req.body.totalQuantity });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener todos los productos
const getAllProducts = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1; // Asegúrate de convertir a número
        const limit = Number(req.query.limit) || 10; // Asegúrate de convertir a número

        const products = await Product.find()
            .limit(limit) // No necesitas convertir a número aquí porque ya lo hiciste arriba
            .skip((page - 1) * limit);

        const totalProducts = await Product.countDocuments(); // Total de documentos en la colección
        const totalPages = Math.ceil(totalProducts / limit); // Calcular total de páginas

        res.json({
            products,
            totalPages,
            currentPage: page,
            totalProducts, // Opcional, si quieres enviar el total de productos al frontend
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar un producto
const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Deshabilitar un producto
const disableProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

        product.availableQuantity = 0; // Marcamos como "agotado" o "no disponible"
        await product.save();
        res.json({ message: 'Producto deshabilitado', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    disableProduct,
};
