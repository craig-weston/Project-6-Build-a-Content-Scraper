/** Import all required node module */
var fs = require('fs');		// Node module for file system
var dir = './data';
var request  = require('request');  // Node module for making HTTP request
var cheerio  = require('cheerio'); // Node module for traversing DOM
var json2csv = require('json2csv');


// shopping website to scrape
var url = "http://shirts4mike.com";

var productTitle = [];
var productPrice = [];
var productImage = [];
var productURL = [];
var productTime = [];

// create CSV headers
var header = ["Title", "Price", "ImageURL", "URL", "Time"];

request(url, function(error, response, body ) {
	
/** Create jQuery $ sign */
	var $ = cheerio.load(body);
	
	if(response.statusCode === 200) {
		
		var shirtURL = $("a[href*='shirt']");
		
		/** Traverse all links and store path into shirtArray */
		shirtURL.each(function() {
			var fullPath = url + '/' + $(this).attr('href');
			if(productURL.indexOf(fullPath) === -1) {
				productURL.push(fullPath);
			}
		}); 
		
		
	var json = {}

	json.Title = $('title').text();
	json.Price = $('.price').text();
	json.ImageURL = $('.shirt-picture img').attr('src');
	json.URL = response.request.href;
		var today = new Date();
	json.Time = today; // Time of extraction
	data.push(json);
		
	// Check for folder called data if not create one
	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}

	// create file with todays date as name
	var now = new Date();
	var fileName = './data/' + now.getFullYear() + "-"+ now.getMonth() + "-" + now.getDay() +'.csv'

	   fs.writeFile(fileName, json, function (err) {

			if (err) throw err;

			console.log('It\'s saved! in same location.');

		});
	}

	//display error in console if a 404 occurs
	if(response.statusCode === 404) {

			console.log("There’s been a 404 error. Cannot connect to http://shirts4mike.com.")
	}
	
});


