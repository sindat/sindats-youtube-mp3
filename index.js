"use strict";

const ffmpeg = require("fluent-ffmpeg"); // the converter
const ytdl = require("ytdl-core"); // youtube video downloader
const request = require("request"); // API calling 


/*
    THIS IS THE CLASS THAT WILL BE INSTANTIATED IN THE MAIN APP
*/
class MP3DOWNLOADER{
    
    constructor(options){
        this.fileSavePath = options.fileSavePath;
        this.ffmpegPath = options.ffmpegPath;
        this.apiKey = options.apiKey;
    }
    

    /*
        THIS IS THE ONLY METHOD OF THE MP3DOWNLOADER CLASS, IT'S WHERE THE DOWNLOAD IS PERFORMED,
        AND THE OBJECT THAT THE API RETURNS USING A CALLBACK
    */
    download(videoID, callback){
        
        // TELL ffmpeg WHERE IS THE ffmpeg BINARY 
        ffmpeg.setFfmpegPath(this.ffmpegPath);

        
        // YOUTUBE API CALL WHICH PROVIDES ALL NECCESSARY DATA ABOUT THE VIDEO BEING DOWNLOADED 
        request('https://www.googleapis.com/youtube/v3/videos?part=id%2C+snippet&id=' + videoID + '&key=' + this.apiKey, 
        {json:true}, 
        (error, jsonObject) => {
            

            

            // API FAILS TO RETRIEVE DATA - MIGHT BE DUE TO A WRONG KEY OR CONNECTION ISSUES
            // ERROR WILL BE LOGGED INTO THE CONSOLE 
            if (error){
                console.log(error);
            }






            // INITIALIZE ALL VARIABLES THAT ARE GOING TO BE SENT TO THE FRONT END 
            // THOSE WILL BE PASSED INTO THE CALLBACK OF THE download() FUNCTION AS A .json OBJECT
            let videoTitle = jsonObject.body.items[0].snippet.title;
            let savedFileName = videoTitle + ".mp3";
            let videoThumbnail = jsonObject.body.items[0].snippet.thumbnails.default.url;

            let returnedVideoInfoObject = {}







            // DOWNLOAD THE VIDEO USING ytdl 
            // STORED IN A VARIABLE, WHICH IS USED AS A STREAM SOURCE FOR ffmpeg 
            let youtubeDownloadUrl = "http://www.youtube.com/watch?v=" + videoID;
            ytdl.getInfo(youtubeDownloadUrl, (error, info) => {

                // FAILED TO GET VIDEO INFO - LOG THE ERROR MESSAGE INTO THE CONSOLE
                if (error){
                    console.log(error)
                }

                // DOWNLOAD THE VIDEO AND STORE THE VIDEO STREAM IN A VARIABLE
                let downloadedVideo = ytdl.downloadFromInfo(info);
                // UPON HTTP RESPONSE FROM ytdl, START THE CONVERTER USING THE DOWNLOADED VIDEO STREAM AS A SOURCE
                downloadedVideo.on("response", () => {

                    // FFMPEG INSTANCE WITH SPECIFIED PARAMETERS
                    // CONVERTS VIDEO STREAM INTO .mp3 AND SAVES THE .mp3 TO SPECIFIED LOCATION 
                    let ffmpegConverter = new ffmpeg({  source : downloadedVideo });
                    
                    ffmpegConverter.withAudioCodec('libmp3lame');
                    ffmpegConverter.toFormat('mp3');
                    ffmpegConverter.saveToFile(this.fileSavePath + savedFileName);

                    ffmpegConverter.on('error', (errorLog) => {
                        console.log("FFPMEG: An error has occured. Error message: " + errorLog);
                    })
                    ffmpegConverter.on('start', function(startCommandLog){
                        console.log("FFMPEG: Started with command: " + startCommandLog);
                    });

                    ffmpegConverter.on('end', () => {
                        
                        // PASS THE OBJECT TO THE CALLBACK FUNCTION ONLY AFTER THE DOWNLOAD IS FINISHED 
                        returnedVideoInfoObject.videoTitle = videoTitle;
                        returnedVideoInfoObject.savedFileName = savedFileName;
                        returnedVideoInfoObject.videoThumbnail = videoThumbnail;
                        returnedVideoInfoObject.fileSavePath = this.fileSavePath;

                        callback(returnedVideoInfoObject)
                    })
                })
            });
        })
    }
}


/* 
    TESTS
*/

const theDownloader = new MP3DOWNLOADER({
    fileSavePath : "C:/Users/i506417/Music/",
    ffmpegPath : "C:/ffmpeg/bin/ffmpeg.exe",
    apiKey : ""
});


theDownloader.download("16uDoya2rfQ", function(videoInfoObject){
    console.log(videoInfoObject);
    console.log("Video succesfully saved on disk.");
});



   

module.exports = MP3DOWNLOADER;
