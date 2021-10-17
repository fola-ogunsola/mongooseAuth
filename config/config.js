const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/authtut');
mongoose.Promise = global.Promise;

