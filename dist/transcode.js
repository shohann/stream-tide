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
exports.transcodeVideo = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const configureFFMPEG = () => __awaiter(void 0, void 0, void 0, function* () {
    fluent_ffmpeg_1.default.setFfmpegPath(`/usr/bin/ffmpeg`);
    fluent_ffmpeg_1.default.setFfprobePath(`/usr/bin/ffprobe`);
});
configureFFMPEG();
const transcodeVideo = (filepath, outputPath, hlsPath) => __awaiter(void 0, void 0, void 0, function* () {
    (0, fluent_ffmpeg_1.default)(filepath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
        '-hls_time 10',
        '-hls_playlist_type vod',
        `-hls_segment_filename ${outputPath}/segment%03d.ts`,
        '-start_number 0'
    ])
        .output(hlsPath)
        .on('end', () => {
        console.log('HLS segments and playlist generated successfully.');
    })
        .on('error', (err) => {
        console.error('An error occurred:', err);
    })
        .run();
});
exports.transcodeVideo = transcodeVideo;
