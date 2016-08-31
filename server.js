// USEFUL LINKS: 
// https://datamarket.azure.com/receipt/f17ba746-6931-4e85-a2f1-01d327e8d66e?ctpa=False
// https://github.com/goferito/node-bing-api

var express = require('express');
var app = express();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var db_collection = "ImageSearchAbstractionLayer";
var url = process.env.MONGOLAB_URI || 'mongodb://test:test@ds017246.mlab.com:17246/freecodecampdb';
var port = process.env.PORT || 8080;
var Bing = require('node-bing-api')({ accKey: "sItCapBzYLi1KfaAMxJfSa3OMDyQqLuQyhS5paYRfl8=" });
var path = require("path");

app.use(express.static(__dirname));

MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error: ', err.message);
        throw err;
    } 
    else{
        console.log('Connection established to', url);
        // Create a collection in the database: 
        db.createCollection(db_collection, {
            max: 5000,
            size: 5242880,
            
        });
        var mycollection = db.collection(db_collection);
    }
    
    app.get("/", function(req, res) {
        res.sendFile(path.join(__dirname + '/index.html')); // Render HTML File
    });
    
    app.get('/api/imagesearch/*', function (req, res) {
        var keywords = req.params[0];
        var offset = req.query.offset;
        var m_date = new Date().toLocaleString();
        
        console.log("The search string is: " + keywords);

    
        Bing.images(keywords, {
            top: 10,
            skip: offset || 0
        
        }, function(error, results, body){

            if(error) res.send('Error: ' + error.message);
		    
		    mycollection.insert( { term: keywords, when: m_date } );
		    
		    res.json(body.d.results.map(function (item) {
			    return {
			        url: item.MediaUrl, 
                    snippet: item.Title, 
                    thumbnail: item.Thumbnail, 
                    context: item.SourceUrl
			    };
		    }));
        });
    });

    app.get('/api/latest/imagesearch', function (req, res) {
        mycollection.find({}).sort({when: -1}).limit(10).toArray(function (err, results) {
            
            if(err){
                res.send('Error: ' + err.message);
            }
            
            res.json(results.map(function (item) {
                return {
			        term: item.term, 
                    when: item.when, 
			    };
		    }));
        });
    });

    app.get('/*', function (req, res) {
        res.end();
    });

    app.listen(port, function () {
    console.log('App listening on port :' + port);
    });
});

