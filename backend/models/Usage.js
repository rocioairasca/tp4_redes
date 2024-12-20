// modelo para el registro de uso
const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    lots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lot', }],
    totalArea: { type: Number, required: true, },
    prevCrop: { type: String, required: true,},
    crop: { type: String, required: true,},
    user: String,
    isDisabled: { type: Boolean, default: false }
});

module.exports = mongoose.model('Usage', usageSchema);