const express = require('express');
const router = express.Router();
const albumController = require('../controllers/album.controller');

router.get('/albums', albumController.albums);

router.get('/albums/create', albumController.createAlbumForm);
router.post('/albums/create', albumController.createAlbum);

router.get('/albums/:id', albumController.album);
router.post('/albums/:id', albumController.addImage);
router.get('/albums/:idAlbum/:idxImage', albumController.viewImage);
router.get('/albums/:idAlbum/delete', albumController.deleteAlbum);
router.get('/albums/:idAlbum/delete/:idxImage', albumController.deleteImage);

module.exports = router;