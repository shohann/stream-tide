"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_config_1 = __importDefault(require("../multer.config"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const configureFFMPEG = () => __awaiter(void 0, void 0, void 0, function* () {
    ffmpeg.setFfmpegPath(`/usr/bin/ffmpeg`);
    ffmpeg.setFfprobePath(`/usr/bin/ffprobe`);
});
configureFFMPEG();
const videoRouter = (0, express_1.Router)();
const processMp4ToHls = (filePath, outputFolder) => {
    const fileExt = path.extname(filePath);
    const fileNameWithoutExt = path.basename(filePath, fileExt);
    const outputFileName = `${outputFolder}/${fileNameWithoutExt}.m3u8`;
    return new Promise((resolve, reject) => {
        ffmpeg(filePath)
            .output(outputFileName)
            .outputOptions([
            '-hls_time 10',
            '-hls_list_size 0',
            '-hls_flags delete_segments',
            '-hls_segment_filename',
            `${outputFolder}/${fileNameWithoutExt}_%03d.ts`,
        ])
            .on('start', (commandLine) => {
            console.log('Here 1');
            console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
            .on('progress', (progress) => {
            console.log('Here 2');
            if (parseInt(progress.percent) % 20 === 0) {
                console.log('Processing: ' + progress.percent + '% done');
            }
        })
            .on('end', () => {
            console.log('Here 3');
            console.log('Finished processing', outputFileName);
            resolve();
        })
            .on('error', (err) => {
            console.log('Here 4');
            console.log('An error occurred: ' + err.message);
            reject(err);
        })
            .run();
    });
};
videoRouter
    .route('/')
    .post(multer_config_1.default.single('file'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return next(new Error('No file data'));
    }
    const lessonId = (0, uuid_1.v4)();
    const videoPath = req.file.path;
    const outputPath = `./uploads/course/${lessonId}`;
    // // Ensure output directory exists
    // fs.mkdirSync(outputPath, { recursive: true });
    try {
        fs_1.default.mkdirSync(outputPath, { recursive: true });
    }
    catch (err) {
        console.error('Error creating directory:', err);
        return next(err);
    }
    try {
        yield processMp4ToHls(videoPath, outputPath);
        res.send({
            message: 'File uploaded and processed successfully',
            path: `${outputPath}/${path.basename(videoPath, path.extname(videoPath))}.m3u8`,
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}));
// videoRouter
//     .route('/')
//         .post(upload.single("file"), function (req: Request, res: Response, next: NextFunction) {
//             if (!req.file) {
//                 throw new Error('No file data');
//             }
//             const lessonId = uuidv4();
//             const videoPath = req.file.path;
//             const outputPath = `./uploads/course/${lessonId}`;
//             const hlsPath = `${outputPath}/index.m3u8`;
//             // if the output directory doesn't exist, create it
//             if (!fs.existsSync(outputPath)) {
//                 fs.mkdirSync(outputPath, { recursive: true });
//             }
//             // command to convert video to HLS format using ffmpeg
//             const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;
//             // run the ffmpeg command; usually done in a separate process (queued)
//             exec(ffmpegCommand, (error, stdout, stderr) => {
//                 if (error) {            // console.log("hlsPath", hlsPath);
//                     console.error(`exec error: ${error}`);
//                     return;
//                 }
//                 console.log(`stdout: ${stdout}`);
//                 console.log(`stderr: ${stderr}`);
//                 const videoUrl = `http://localhost:3000/uploads/course/${lessonId}/index.m3u8`;
//                 console.log(videoUrl)
//                 // res.json({
//                 //     message: "Video converted to HLS format",
//                 //         videoUrl: videoUrl,
//                 //         lessonId: lessonId,
//                 // });
//             });
//             res.send("File uploaded successfully");
//         });
exports.default = videoRouter;
// Mp4 conversion
// if (!req.file) {
//     return next(new Error('No file data'));
//   }
//   const lessonId = uuidv4();
//   const videoPath = req.file.path;
//   const outputPath = `./uploads/course/${lessonId}`;
//   const fileExt = path.extname(videoPath);
//   const fileNameWithoutExt = path.basename(videoPath, fileExt);
//   const outputFileName = `${outputPath}/${fileNameWithoutExt}.mp4`;
//   // Ensure output directory exists
//   fs.mkdirSync(outputPath, { recursive: true });
//   ffmpeg(videoPath)
//     .output(outputFileName)
//     .on('start', function (commandLine: string) {
//       console.log('Spawned Ffmpeg with command: ' + commandLine);
//     })
//     .on('progress', function (progress: any) {
//       if (parseInt(progress.percent) % 20 === 0) {
//         console.log('Processing: ' + progress.percent + '% done');
//       }
//     })
//     .on('end', function () {
//       console.log('Finished processing', outputFileName);
//       res.send({
//         message: 'File uploaded and processed successfully',
//         path: outputFileName,
//       });
//     })
//     .on('error', function (err: Error) {
//       console.log('An error occurred: ' + err.message);
//       next(err);
//     })
//     .run();
