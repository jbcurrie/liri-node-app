//  At the top of the `liri.js` file, write the code you need to grab the response from keys.js. Then store the keys in a variable.
var tokens = require("./keys.js");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require('request');
var fs = require("fs");

var twitterKeys = tokens.twitterKeys;
var spotifyKeys = tokens.spotifyKeys;
var omdbKeys = tokens.omdbKeys;
var trigger = process.argv[2];
var rndTrigger,data;
var input = "";

function stringInput () {
    for (var i=3; i < process.argv.length; i++) {
        input += process.argv[i];
        input += " "
    }
    // console.log(input);
    return input;
}
function writeFile (data) {
    fs.appendFile("log.txt",data,"utf8",function(err) {
        if (err) {
            console.log(`Error: ${err}`);
        }
    })
}
// my-tweets
// This will show your last 20 tweets and when they were created at in your terminal/bash window.
function myTweets (trigger) {
    // trigger = process.argv[2] || rndTrigger;
    if (trigger === 'my-tweets' || rndTrigger === 'my-tweets') {

        var client = new Twitter({
                        consumer_key: twitterKeys.consumer_key,
                        consumer_secret: twitterKeys.consumer_secret,
                        access_token_key: twitterKeys.access_token_key,
                        access_token_secret: twitterKeys.access_token_secret
                    });
        
        var params = {screen_name: 'fungus_30',
                    count: 20};
        client.get('statuses/user_timeline', params, function(error, tweets, response) {
            if (error) {
                console.log(error);
            } else {
                console.log("ready for some tweets?")
                // console.log(tweets);
                data = "\n" + `Command: ${trigger}` +"\n";
                writeFile (data);
                for (i in tweets) { 
                data = 
`----------Result: ${parseInt(i) + 1}---------
Date: ${tweets[i].created_at}
Status: ${tweets[i].text}` + "\n";
                console.log(data);
                writeFile(data);
                }
            }
        });
    }
}
//spotify
    //`node liri.js spotify-this-song '<song name here>'`
    //    * If no song is provided then your program will default to "The Sign" by Ace of Base.
function spotifyThis(trigger) {
    // console.log(rndTrigger);
    // trigger = process.argv[2];
    // console.log(trigger);
    stringInput();
    var song = input || "The Sign";
    // console.log(song);
    if (trigger === 'spotify-this-song' || rndTrigger === 'spotify-this-song') {
        var spotify = new Spotify({
        id: spotifyKeys.id,
        secret: spotifyKeys.secret
        });
        var objQuery = song;
        // console.log(objQuery);
        spotify.search({ type: 'track',
                        query: objQuery, 
                        limit: 5})
        .then(function(response) {
            // console.log(JSON.stringify(response,null,2));
            data = "\n" + `Command: ${trigger}, Keyword: ${song}` +"\n";
            writeFile (data);
            for (i in response.tracks.items) {
            data = 
`----------Result: ${parseInt(i) + 1}---------
Artist: ${response.tracks.items[i].album.artists[0].name}
Song Name: ${response.tracks.items[i].name}
Preview Link: ${response.tracks.items[i].preview_url}
Album/Single: ${response.tracks.items[i].album.name}` + "\n";
                console.log(data);
                writeFile (data);
            }
        })
        .catch(function(err) {
            console.log(err);
        });
    }
}
// 3. `node liri.js movie-this '<movie name here>'`
//    * If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'
function movieThis(trigger){
    // trigger = process.argv[2];
    if (trigger === "movie-this" || rndTrigger === "movie-this") {
        stringInput();
        var movie = input || "Mr.+Nobody";
        console.log(movie);
        var queryUrl = `http://www.omdbapi.com/?t=${movie}&r=json&type=movie&plot=short&apikey=40e9cece`

        request(queryUrl, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred 
            // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
            // console.log('body:',JSON.parse(body)); // 
            if (!JSON.parse(body).Ratings[1]) {
               var rating = `No Rotten Tomatoes Rating`
            } else {
                rating = `Rotten Tomatoes Rating: ${JSON.parse(body).Ratings[1].Value}`
            };
            data = 
"\n" + `Command: ${trigger}, Keyword: ${movie}
----------Result---------
Movie Title: ${JSON.parse(body).Title}
Release Year: ${JSON.parse(body).Year}
IMDB Rating: ${JSON.parse(body).Ratings[0].Value}
${rating}
Country(ies) where the movie was produced: ${JSON.parse(body).Country}
Movie Language: ${JSON.parse(body).Language}
Plot: ${JSON.parse(body).Plot}
Actors: ${JSON.parse(body).Actors}` + "\n";
            console.log(data);
            writeFile(data);
        });
    }
}
// 4. `node liri.js do-what-it-says`
//    * Using the `fs` Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands. 
//      * It should run `spotify-this-song` for "I Want it That Way," as follows the text in `random.txt`.
//      * Feel free to change the text in that document to test out the feature for other commands.
function randomTxt() {
    if (process.argv[2] === 'do-what-it-says'){
        fs.readFile("random.txt", "utf8", function(error, data) {
            if (error) {
                return console.log(error);
            }
            var dataArr = data.split(",");
            rndTrigger = dataArr[0];
            // console.log(rndTrigger)
            input = dataArr[1];
            stringInput(input);
            // console.log(input)
            movieThis(rndTrigger)
            spotifyThis(rndTrigger)
            myTweets(rndTrigger);
            // console.log(dataArr);
        });
    }
}

movieThis(trigger)
spotifyThis(trigger)
myTweets(trigger);
randomTxt();
