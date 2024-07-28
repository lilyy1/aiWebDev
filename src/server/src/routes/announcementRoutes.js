const express = require('express');
const { createAnnouncement, getAnnouncements, getAnnouncementById, deleteAnnouncement, updateAnnouncement } = require('../controllers/announcementController');

const router = express.Router();

router.get('/create-announcement', (req, res) => {
    res.send('create-announcement');
});
router.post('/create-announcement', createAnnouncement);

router.get('/announcements-page', getAnnouncements);

router.get('/:id', getAnnouncementById);

router.put('/:id', updateAnnouncement); 

router.delete('/:id', deleteAnnouncement);

module.exports = router;
