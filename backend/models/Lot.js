// modelo para los lotes
const mongoose = require('mongoose');

const lotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  area: {
    type: Number,
    required: true, 
  },
  isDisabled: { type: Boolean, default: false },
});

module.exports = mongoose.model('Lot', lotSchema);
