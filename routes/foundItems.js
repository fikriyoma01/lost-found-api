const router = require('express').Router();
let FoundItem = require('../models/FoundItemModel');
let LostItem = require('../models/LostItemModel');

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

// Endpoint untuk mengklaim barang
router.put('/claim/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;
  console.log(`Attempting to claim item with ID: ${id}`);
  if (!userId) {
    return res.status(401).send('User must be logged in to claim items.');
  }

  try {
    // First, find the item in the lostitems collection
    const lostItem = await LostItem.findById(id);
    if (!lostItem) {
      console.log(`Lost item with ID: ${id} not found.`);
      return res.status(404).send('Lost item not found.');
    }

    // Then, find or create a corresponding entry in the founditems collection
    let foundItem = await FoundItem.findOne({ lostItemRef: lostItem._id });
    if (!foundItem) {
      foundItem = new FoundItem({
        // Copy relevant fields from lostItem
        itemType: lostItem.itemType,
        description: lostItem.description,
        locationFound: lostItem.location,
        dateFound: lostItem.timeLost,
        contactInfo: lostItem.contactInfo,
        lostItemRef: lostItem._id, // Assuming you have this reference in your FoundItem schema
        // ... other fields as necessary
      });
    }

    // Check if the item is already claimed
    if (foundItem.status === 'claimed') {
      console.log(`Found item with ID: ${foundItem._id} is already claimed.`);
      return res.status(400).send('Found item already claimed.');
    }

    // Claim the found item
    foundItem.status = 'claimed';
    foundItem.claimedBy = userId
    await foundItem.save();
    console.log(`Found item with ID: ${foundItem._id} claimed.`);
    res.send('Found item successfully claimed.');
  } catch (error) {
    console.error(`Error when claiming found item with lost item ID: ${id}`, error);
    res.status(500).send('Server error.');
  }
});

// Middleware untuk verifikasi autentikasi user
// const isAuthenticated = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.status(401).send('User is not authenticated.');
// };

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
