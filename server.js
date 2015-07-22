// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();               // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {

    var cmdConvert = 'convert -density 300 myPDF.pdf  -depth 8 -background white -alpha remove myPDF.tiff'
    var cmdTesseract = 'tesseract myPDF.tiff out'

    var out;

    var util  = require('util'),
    //spawn = require('child_process').spawn,
        exec = require('child_process').exec;

    convert    = exec('convert', ['-density', '300', 'myPDF.pdf', '-depth', '8', '-background', 'white', '-alpha', 'remove', 'myPDF.tiff']);

    convert.stdout.on('data', function (data) {
      console.log('Convert stdout: ' + data);
    });

    convert.stderr.on('data', function (data) {
      console.log('Convert stderr: ' + data);
    });

    convert.on('exit', function (code) {
      console.log('Convert completed: exited with code ' + code);
    });



    ocr = exec('tesseract', ['myPDF.tiff', 'out'])

    ocr.stdout.on('data', function (data) {
      console.log('Tesseract stdout: ' + data);
    });

    ocr.stderr.on('data', function (data) {
      console.log('Tesseract stderr: ' + data);
    });

    ocr.on('exit', function (code) {
      console.log('Tesseract completed: exited with code ' + code);
    });



    //exec(cmd, function(error, out, stderr) {
      // command output is in stdout

    //});

    res.json({ message: out });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
