var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var app     = express();

var START_URL = "https://www.reddit.com/";
var SEARCH_WORD = "stemming";
var MAX_PAGES_TO_VISIT = 10;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;
var success = [];
var skipped = [];
var error = [];

var json = {
	success: [],
	skipped: [],
	error: []
}
pagesToVisit.push(START_URL);


crawl();


function crawl() {

  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    console.log(json);

    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    json.skipped.push(nextPage);
    crawl();
  } else {
    // New page we haven't visited
    json.success.push(nextPage);
    visitPage(nextPage, crawl);
  }
}


function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
     	json.error.push(url);
       callback();
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);

       collectInternalLinks($);
       callback();

  });
}

function searchForWord($, word) {
  var bodyText = $('html > body').text().toLowerCase();
  return(bodyText.indexOf(word.toLowerCase()) !== -1);
}


function collectInternalLinks($) {
    var relativeLinks = $("a[href^='/']");
    console.log("Found " + relativeLinks.length + " relative links on page");
    relativeLinks.each(function() {
        pagesToVisit.push(baseUrl + $(this).attr('href'));
    });
}





	//   	fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

	 //    console.log('File successfully written! - Check your project directory for the output.json file');

		// })


  





app.listen('8080')

console.log('Magic happens on port 8080');

exports = module.exports = app;


