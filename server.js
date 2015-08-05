// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();               // define our app using express
var bodyParser = require('body-parser');
var aws = require('aws-sdk');

var http = require("http");
var url = require("url");
var multipart = require("multipart");
var sys = require("sys");
var fs = require("fs");

var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var TwoStep = require("two-step");




// configure app to use bodyParser()
// this will let us get the data from a POST
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

var AWS_ACCESS_KEY = "AKIAJC4BTANG4XW4TOMA"; // process.env.AWS_ACCESS_KEY; AKIAJC4BTANG4XW4TOMA
var AWS_SECRET_KEY = "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"; //process.env.AWS_SECRET_KEY;
var S3_BUCKET = "questionapi"; //process.env.S3_BUCKET


var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


app.get('/', function(req, res) {
    res.render("contact.html");
});

app.post('/upload', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files)
    {
        // `file` is the name of the <input> field of type `file`
        var old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            index = old_path.lastIndexOf('/') + 1,
            file_name = old_path.substr(index),
            new_path = path.join(process.env.PWD, '/uploads/', file_name + '.' + file_ext);

        fs.readFile(old_path, function(err, data)
        {
            fs.writeFile(new_path, data, function(err)
            {
                fs.unlink(old_path, function(err)
                {
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
                            exec = require('child_process').execSync;

                        var inName = "uploads/"+filename+".pdf";
                        var outName = "uploads/"+filename+".tiff";


                  			TwoStep(
                          function convert() {
                              var done = false;
                              convert    = exec('convert -monitor -density 300 ' + inName + ' -depth 8 -background white -alpha remove ' + outName,
                                              function (err, out, code)
                                              {
                                                if (err instanceof Error)
                                                  throw err;
                                                process.stderr.write(err);
                                                process.stdout.write(out);

                                                done = true;
                                                process.exit(code);
                                              }
                                          );


                          },
                          function ocr() {

                              ocr = exec('tesseract ' + outName + " out",
                                              function (err1, out1, code1)
                                              {
                                                if (err1 instanceof Error)
                                                  throw err1;
                                                process.stderr.write(err1);
                                                process.stdout.write(out1);

                                                process.exit(code1);

                                              }
                              );
                          },
                          function python() {
                              python = exec('python main.py',
                                              function (err1, out1, code1)
                                              {
                                                if (err1 instanceof Error)
                                                  throw err1;
                                                process.stderr.write(err1);
                                                process.stdout.write(out1);
                                                process.exit(code1);

                                              }
                              );
                          }
                        );

                        var fs = require('fs'),
                          filename = "pyout.txt";

                        fs.readFile(filename, 'utf8', function(err, data) {
                          if (err) throw err;
                          console.log('OK: ' + filename);
                          console.log(data)
                          res.json({'questions': data});
                        });


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
