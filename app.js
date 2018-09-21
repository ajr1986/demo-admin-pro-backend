// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');

// Init variables
var app = express();

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
app.use('/', appRoutes);


// Listen
app.listen(3000, () => {
    console.log("Express server running on port 3000");
})