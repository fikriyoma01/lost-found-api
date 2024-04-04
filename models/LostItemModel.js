const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const lostItemSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  itemType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  timeLost: {
    type: Date,
    required: true
  },
  contactInfo: {
    type: String,
    required: true
  },
}, {
  timestamps: true
});

lostItemSchema.index({ description: 'text', location: 'text' });

const LostItem = mongoose.model('LostItem', lostItemSchema);

module.exports = LostItem;
