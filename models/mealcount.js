const mongoose = require('mongoose');

const mealCountSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now, unique: true },
  breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'useregistration' }],
  lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'useregistration' }],
  dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'useregistration' }]
});

module.exports = mongoose.model('MealCount', mealCountSchema);