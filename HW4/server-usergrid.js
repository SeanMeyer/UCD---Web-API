var argo = require('argo');
var express = require('express');
var usergrid = require('usergrid');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

var client = new usergrid.client({
    orgName:'seanmeyer',
    appName:'sandbox',
    logging: true, //optional - turn on logging, off by default
});

function formatMovieResult(movie) {
    return {
        "Title" : movie.name,
        "Year Released" : movie["Year Released"],
        "Actors" : movie.actors
    };
}

app.get('/movies/ListMovies', function (req, res) {
    var options = {
        type:'movies',
        qs:{ql:'order by name'}
    }

    client.createCollection(options, function (err, movies) {
        if (err) {
            //error - could not make collection
            res.status(500);
            res.send("Error!");
        } else {
            //success - new Collection worked
            var entities = [];
            while(movies.hasNextEntity())  {
                movie = movies.getNextEntity();
                entities.push(formatMovieResult(movie._data));
            }
            res.send(entities);
        }
    });
});

app.get('/movies/GetByTitle/:title', function (req, res) {
    var title = req.params.title;
    var properties = {
        method:'GET',
        type:'movie',
        name:title
    };

    client.getEntity(properties, function (error, result) {
        if (error) {
            //error
            res.send('Unable to find movie: ' + title);
        } else {
            //success
            res.send(formatMovieResult(result._data));
        }
    });
});

app.get('/movies/DeleteByTitle/:title', function (req, res) {
    var properties = {
        method:'GET',
        type:'movie',
        name:req.params.title
    };

    client.getEntity(properties, function (error, result) {
        if (error) {
            //error
            res.send('Unable to find movie: ' + req.params.title);
        } else {
            //success
            result.destroy(function (error, result) {
                if (error) {
                    // Error
                    res.status(500);
                    res.send(result);
                } else {
                    // Success
                    res.send(req.params.title + " has been deleted.");
                }
            });
        }
    });
});

app.post('/movies/AddMovie', function (req, res) {
    // Check the entity sent was correct
    var requestType = req.get('Content-Type');

    // Guard against malformed requests
    res.status(400);
    if (requestType != 'application/json') {
        res.send("You must send a content-type of application/json");
        return;
    }
    if (!('name' in req.body)){
        res.send("Your json object must include the field: name");
        return;
    }
    if (!('Year Released' in req.body)) {
        res.send("Your json object must include the field: Year Released");
        return;
    }
    if (!('actors' in req.body)) {
        res.send("Your json object must include the field: actors");
        return;
    }
    if (req.body.actors.constructor !== Array) {
        res.send("Your json object must have an array for the actors");
        return;
    }
    if (req.body.actors.length < 3) {
        res.send("You must include at least 3 actors");
        return;
    }

    // Request was good, add the entity
    var options = {
        type:'movies',
        name:req.body.name
    };

    client.createEntity(options, function (err, movie) {
        if (err) {
            res.status(500);
            res.send("An error occurred trying to add movie");
        } else {

            movie.set(req.body);

            movie.save(function(err){
                if (err){
                    res.send("Error saving new movie");
                } else {
                    res.status(400);
                    res.send("Success, added new movie");
                }
            });
        }
    })

});

app.all('*', function (req, res) {
    res.send('Sorry, this request is not recognized as valid.');
});

app.listen(3000);