// Requires
var express = require('express');
var mongoose = require('mongoose');

// Init variables
var app = express();

// Database connection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if(err) throw err;

    console.log("Database running on port 27017");
});

// Routes
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        message: "Request success"
    });
})


// Listen
app.listen(3000, () => {
    console.log("Express server running on port 3000");
})