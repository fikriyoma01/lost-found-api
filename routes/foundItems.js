const express = require('express');
const router = express.Router();
const FoundItem = require('../models/FoundItemModel');
const LostItem = require('../models/LostItemModel');
const auth = require('../middleware/auth'); 
const { createNotification } = require('../utils/notificationUtils'); 

// Tambahkan item temuan baru
router.post('/add', async (req, res) => {
  const newItem = new FoundItem({ ...req.body });

  try {
    const savedItem = await newItem.save();
    
    // Cari item yang hilang yang cocok
    const lostItem = await LostItem.findOne({
      itemType: savedItem.itemType,
      description: { $regex: savedItem.description, $options: 'i' }
    });

    if (lostItem) {
      // Kirim notifikasi ke pengguna yang melaporkan kehilangan
      await createNotification(
        lostItem.reportedBy,
        `Item yang Anda laporkan hilang mungkin telah ditemukan: ${savedItem.description}`,
        'item_found',
        savedItem._id,
        'FoundItem'
      );
    }

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

// Endpoint untuk mengklaim barang
// Route untuk mengklaim barang
router.put('/claim/:id', auth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  console.log(`Attempting to claim item with ID: ${id}`);

  try {
    const lostItem = await LostItem.findById(id);
    if (!lostItem) {
      return res.status(404).json({ message: 'Lost item not found.' });
    }

    let foundItem = await FoundItem.findOne({ lostItemRef: lostItem._id });
    if (!foundItem) {
      foundItem = new FoundItem({
        itemType: lostItem.itemType,
        description: lostItem.description,
        locationFound: lostItem.location,
        dateFound: new Date(),
        contactInfo: lostItem.contactInfo,
        lostItemRef: lostItem._id,
        reportedBy: userId
      });
    }

    if (foundItem.status === 'claimed') {
      return res.status(400).json({ message: 'Found item already claimed.' });
    }

    foundItem.status = 'claimed';
    foundItem.claimedBy = userId;
    await foundItem.save();

    console.log(`Found item with ID: ${foundItem._id} claimed.`);

    // Create notification for the user who reported the lost item
    await createNotification(
      lostItem.reportedBy.toString(),
      `telah menemukan item yang Anda laporkan hilang: ${lostItem.description}`,
      'item_found',
      foundItem._id,
      'FoundItem',
      userId // ID of the user who found/claimed the item
    );

    res.json({ message: 'Found item successfully claimed.' });
  } catch (error) {
    console.error(`Error when claiming found item with lost item ID: ${id}`, error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Route untuk mendapatkan daftar item yang telah diklaim oleh pengguna tertentu
router.get('/claimeditems/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const claimedItems = await FoundItem.find({ claimedBy: userId });
    res.json(claimedItems);
  } catch (error) {
    console.error(`Error when retrieving claimed items for user ID: ${userId}`, error);
    res.status(500).send('Server error.');
  }
});


module.exports = router;
