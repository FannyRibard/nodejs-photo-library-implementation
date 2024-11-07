const Album = require('../models/Album');
const catchAsync = require('../helpers/catchAsync');
const path = require('path');
const fs = require('fs');
const { rimraf, rimrafSync, native, nativeSync } = require('rimraf')

// Render the main route with list of albums into the template "albums.ejs"
const albums = catchAsync(async (req, res) => {
    const albums = await Album.find();
    res.render('albums', {
        title: 'Mes albums',
        albums,
    });
});

// Render an album get by its ID given in paramter into the template "album.ejs"
const album = catchAsync(async (req, res) => {
    const id = req.params.id;
    const album = await Album.findById(id);

    res.render('album', {
        title: `Mon album ${album.title}`,
        album,
        errors: req.flash('error'),
    });
})

// Delete an album and remove the folder that contains all images attached to this one
const deleteAlbum = catchAsync(async (req, res) => {
    const idAlbum = req.params.idAlbum;
    const album = await Album.findByIdAndDelete(idAlbum);

    rimraf(path.join(__dirname, '../public/uploads/', idAlbum));
    res.redirect('/albums');
})

// Delete image of an album and remove the image in the folder
const deleteImage = catchAsync(async (req, res) => {
    const idAlbum = req.params.idAlbum;
    const idxImage = req.params.idxImage;

    const album = await Album.findById(idAlbum);

    const image = album.images[idxImage];
    if (!image) {
        res.redirect(`/albums/${id}`);
        return;
    }

    album.images.splice(idxImage, 1);
    await album.save();

    fs.unlinkSync(path.join(__dirname, '../public/uploads/', idAlbum, image));

    res.redirect(`/albums/${idAlbum}`);
});

// View image when we click on it in the folder
const viewImage = catchAsync(async (req, res) => {
    const idAlbum = req.params.idAlbum;
    const idxImage = req.params.idxImage;
    const album = await Album.findById(idAlbum);
    const image = album.images[idxImage];

    res.render('image', {
        title: `Mon album ${album.title}`,
        album,
        image,
        errors: req.flash('error'),
    });
});

// Add an image to the album
const addImage = catchAsync(async (req, res) => {
    const id = req.params.id;
    const album = await Album.findById(id);

    if (!req?.files?.image) {
        req.flash('error', "Aucun fichier mis en ligne");
        res.redirect(`/albums/${id}`);
        return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.image.mimetype)) {
        req.flash('error', "Seulement les images au format jpeg, jpg ou png sont autorisés");
        res.redirect(`/albums/${id}`);
        return;
    }

    const imageName = req.files.image.name;

    const folderPath = path.join(__dirname, '../public/uploads/', id);
    fs.mkdirSync(folderPath, { recursive: true });

    const localPath = path.join(folderPath, imageName);
    await req.files.image.mv(localPath);

    album.images.push(imageName);
    await album.save();
    
    res.redirect(`/albums/${id}`);
})

// Create album form page with template "new-album.ejs"
const createAlbumForm = (req, res) => {
    res.render('new-album', {
        title: 'Nouvel album',
        errors: req.flash('error'),
    });
};

// Create am album
const createAlbum = catchAsync(async (req, res) => {
    try {
        if (!req.body.albumTitle) {
            req.flash('error', "Le titre ne doit pas être vide");
            res.redirect('/albums/create');
            return;
        }
    
        await Album.create({
            title: req.body.albumTitle,
            images: [],
        });
  
        res.redirect('/albums');
    } catch (err) {
        console.log(err);
        req.flash('error', "Erreur lors de la création de l'album");
        res.redirect('/albums/create');
    }
});

module.exports = {
    albums,
    album,
    addImage,
    createAlbumForm,
    createAlbum,
    deleteImage,
    deleteAlbum,
    viewImage,
}