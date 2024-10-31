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
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10; 

        const products = await Product.find({ isDisabled: false })
            .limit(limit) 
            .skip((page - 1) * limit);

        const totalProducts = await Product.countDocuments({ isDisabled: false }); 
        const totalPages = Math.ceil(totalProducts / limit); 

        res.json({
            products,
            totalPages,
            currentPage: page,
            totalProducts, 
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
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isDisabled: true, },
            { new: true }
        );
        
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

        product.availableQuantity = 0;
        res.json({ message: 'Producto deshabilitado', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener productos deshabilitados con paginado
const getDisabledProducts = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1; 
        const limit = Number(req.query.limit) || 10; 

        const products = await Product.find({ isDisabled: true })
            .limit(limit)
            .skip((page - 1) * limit);

        const totalProducts = await Product.countDocuments({ isDisabled: true }); 
        const totalPages = Math.ceil(totalProducts / limit); 

        res.json({
            products,
            totalPages,
            currentPage: page,
            totalProducts,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const enableProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Encuentra el producto por ID
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

        // Habilita el producto
        product.isDisabled = false;
        await product.save(); // Guarda los cambios en la base de datos

        res.json({ message: 'Producto habilitado', product });
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
    getDisabledProducts,
    enableProduct,
};
