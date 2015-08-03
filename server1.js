// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();               // define our app using express
var bodyParser = require('body-parser');
var aws = require('aws-sdk');
var s3BrowserDirectUpload = require('s3-browser-direct-upload');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

var AWS_ACCESS_KEY = "AKIAJC4BTANG4XW4TOMA"; // process.env.AWS_ACCESS_KEY; AKIAJC4BTANG4XW4TOMA
var AWS_SECRET_KEY = "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"; //process.env.AWS_SECRET_KEY;
var S3_BUCKET = "questionapi"; //process.env.S3_BUCKET

var s3clientOptions = {
  accessKeyId: 'AKIAJC4BTANG4XW4TOMA', // required
  secretAccessKey: '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', // required
  region: 'us-east-1', // required
  signatureVersion: 'v4' // optional
};

var allowedTypes = ['jpg', 'png', 'pdf'];

var s3client = new s3BrowserDirectUpload(s3clientOptions, allowedTypes); // allowedTypes is optional

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

app.get('/upload', function(req, res){

    var uploadPostFormOptions = {
      key: 'filename.ext', // required
      bucket: 'questionapi', // required
      extension: 'ext', // optional (pass if You want to check with allowed extensions or set ContentType)
      acl: 'public-read', // optional, default: 'public-read'
      expires: new Date('2018-01-01'), // optional (date object with expiration date for urls), default: +60 minutes
      algorithm: 'AWS4-HMAC-SHA256', // optional, default: 'AWS4-HMAC-SHA256'
      region: 'us-east-1' // optional, default: s3client.region
    };

    s3client.uploadPostForm(uploadPostFormOptions, function(err, params){
      console.log(params); // params contain all the data required to build browser-based form for direct upload (check API Documentation)
    });
});


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
//app.use('/api', router);
//app.use('/upload', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
