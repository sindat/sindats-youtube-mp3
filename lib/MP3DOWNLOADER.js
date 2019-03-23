"user strict";
const ffmpeg = require("fluent-ffmpeg"); // the converter
const ytdl = require("ytdl-core"); // youtube video downloader
//progress = require("progress-stream"); // will use later for progress bar and progress percentages 
const request = require("request");
// var async = require("async"); - didnt help with shit

/****************************************************************************************** */
// main function -- class - will be called with a constructor for instantiation in Express
function MP3DOWNLOADER(options) {

    
    this.fileSavePath = options.fileSavePath;
    this.ffmpegPath = options.ffmpegPath;
    this.apiKey = options.apiKey;

    // set ffmegpath after initialized in express - save the binary on the server
    if (options.ffmpegPath) {
        ffmpeg.setFfmpegPath(this.ffmpegPath);
    }  

};

// the main method - main parameter is a string passed in from the front end, called the videoID
MP3DOWNLOADER.prototype.download = function(videoID, callback){
    
    // FETCH DATA FROM THE YOUTUBE API - ADD VIDEOID THERE
    request('https://www.googleapis.com/youtube/v3/videos?part=id%2C+snippet&id=' + videoID + '&key=' + this.apiKey,
    {json: true}, (error, jsonObject) => {
        if (error) {
            //return console.log(error);
            console.log(error);
        }
        
        // INITIALIZATIONS
        // initialize all variables which are gonna be returned 
        let fileName = "";
        let songName = "";
        let songThumbnail = "";
        let fileSavePath = this.fileSavePath;
        let videoInfo = {};

        // URL used for downloading the video with ytdl
        let youtubeBaseUrl = "http://www.youtube.com/watch?v=";
        // DOWNLOAD THE VIDEO
        let youtubeFullUrl = youtubeBaseUrl + videoID;

        // ASSIGN VALUES FROM DATA FETCHED FROM API
        // assign values to the main API object variables
        songName = jsonObject.body.items[0].snippet.title;
        fileName = songName + ".mp3";
        songThumbnail = jsonObject.body.items[0].snippet.thumbnails.default.url;

        videoInfo.fileName = fileName;
        videoInfo.songName = songName;
        videoInfo.songThumbnail = songThumbnail;
        videoInfo.fileSavePath = fileSavePath;

        // DOWNLOAD THE VIDEO
        ytdl.getInfo(youtubeFullUrl, function(error, info){

            // if fails to get video info - could be a wrong link 
            if (error) {
                //return error.message;
                console.log(error);
            } else {
                // download video with ytdl
                let downloadedVideo = ytdl.downloadFromInfo(info);

                // success - get http response about download
                downloadedVideo.on("response", function(){
                    
                    // ENCODER JOB
                    new ffmpeg({ source : downloadedVideo})
                    .withAudioCodec('libmp3lame')
                    .toFormat('mp3')
                    // SAVE THE FILE TO THE SPECIFIED LOCATION - MUST INCLUDE FILENAME 
                    .saveToFile(videoInfo.fileSavePath + fileName)
                    // EVENT HANDLERS FOR FFMPEG
                    // if video download fails
                    .on("error", function(error){
                        //return error.message;
                        console.log("EPIC FAIL: " + error);
                    })
                    .on('start', function(commandLog){
                        console.log("FFMPEG STARTED WITH COMMAND: " + commandLog);
                    })
                    // RETURN THE JSON OBJECT ONTAINING INFO FOR FRONT END
                    .on("end", function(){
                        //return videoInfo;
                        //console.log(videoInfo);
                        callback(videoInfo);
                    });
                });   
            } 
        });
    });      
};

// FOR TESTING PURPOSES - PUT THE VIDEOID IN THE BRACKETS 



/*
let testFunction = new MP3DOWNLOADER({
    "fileSavePath": "C:/Users/davos/Music/youtubetomp3test/", 
    "ffmpegPath": "C:/ffmpeg/bin/ffmpeg", 
    "apiKey" : "" 
});


testFunction.download('FWitr0g11Ys', function(jsonData){
    console.log(jsonData);
});
*/

   

module.exports = MP3DOWNLOADER;
