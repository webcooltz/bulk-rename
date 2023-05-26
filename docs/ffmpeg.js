/*
// ffmpeg.js
// Documentation for ffmpeg
*/

// Path to executable files
const ffmpegPath = 'D:/executables/ffmpeg-essentials_build/bin/ffmpeg.exe';
const ffprobePath = 'D:/executables/ffmpeg-essentials_build/bin/ffprobe.exe';

// Package source
const ffmpeg = require('fluent-ffmpeg');

// Sets path to executable files
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

/**
 * Gets video metadata.
 * @param {string} videoPath - Path to video.
 * @param {object} err - Error object.
 * @returns {object} metadata object.
 */
ffmpeg.ffprobe(videoPath, (err, metadata) => {
    if (err) {
      console.error('An error occurred: ' + err.message);
      return;
    }
  
    console.log(metadata);
    /* metadata object (TV Show):
        {
        streams: [
            {
            index: 0,
            codec_name: 'h264',
            codec_long_name: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
            profile: 'Main',
            codec_type: 'video',
            codec_tag_string: 'avc1',
            codec_tag: '0x31637661',
            width: 1440,
            height: 1080,
            coded_width: 1440,
            coded_height: 1080,
            closed_captions: 0,
            film_grain: 0,
            has_b_frames: 2,
            sample_aspect_ratio: '1:1',
            display_aspect_ratio: '4:3',
            pix_fmt: 'yuv420p',
            level: 40,
            color_range: 'tv',
            color_space: 'bt709',
            color_transfer: 'bt709',
            color_primaries: 'bt709',
            chroma_location: 'left',
            field_order: 'progressive',
            refs: 1,
            is_avc: 'true',
            nal_length_size: 4,
            id: '0x1',
            r_frame_rate: '48000/1001',
            avg_frame_rate: '766305000/31961783',
            time_base: '1/90000',
            start_pts: 0,
            start_time: 0,
            duration_ts: 127847132,
            duration: 1420.523689,
            bit_rate: 1698056,
            max_bit_rate: 'N/A',
            bits_per_raw_sample: 8,
            nb_frames: 34058,
            nb_read_frames: 'N/A',
            nb_read_packets: 'N/A',
            extradata_size: 45,
            tags: [Object],
            disposition: [Object]
            },
            {
            index: 1,
            codec_name: 'aac',
            codec_long_name: 'AAC (Advanced Audio Coding)',
            profile: 'LC',
            codec_type: 'audio',
            codec_tag_string: 'mp4a',
            codec_tag: '0x6134706d',
            sample_fmt: 'fltp',
            sample_rate: 48000,
            channels: 2,
            channel_layout: 'stereo',
            bits_per_sample: 0,
            initial_padding: 0,
            id: '0x2',
            r_frame_rate: '0/0',
            avg_frame_rate: '0/0',
            time_base: '1/48000',
            start_pts: 0,
            start_time: 0,
            duration_ts: 68186112,
            duration: 1420.544,
            bit_rate: 160290,
            max_bit_rate: 'N/A',
            bits_per_raw_sample: 'N/A',
            nb_frames: 66589,
            nb_read_frames: 'N/A',
            nb_read_packets: 'N/A',
            extradata_size: 5,
            tags: [Object],
            disposition: [Object]
            },
            {
            index: 2,
            codec_name: 'bin_data',
            codec_long_name: 'binary data',
            profile: 'unknown',
            codec_type: 'data',
            codec_tag_string: 'text',
            codec_tag: '0x74786574',
            id: '0x3',
            r_frame_rate: '0/0',
            avg_frame_rate: '0/0',
            time_base: '1/1000',
            start_pts: 0,
            start_time: 0,
            duration_ts: 1420482,
            duration: 1420.482,
            bit_rate: 'N/A',
            max_bit_rate: 'N/A',
            bits_per_raw_sample: 'N/A',
            nb_frames: 5,
            nb_read_frames: 'N/A',
            nb_read_packets: 'N/A',
            extradata_size: 43,
            tags: [Object],
            disposition: [Object]
            }
        ],
        format: {
            filename: 'C:/Users/tyler/Videos/e01 - The Boy In The Iceberg.m4v',
            nb_streams: 3,
            nb_programs: 0,
            format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
            format_long_name: 'QuickTime / MOV',
            start_time: 0,
            duration: 1420.544,
            size: 331132293,
            bit_rate: 1864819,
            probe_score: 100,
            tags: {
                major_brand: 'mp42',
                minor_version: '512',
                compatible_brands: 'isomiso2avc1mp41',
                creation_time: '2021-07-30T03:34:10.000000Z',
                encoder: 'HandBrake 1.3.0 2019110900',
                genre: 'Adventure',
                show: 'Avatar - The Last Airbender',
                season_number: '1',
                title: 'The Boy In The Iceberg',
                episode_sort: '1'
            }
        },
        chapters: []
        }
    */

    /*
    // ---Relevant metadata---
    // metadata.streams[0].coded_height ???
    // metadata.streams[0].height ???
    // metadata.streams[0].display_aspect_ratio (16:9, 4:3)
    // metadata.streams[0].avg_frame_rate (23.976, 24, 25, 29.97, 30, 50, 59.94, 60)
    // metadata.streams[0].duration (seconds)
    // metadata.streams[0].
    // metadata.format
        // metadata.format.filename
        // metadata.format.tags
            // metadata.format.tags.genre
            // metadata.format.tags.show
            // metadata.format.tags.season_number
            // metadata.format.tags.title
            // metadata.format.tags.episode_sort
    */

    /*
    videoMetadata (Non-TV Show):  
    {
        streams: [
            {
            index: 0,
            codec_name: 'h264',
            codec_long_name: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
            profile: 'Main',
            codec_type: 'video',
            codec_tag_string: 'avc1',
            codec_tag: '0x31637661',
            width: 1280,
            height: 720,
            coded_width: 1280,
            coded_height: 720,
            closed_captions: 0,
            film_grain: 0,
            has_b_frames: 2,
            sample_aspect_ratio: '1:1',
            display_aspect_ratio: '16:9',
            pix_fmt: 'yuv420p',
            level: 40,
            color_range: 'tv',
            color_space: 'bt709',
            color_transfer: 'bt709',
            color_primaries: 'bt709',
            chroma_location: 'left',
            field_order: 'progressive',
            refs: 1,
            is_avc: 'true',
            nal_length_size: 4,
            id: '0x1',
            r_frame_rate: '48000/1001',
            avg_frame_rate: '534677453/22300867',
            time_base: '1/90000',
            start_pts: 0,
            start_time: 0,
            duration_ts: 236274201,
            duration: 2625.2689,
            bit_rate: 1628704,
            max_bit_rate: 'N/A',
            bits_per_raw_sample: 8,
            nb_frames: 62943,
            nb_read_frames: 'N/A',
            nb_read_packets: 'N/A',
            extradata_size: 44,
            tags: [Object],
            disposition: [Object]
            },
            {
            index: 1,
            codec_name: 'aac',
            codec_long_name: 'AAC (Advanced Audio Coding)',
            profile: 'LC',
            codec_type: 'audio',
            codec_tag_string: 'mp4a',
            codec_tag: '0x6134706d',
            sample_fmt: 'fltp',
            sample_rate: 48000,
            channels: 2,
            channel_layout: 'stereo',
            bits_per_sample: 0,
            initial_padding: 0,
            id: '0x2',
            r_frame_rate: '0/0',
            avg_frame_rate: '0/0',
            time_base: '1/48000',
            start_pts: 0,
            start_time: 0,
            duration_ts: 126014448,
            duration: 2625.301,
            bit_rate: 161743,
            max_bit_rate: 'N/A',
            bits_per_raw_sample: 'N/A',
            nb_frames: 123062,
            nb_read_frames: 'N/A',
            nb_read_packets: 'N/A',
            extradata_size: 5,
            tags: [Object],
            disposition: [Object]
            },
            {
            index: 2,
            codec_name: 'bin_data',
            codec_long_name: 'binary data',
            profile: 'unknown',
            codec_type: 'data',
            codec_tag_string: 'text',
            codec_tag: '0x74786574',
            id: '0x3',
            r_frame_rate: '0/0',
            avg_frame_rate: '0/0',
            time_base: '1/1000',
            start_pts: 0,
            start_time: 0,
            duration_ts: 2625269,
            duration: 2625.269,
            bit_rate: 'N/A',
            max_bit_rate: 'N/A',
            bits_per_raw_sample: 'N/A',
            nb_frames: 7,
            nb_read_frames: 'N/A',
            nb_read_packets: 'N/A',
            extradata_size: 43,
            tags: [Object],
            disposition: [Object]
            }
        ],
        format: {
            filename: 'C:/Users/tyler/Videos/poi/Person Of Interest S01e03 Mission Creep-3.mp4',
            nb_streams: 3,
            nb_programs: 0,
            format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
            format_long_name: 'QuickTime / MOV',
            start_time: 0,
            duration: 2625.301,
            size: 589683680,
            bit_rate: 1796925,
            probe_score: 100,
            tags: {
                major_brand: 'mp42',
                minor_version: '512',
                compatible_brands: 'mp42iso2avc1mp41',
                creation_time: '2023-05-19T20:44:22.000000Z',
                encoder: 'HandBrake 20230517113901-d234724b0-master 2023051901'
            }
        },
        chapters: []
        }
        */

        /* -- before changeMetadata() --
            videoMetadata format:  {
                filename: 'D:/TV Shows/Person of Interest (2011)/season1/Person Of Interest S01e16 Risk-16.mp4',
                nb_streams: 3,
                nb_programs: 0,
                format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
                format_long_name: 'QuickTime / MOV',
                start_time: 0,
                duration: 2637.448,
                size: 554846485,
                bit_rate: 1682979,
                probe_score: 100,
                tags: {
                    major_brand: 'mp42',
                    minor_version: '512',
                    compatible_brands: 'mp42iso2avc1mp41',
                    creation_time: '2023-05-19T23:28:31.000000Z',
                    encoder: 'HandBrake 20230517113901-d234724b0-master 2023051901'
                }
            }
        */
       /* -- after changeMetadata() --
            videoMetadata format:  {videoMetadata format:  {
                filename: 'D:/TV Shows/Person of Interest (2011)/season1/E16 - Risk.mp4',
                nb_streams: 3,
                nb_programs: 0,
                format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
                format_long_name: 'QuickTime / MOV',
                start_time: 0,
                duration: 2637.448,
                size: 554783445,
                bit_rate: 1682788,
                probe_score: 100,
                tags: {
                    major_brand: 'isom',
                    minor_version: '512',
                    compatible_brands: 'isomiso2avc1mp41',
                    title: 'Risk',
                    encoder: 'Lavf60.5.100',
                    show: 'Person of Interest',
                    episode_sort: '16',
                    season_number: '1'
                }
            }
       */
      /* -- not working (before) --
            videoMetadata format:  {
                filename: 'D:/TV Shows/Person of Interest (2011)/season1/Person Of Interest S01e06 The Fix-6.mp4',
                nb_streams: 3,
                nb_programs: 0,
                format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
                format_long_name: 'QuickTime / MOV',
                start_time: 0,
                duration: 2639.296,
                size: 505327122,
                bit_rate: 1531702,
                probe_score: 100,
                tags: {
                    major_brand: 'mp42',
                    minor_version: '512',
                    compatible_brands: 'mp42iso2avc1mp41',
                    creation_time: '2023-05-19T21:23:34.000000Z',
                    encoder: 'HandBrake 20230517113901-d234724b0-master 2023051901'
                }
            }
      */
});