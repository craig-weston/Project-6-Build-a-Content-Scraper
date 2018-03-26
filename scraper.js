/** Import all required node module */
var fs = require('fs');		// Node module for file system
var dir = './data';
var request  = require('request');  // Node module for making HTTP request
var cheerio  = require('cheerio'); // Node module for traversing DOM
var json2csv = require('json2csv');


// shopping website to scrape
var url = "http://shirts4mike.com";

/** csv header fields */
var csvFields = ["Title", "Price", "ImageURL", "URL", "Time"];

var data = [],
	shirtArray = [],
	shirtToScrap = [];

// create CSV headers
var header = ["Title", "Price", "ImageURL", "URL", "Time"];

request(url, function(error, response, body ) {
	
	if (error) {
		console.log("The site could not be scraped.");
		displayError(error);
	  }
	
	else {
	/** Create jQuery $ sign */
	var $ = cheerio.load(body);

		var shirtURL = $("a[href*='shirt']");
		
		/** Traverse all links and store path into shirtArray */
		shirtURL.each(function() {
			var fullPath = url + '/' + $(this).attr('href');
			if(shirtArray .indexOf(fullPath) === -1) {
				shirtArray .push(fullPath);
			}
		}); 
		
		for (var i = 0; i < shirtArray.length; i++) {

			/** Store all links to shirtsToScrap array which has query string id */
			if (shirtArray[i].indexOf("?id=") > 0) {
				shirtToScrap.push(shirtArray[i]);

			} else { 

				/** Make request to "http://shirts4mike.com/shirt.php" page to get additional shirt links */
				request(shirtArray[i], function(error, response, body) {

					/** Request is succesful and there is no error */
					if(!error && response.statusCode === 200) {
						/** Create jQuery like object */
						var $ = cheerio.load(body);
						/** Grab all shirt links from the page which has id */
						var shirts = $("a[href*='shirt.php?id=']");

						/** Traverse all links and store path into shirtArray */
						shirts.each(function() {
							var href = $(this).attr('href');
							var fullPath = url + '/' + href;
								if (shirtToScrap.indexOf(fullPath) === -1) {
									shirtToScrap.push(fullPath);
								}
						}); // End of shirts.each() method

						/** Now we have all shirt links in shirtToScrp array, make request to all links
						 * and get shirt price, image, title, etc
						 */
						for (var i = 0; i < shirtToScrap.length; i++) {

							/** Request to get shirt details */
							request(shirtToScrap[i], function(error, response, body) {

								/** Request is succesful and there is no error */
								if (!error && response.statusCode == 200) { 
									/** Create jQuery like object */
									var $ = cheerio.load(body);

									/** Create an object to hold the shirt detail */
									var json = {}

									json.Title = $('title').text();
									json.Price = $('.price').text();
									json.ImageURL = $('.shirt-picture img').attr('src');
									json.URL = response.request.href;

									var today = new Date();
									json.Time = today; // Time of extraction

									/** Store shirt details into an array */
									data.push(json);
							
									// Check for folder called data if not create one
									if(!fs.existsSync(dir)) {
										fs.mkdirSync(dir);
									};
									
										// create file with todays date as name
									var now = new Date();
									var mm = now.getMonth()+1
									var fileName = now.getFullYear() + "-" + mm + "-" + now.getDate() +'.csv';
						
									/** Convert json data into csv format using node module json2csv */
									json2csv({data:data, fields:csvFields}, function(err, csv) {

										if (err) throw err;
										/** If the data file for today already exists it should overwrite the file */
										fs.writeFile(dir + "/" + fileName, csv, function(err) {
											if (err) throw err;
												console.log(fileName + ' created');
										}); //End fo writeFile

									}); // End of json2csv method
								} else {
									printErrorMessage(error);
								} // End of if - request succesful
							}); // End of request method

						} // end of for
					} else {
						printErrorMessage(error);
					} // End of if 
				}); // End of request method
			} // End if
		} // End of for loop
		


	
	}
});

function displayError(error) {
  console.log(error.message);
  var errorTime = new Date().toLocaleString();
  var errorLog = " Uh Oh " + error.message + " " + errorTime;

  // Writes to error log
  fs.appendFile('scraper-error.log', errorLog, function(error) {
    if (error) throw error;
  }); // ends appendFile
}


