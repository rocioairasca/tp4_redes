// modelo para el producto
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Líquido', 'Polvo'], required: true },
    totalQuantity: { type: Number, required: true }, 
    availableQuantity: { type: Number, required: true }, 
    unit: { type: String, enum: ['lt', 'kg'], required: true }, 
    price: Number,
    acquisitionDate: Date,
    isDisabled: { type: Boolean, default: false }
});

module.exports = mongoose.model('Product', productSchema);