const router = require('express').Router();
let LostItem = require('../models/LostItemModel');
const FoundItem = require('../models/FoundItemModel');
const { createNotification } = require('../utils/notificationUtils');


// Tambahkan laporan kehilangan baru
router.post('/add', async (req, res) => {
  const newLostItem = new LostItem({ ...req.body });

  try {
    const savedItem = await newLostItem.save();
    
    // Cari item yang ditemukan yang cocok
    const foundItem = await FoundItem.findOne({
      itemType: savedItem.itemType,
      description: { $regex: savedItem.description, $options: 'i' }
    });

    if (foundItem) {
      // Kirim notifikasi ke pengguna yang melaporkan item hilang
      await createNotification(
        savedItem.reportedBy,
        `Item yang cocok dengan laporan Anda mungkin telah ditemukan: ${foundItem.description}`,
        'item_found',
        foundItem._id,
        'FoundItem'
      );
    }

    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Dapatkan semua laporan kehilangan
router.get('/', async (req, res) => {
  try {
    const lostItems = await LostItem.find();
    res.json(lostItems);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Update laporan kehilangan berdasarkan ID
router.put('/update/:id', async (req, res) => {
  try {
    const updatedItem = await LostItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Hapus laporan kehilangan berdasarkan ID
router.delete('/:id', async (req, res) => {
  try {
    await LostItem.findByIdAndDelete(req.params.id);
    res.json('Lost item has been deleted.');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    // Mencari dokumen yang cocok dengan query di field description atau location
    const foundItems = await LostItem.find({
      $or: [
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(foundItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(404).json({ message: "Item not found." });
  }
});

module.exports = router;
