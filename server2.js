// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();               // define our app using express
var bodyParser = require('body-parser');
var aws = require('aws-sdk');
var AwsS3Form = require( "aws-s3-form" );

var http = require("http");
var url = require("url");
var multipart = require("multipart");
var sys = require("sys");
var fs = require("fs");

var formidable = require('formidable');
var fs = require('fs');
var path = require('path');



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


var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
app.get('/process', function(req, res) {
    //var cmdConvert = 'convert -density 300 myPDF.pdf  -depth 8 -background white -alpha remove myPDF.tiff'
    //var cmdTesseract = 'tesseract myPDF.tiff out'

    var out;

    var util  = require('util'),
    //spawn = require('child_process').spawn,
        exec = require('child_process').exec;

    convert    = exec('convert', ['-density', '300', "/uploads/"+filename+".pdf", '-depth', '8', '-background', 'white', '-alpha', 'remove', "/uploads/"+filename+".tiff"]);

    convert.stdout.on('data', function (data) {
      console.log('Convert stdout: ' + data);
    });

    convert.stderr.on('data', function (data) {
      console.log('Convert stderr: ' + data);
    });

    convert.on('exit', function (code) {
      console.log('Convert completed: exited with code ' + code);
    });



    ocr = exec('tesseract', ["/uploads/"+filename+".tiff", 'out'])

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


app.get('/', function(req, res) {
    res.render("index.html");
});

app.post('/upload', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        var old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            index = old_path.lastIndexOf('/') + 1,
            file_name = old_path.substr(index),
            new_path = path.join(process.env.PWD, '/uploads/', file_name + '.' + file_ext);

        fs.readFile(old_path, function(err, data) {
            fs.writeFile(new_path, data, function(err) {
                fs.unlink(old_path, function(err) {
                    if (err)
                    {
                        res.status(500);
                        res.json({'success': false});
                    }
                    else
                    {
                        res.status(200);

                        var out;
                        var filename = file_name;
                        var util  = require('util'),
                        //spawn = require('child_process').spawn,
                            exec = require('child_process').exec;

                        console.log("uploads/"+filename+".pdf");

                        var inName = "uploads/"+filename+".pdf";
                        var outName = "uploads/"+filename+".tiff";
                        console.log(['-density', '300', inName, '-depth', '8', '-background', 'white', '-alpha', 'remove', outName]);
                        convert    = exec('convert', ['-density', '300', inName, '-depth', '8', '-background', 'white', '-alpha', 'remove', outName]);
                        //convert = exec('pwd');
                        convert.stdout.on('data', function (data) {
                          console.log('Convert stdout: ' + data);
                        });

                        convert.stderr.on('data', function (data) {
                          console.log('Convert stderr: ' + data);
                        });

                        convert.on('exit', function (code) {
                          console.log('Convert completed: exited with code ' + code);
                        });


/*
                        ocr = exec('tesseract', ["uploads/"+filename+".tiff", 'out'])

                        ocr.stdout.on('data', function (data) {
                          console.log('Tesseract stdout: ' + data);
                        });

                        ocr.stderr.on('data', function (data) {
                          console.log('Tesseract stderr: ' + data);
                        });

                        ocr.on('exit', function (code) {
                          console.log('Tesseract completed: exited with code ' + code);
                        });


*/
                        //exec(cmd, function(error, out, stderr) {
                          // command output is in stdout

                        //});

                        res.json({ message: out });

                        res.json({'success': true});
                    }
                });
            });
        });
    });
});




// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
//app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
