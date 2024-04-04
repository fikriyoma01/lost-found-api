const router = require('express').Router();
let FoundItem = require('../models/FoundItemModel');

// Tambahkan item temuan baru
router.post('/add', async (req, res) => {
  const newItem = new FoundItem({ ...req.body });

  try {
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Dapatkan semua item temuan
router.get('/', async (req, res) => {
  try {
    const foundItems = await FoundItem.find();
    res.json(foundItems);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Update item temuan berdasarkan ID
router.put('/update/:id', async (req, res) => {
  try {
    const updatedItem = await FoundItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Hapus item temuan berdasarkan ID
router.delete('/:id', async (req, res) => {
  try {
    await FoundItem.findByIdAndDelete(req.params.id);
    res.json('Found item has been deleted.');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
