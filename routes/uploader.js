var crypto = require('crypto');

exports.index = function(req, res) {
    var expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);

    var policy = {
        expiration: expiration.toISOString(),
        conditions: [
            {bucket: "questionapi"},
            ["starts-with", "$key", "uploads/"],
            {acl: "private"},
            {success_action_redirect: "http://localhost"},
            ["starts-with", "$Content-Type", "image/"],
            ["content-length-range", 0, 1048576]
        ]
    };


    var AWS_ACCESS_KEY = "AKIAJC4BTANG4XW4TOMA"; // process.env.AWS_ACCESS_KEY; AKIAJC4BTANG4XW4TOMA
    var AWS_SECRET_KEY = "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"; //process.env.AWS_SECRET_KEY;
    var awsKeyId = AWS_ACCESS_KEY;
    var awsKey = AWS_SECRET_KEY;

    var policyString = JSON.stringify(policy);
    var encodedPolicyString = new Buffer(policyString).toString("base64");

    var hmac = crypto.createHmac("sha1", awsKey);
    hmac.update(encodedPolicyString);

    var digest = hmac.digest('base64');

    res.render('uploader', {awskeyid: awsKeyId, policy: encodedPolicyString, signature: digest, keyname: "uploads/randomfilename.png"});
};
