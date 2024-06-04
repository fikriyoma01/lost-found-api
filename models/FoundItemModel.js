const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const foundItemSchema = new Schema({
  itemType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  locationFound: {
    type: String,
    required: true
  },
  dateFound: {
    type: Date,
    required: true
  },
  contactInfo: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'not claimed', // or 'claimed'
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referensi ke model User
    default: null,
  },
}, {
  timestamps: true
});

const FoundItem = mongoose.model('FoundItem', foundItemSchema);

module.exports = FoundItem;
