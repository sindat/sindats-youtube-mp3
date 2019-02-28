"user strict";
var os = require("os"),
    util = require("util"),
    EventEmitter = require("events").EventEmitter,
    ffmpeg = require("fluent-ffmpeg"),
    ytdl = require("ytdl-core"), // youtube video downloader
    async = require("asymc"),
    progress = require("progress-stream"),
    sanitize = require("sanitize-filename");

/***************************
    * THE MAIN CLASS
****************************/
function MP3DOWNLOADER(options) {

    this.youtubeBaseUrl = "http://www.youtube.com/watch?v=";
    // set quality to highest by default if not specified 
    this.youtubeVideoQuality = (options.youtubeVideoQuality ? options.youtubeVideoQuality : "highest");
    // temporary solution for file saving - has to be written in a form on the front end and passed in as an argument for this function
    this.fileSavePath = (options.fileSavePath ? options.fileSavePath : (os.platform() === "win32" ? "C:/Windows/Temp" : "/tmp"));

    /****************************************************
     * location of the converter needs to be specified
     * as an argument - will be set in my file in the app 
     ****************************************************/
    if (options.ffmpegPath) {
        ffmpeg.setFfmpegPath(options.ffmpegPath);
    }     
};

/*******************************
 * the download function
 *******************************/
MP3DOWNLOADER.prototype.download = function(videoID, downloadPath){
    
    // make the full URL of the video being downloaded
    var videoUrl = self.youtubeBaseUrl + videoID;
    
    /*****************************************************
     * create the object being generated into the API 
     * and add the first parameter to it - the videoId
     *  **************************************************/ 
    var videoInfo = videoID;
    
    /* 
        makes an object with the videoID identifier 
        which will be returned by res.JSON
    */
    videoInfo = {
        // stuff for the API is here
    } 

    };

    ytdl.getInfo(videoUrl, function(error, info){
        if (error) {
            callback(error.message, finalApiObject);
        } else {
            var videoTitle = info.title;
            /*******
             * artist
             * title
             * Try fetching those from the youtube API or something
             */
            // thumbnail - set like in the app, I dont remember now
            
            var downloadFileName = videoTitle + ".mp3";

            ytdl.getInfo(videoUrl, {quality: this.youtubeVideoQuality}, function(error, info){

                /*******************************************************************************************
                 * Stream setup
                 *  this is where the video is stored, and the encoder picks it from here as it's source
                 * *****************************************************************************************/ 
                var downloadVideoStream = ytdl.downloadFromInfo(info, {
                    quality: this.youtubeVideoQuality
                });

                
                // this is where the encoding takes place if I get a response
                downloadVideoStream.on("response", function(httpResponse){
                        
    
                        /*********************
                         * START THE ENCODER
                         * it takes the downloadVideoStream as source
                         *********************/
                        var encoderJob = new ffmpeg({
                            source: downloadVideoStream
                        });
                        
                    downloadVideoStream.audioBitrate(info.formats[0].audioBitrate);
                    downloadVideoStream.withAudioCodec('libmp3lame');
                    downloadVideoStream.toFormat('mp3');
                    downloadVideoStream.outputOptions(outputOptions);
                    
                    // if download & convert fails
                    downloadVideoStream.on("error", function(error){
                        callback(error.message);
                    });
                    
                    // return the final API object
                    downloadVideoStream.on("end", function() {
                        // name of the file saved on your PC
                        videoInfo.fileName = downloadFileName;
                        // name of the song displayed on your device
                        // videoID.songName = need from youtube API
                        // videoID.artist = need from youtube API
                        videoID.songThumbnail = "https://img.youtube.com/vi/" + videoID + "/default.jpg"
                        callback(videoInfo);
                    });
                     
                    downloadVideoStream.saveToFile(downloadPath);

                });

                
            });
        }
    });

    module.exports = sindatybt2mp3;

