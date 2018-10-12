// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var doctorRoutes = require('./routes/doctor');
var searchRoutes = require('./routes/search');
var uploadRoutes = require('./routes/upload');
var imageRoutes = require('./routes/image');

// Init variables
var app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database connection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if(err) throw err;

    console.log("Database running on port 27017");
});

// Routes
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/doctor', doctorRoutes);
app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imageRoutes);
app.use('/', appRoutes);


// Listen
app.listen(3000, () => {
    console.log("Express server running on port 3000");
})