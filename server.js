// USEFUL LINKS: 
// https://datamarket.azure.com/receipt/f17ba746-6931-4e85-a2f1-01d327e8d66e?ctpa=False
// https://github.com/goferito/node-bing-api

var express = require('express');
var app = express();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var db_collection = "ImageSearchAbstractionLayer";
var url = process.env.MONGOLAB_URI || 'mongodb://test:test@ds017246.mlab.com:17246/freecodecampdb';
var port = 8080;
var Bing = require('node-bing-api')({ accKey: "sItCapBzYLi1KfaAMxJfSa3OMDyQqLuQyhS5paYRfl8=" });

var m_url = [];
var m_snippet = [];
var m_thumbnail = [];
var m_context = [];

app.get('/api/imagesearch/*', function (req, res) {
    var keywords = req.params[0];
    var offset = req.query.offset;
    
    console.log("The search string is: " + keywords);

    
    Bing.images(keywords, {
        top: 1,
        skip: offset || 0
        
    }, function(error, results, body){

        if(error) res.send('Error: ' + error.message);
		
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
    console.log(req.params[0]);
    res.send('Hello World!');
});

app.get('/*', function (req, res) {
    res.end();
});

app.listen(8080, function () {
  console.log('App listening on port :' + port);
});

