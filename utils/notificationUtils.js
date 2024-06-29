const Notification = require('../models/NotificationModel');
const User = require('../models/UserModel');

const createNotification = async (userId, message, type, relatedItemId = null, itemModel = null, finderId = null) => {
  console.log('Creating notification with params:', { userId, message, type, relatedItemId, itemModel, finderId });

  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('Valid user ID is required to create a notification');
  }

  try {
    let finderName = 'Seseorang';
    if (finderId) {
      const finder = await User.findById(finderId);
      if (finder) {
        finderName = finder.name || finder.email || 'Seseorang';
      }
    }

    const notification = new Notification({
      user: userId,
      message: `${finderName} ${message}`,
      type,
      relatedItem: relatedItemId,
      itemModel: itemModel
    });

    const savedNotification = await notification.save();
    console.log('Notification created successfully:', savedNotification);
    return savedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

module.exports = { createNotification };