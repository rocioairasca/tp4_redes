const mongoose = require('mongoose');

const lotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  area: {
    type: Number,
    required: true, // Área en hectáreas
  },
});

module.exports = mongoose.model('Lot', lotSchema);
