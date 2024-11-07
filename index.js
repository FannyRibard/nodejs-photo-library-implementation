const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const path = require('path');
const albumRoutes = require('./routes/album.routes');

// Launch express
const app = express();
const port = 3000;

// Connection to the local DB
mongoose.connect('mongodb://localhost/phototheque');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'));

app.set('trust proxy', 1);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));
app.use(flash());

// Allow the use of JSON request and file upload
app.use(express.json());
app.use(express.urlencoded({ extended : false }));
app.use(fileUpload())

// For all paths, use the Album router in ./routes/album.routes
app.use('/', albumRoutes);

app.get('/', (req, res) => {
    res.redirect('/albums');
})

app.use((req, res) => {
    res.status(404);
    res.send('Page not found');
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500);
    res.send('Internal server error');
});

app.listen(port, () => {
    console.log(`Server launch on port ${port}`);
})