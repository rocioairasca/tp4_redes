const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Líquido', 'Polvo'], required: true },
    totalQuantity: { type: Number, required: true }, // Cantidad inicial del producto
    availableQuantity: { type: Number, required: true }, // Cantidad disponible actual
    unit: { type: String, enum: ['lt', 'kg'], required: true }, // Unidad de medida (lt o kg)
    price: Number,
    acquisitionDate: Date,
    isDisabled: { type: Boolean, default: false }
});

module.exports = mongoose.model('Product', productSchema);