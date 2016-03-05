var path = require('path');
var express = require('express');
var logger = require('morgan');
var _ = require('underscore');
var app = express();

// Log the requests
app.use(logger('dev'));

function sendValidResponse(req, res) {
    var resultString = "";
    resultString += "HTTP " + req.method + " request accepted. \n";
    if (_.isEmpty(req.query)) {
        resultString += "No query parameters. \n"
    } else {
        resultString += "Query Parameters: " + JSON.stringify(req.query, null, 1) + "\n";
    }
    resultString += "Request Headers: " +  JSON.stringify(req.headers, null, 1);
    return resultString;
}

// Route for /gets
app.get('/gets', function(req, res){

    res.send(sendValidResponse(req, res));
});

// Route for /posts
app.post('/posts', function(req, res){
    res.send(sendValidResponse(req, res));
});

// Route for /puts
app.put('/puts', function(req, res){
    res.send(sendValidResponse(req, res));
});

// Route for /deletes
app.delete('/deletes', function(req, res){
    res.send(sendValidResponse(req, res));
});

// Route for everything else.
app.all('*', function(req, res){
    res.send('Only requests made (with the correct HTTP method) to /gets, /posts, /puts, or /deletes will be accepted.');
});

// Fire it up!
app.listen(3000);
console.log('Listening on port 3000');