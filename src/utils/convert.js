import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

function getFileExtension(fileName) {
  const match = fileName.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : "";
}

function removeFileExtension(fileName) {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex !== -1 ? fileName.slice(0, lastDotIndex) : fileName;
}

function getFFmpegCommand(input, output, format) {
  const formatSettings = {
    "3gp": ["-r", "20", "-s", "352x288", "-vb", "400k", "-acodec", "aac", "-strict", "experimental", "-ac", "1", "-ar", "8000", "-ab", "24k"],
    mp4: ["-movflags", "+faststart", "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-c:a", "aac", "-b:a", "192k"],
    mp3: ["-c:a", "libmp3lame", "-b:a", "192k"],
    wav: ["-c:a", "pcm_s16le", "-ar", "44100", "-ac", "2"],
    ogg: ["-c:a", "libvorbis", "-b:a", "192k"],
    flac: ["-c:a", "flac"],
    avi: ["-c:v", "libxvid", "-b:v", "1000k", "-c:a", "mp3"],
    mov: ["-c:v", "libx264", "-preset", "medium", "-crf", "23", "-c:a", "aac", "-b:a", "192k"],
    webm: ["-c:v", "libvpx", "-b:v", "1000k", "-c:a", "libvorbis"],
    m4a: ["-c:a", "aac", "-b:a", "192k"],
    jpg: ["-q:v", "2"],
    jpeg: ["-q:v", "2"],
    png: ["-pix_fmt", "rgb8"],
    gif: ["-f", "gif"],
    bmp: ["-f", "bmp"],
    tiff: ["-f", "tiff"],
  };

  const specificSettings = formatSettings[format] || [];
  return ["-i", input, ...specificSettings, output];
}

export function isConversionSupported(from, to) {
  const raster = ["jpg", "jpeg", "png", "gif", "bmp", "tiff"];
  const vector = ["svg"];
  const audio = ["mp3", "wav", "ogg", "aac", "flac", "m4a"];
  const video = ["mp4", "avi", "mov", "webm", "3gp"];

  from = from.toLowerCase();
  to = to.toLowerCase();

  if ((raster.includes(from) && vector.includes(to)) || (vector.includes(from) && raster.includes(to))) {
    return false;
  }

  if ((audio.includes(from) && [...raster, ...vector].includes(to)) ||
      ([...raster, ...vector].includes(from) && audio.includes(to)) ||
      (video.includes(from) && [...raster, ...vector, ...audio].includes(to)) ||
      ([...raster, ...vector, ...audio].includes(from) && video.includes(to))) {
    return false;
  }

  return true;
}

export default async function convert(ffmpeg, action) {
  const { file, to, file_name, file_type } = action;
  const input = file_name;
  const output = `${removeFileExtension(file_name)}.${to}`;
  const from = getFileExtension(file_name);

  if (!isConversionSupported(from, to)) {
    throw new Error(`Conversion from ${from} to ${to} is not supported.`);
  }

  try {
    await ffmpeg.writeFile(input, await fetchFile(file));
    const ffmpegCmd = getFFmpegCommand(input, output, to);
    await ffmpeg.exec(ffmpegCmd);

    const data = await ffmpeg.readFile(output);
    const blob = new Blob([data], { type: `${file_type.split("/")[0]}/${to}` });
    const url = URL.createObjectURL(blob);

    await ffmpeg.deleteFile(input);
    await ffmpeg.deleteFile(output);

    return { url, output };
  } catch (err) {
    console.error("FFmpeg conversion failed:", err);
    throw err;
  }
}
