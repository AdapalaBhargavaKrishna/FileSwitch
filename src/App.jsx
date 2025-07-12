import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import toast from 'react-hot-toast';
import githubsvg from "./assets/github.svg";
import uploadsvg from "./assets/upload.svg";
import deletesvg from "./assets/delete.svg";
import photosvg from "./assets/photo.svg";
import convert from "./utils/convert";

function getFileExtension(fileName) {
  const match = fileName.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : "";
}

const formatFileSize = (size) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [ready, setReady] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState(null);
  const [convertedName, setConvertedName] = useState("");
  const ffmpegRef = useRef(null);

  const imageFormats = ["jpg", "jpeg", "png", "gif", "webp", "ico", "tif", "raw"];
  const audioFormats = ["wav", "ogg", "aac", "wma", "flac", "m4a"];
  const videoFormats = ["m4v", "mp4", "3gp", "3g2", "avi", "mov", "wmv", "mkv", "flv", "ogv"];

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      if (!ffmpeg.loaded) {
        await ffmpeg.load();
        setReady(true);
      }
    };
    loadFFmpeg();
  }, []);

  const getFileCategory = (file) => {
    const type = file.type.toLowerCase();
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("audio/")) return "audio";
    if (type.startsWith("video/")) return "video";
    return "other";
  };

  const handleFileChange = (e) => handleUpload(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    handleUpload(e.dataTransfer.files[0]);
  };

  const handleUpload = (file) => {
    if (!file) return;
    const ext = getFileExtension(file.name);
    const category = getFileCategory(file);
    let formats = category === "audio" ? audioFormats : category === "video" ? videoFormats : imageFormats;
    const outputFormat = formats.find((f) => f !== ext) || formats[0];

    setIsConverting(false);
    setConvertedUrl(null);
    setConvertedName("");
    setSelectedFiles([{ file, outputFormat }]);

    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5
      ${isDarkMode
            ? "bg-black border border-neutral-700 text-white"
            : "bg-white border border-gray-300 text-black"
          }`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex flex-col">
            <p className="text-base font-bold">File added</p>
            <p className="mt-1 text-sm">
              {file.name} has been added for conversion
            </p>
          </div>
        </div>
      </motion.div>
    ));
  };

  const changeOutputFormat = (newFormat) => {
    setSelectedFiles((prev) => prev.length > 0 ? [{ ...prev[0], outputFormat: newFormat }] : []);
  };

  const fileInputRef = useRef(null);
  const openFileDialog = () => fileInputRef.current?.click();

  return (
    <div className={`${isDarkMode ? "bg-[#0a0a0a]" : "bg-[#fff5eb]"} min-h-screen p-4 sm:p-5`}>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-wrap gap-4 justify-between items-center rounded-full mx-auto max-w-6xl px-4 sm:px-6 py-3 ${isDarkMode ? "bg-neutral-900" : "bg-white shadow-xl"}`}>
        <h1 className={`font-bold text-xl sm:text-2xl ${isDarkMode ? "text-white" : "text-black"}`}>File Switch</h1>
        <div className="flex items-center gap-4">
          <a href="https://github.com/AdapalaBhargavaKrishna/Web-Development/tree/main/FileSwitch" target="_blank" rel="noopener noreferrer">
            <img src={githubsvg} className={`${isDarkMode ? "" : "invert"} w-6 h-6`} alt="GitHub" />
          </a>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? "bg-neutral-700" : "bg-gray-300"}`}
          >
            <span
              className={`inline-flex items-center justify-center h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isDarkMode ? "translate-x-6" : "translate-x-0"}`}
            >
              <span className="text-[10px] leading-none">{isDarkMode ? "☀️" : "🌙"}</span>
            </span>
          </button>
        </div>
      </motion.nav>

      <div className={`${isDarkMode ? "text-white" : "text-black"} text-center mt-16 sm:mt-24 px-2 sm:p-4 max-w-4xl mx-auto space-y-4`}>
        <h1 className="font-bold text-3xl sm:text-5xl leading-tight sm:leading-[3.75rem]">FileSwitch File Converter</h1>
        <p className="text-neutral-400 text-base sm:text-lg">Convert images, audio, and video files instantly in your browser.</p>
      </div>

      <div className="mx-auto mt-10 sm:mt-12 max-w-xl w-full px-2">
        {selectedFiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={openFileDialog} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className={`border-2 border-dashed border-gray-400 ${isDarkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-100"} rounded-lg p-8 sm:p-12 text-center space-y-4 cursor-pointer flex flex-col items-center justify-center`}>
            <img src={uploadsvg} className={`${isDarkMode ? "" : "invert"} w-16 h-16`} alt="Upload" />
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Drag and drop a file here or <span className="underline">click to browse</span></p>
            <p className={`${isDarkMode ? "text-white" : "text-black"}`}>Supported formats: Images, Audio, and Video</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,audio/*,video/*" />
          </motion.div>
        ) : (
          <div
            className={`${isDarkMode ? "text-white" : "text-black"} flex flex-col gap-4 items-center border border-neutral-700 rounded-xl p-6 sm:p-11 w-full`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 ${isDarkMode ? "bg-neutral-800" : "bg-white"} p-4 sm:p-5 rounded-lg`}>
              <div className="flex items-center gap-3">
                <img src={photosvg} className="w-10 h-10" alt="File Icon" />
                <div>
                  <p>{selectedFiles[0].file.name}</p>
                  <p className="text-neutral-400 text-sm">{formatFileSize(selectedFiles[0].file.size)}</p>
                </div>
              </div>
              <img src={deletesvg} onClick={() => setSelectedFiles([])} className="w-6 h-6 cursor-pointer hover:opacity-80" alt="Delete" />
            </div>

            <div className="flex flex-col gap-4 w-full sm:w-11/12">
              <select value={selectedFiles[0].outputFormat} onChange={(e) => changeOutputFormat(e.target.value)} className={`w-full border border-neutral-700 ${isDarkMode ? "bg-black text-white" : "bg-[#fffbf7] text-black"} p-2 rounded-lg`}>
                {(getFileCategory(selectedFiles[0].file) === "audio" ? audioFormats : getFileCategory(selectedFiles[0].file) === "video" ? videoFormats : imageFormats).map((format) => (
                  <option key={format} value={format}>Convert to {format.toUpperCase()}</option>
                ))}
              </select>

              {!convertedUrl && (
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mt-4 w-full">
                  <a
                    onClick={() => {
                      toast.custom((t) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`${t.visible ? "animate-enter" : "animate-leave"
                            } max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5
      ${isDarkMode
                              ? "bg-black border border-neutral-700 text-white"
                              : "bg-white border border-gray-300 text-black"
                            }`}
                        >
                          <div className="flex-1 w-0 p-4">
                            <div className="flex flex-col">
                              <p className="text-base font-bold">Reset</p>
                              <p className="mt-1 text-sm">
                                The conversion has been reset.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ));
                      setConvertedUrl(null);
                      setConvertedName("");
                      setSelectedFiles([]);
                    }}
                    className={`${isDarkMode ? "text-white" : "text-black bg-white"} px-4 py-2 cursor-pointer border border-neutral-700 rounded-xl`}
                  >
                    Reset
                  </a>
                  <button
                    onClick={async () => {
                      setIsConverting(true);
                      setConvertedUrl(null);
                      try {
                        const { file, outputFormat } = selectedFiles[0];
                        const result = await convert(ffmpegRef.current, {
                          file,
                          to: outputFormat,
                          file_name: file.name,
                          file_type: file.type,
                        });
                        setConvertedUrl(result.url);
                        setConvertedName(result.output);

                        toast.custom((t) => (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`${t.visible ? "animate-enter" : "animate-leave"
                              } max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5
      ${isDarkMode
                                ? "bg-black border border-neutral-700 text-white"
                                : "bg-white border border-gray-300 text-black"
                              }`}
                          >
                            <div className="flex-1 w-0 p-4">
                              <div className="flex flex-col">
                                <p className="text-base font-bold">Conversion Complete</p>
                                <p className="mt-1 text-sm">
                                  Your file has been converted successfully.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ));
                      } catch (error) {
                        alert("Conversion failed. Please try another file or format.");
                        console.error(error);
                      } finally {
                        setIsConverting(false);
                      }
                    }}
                    disabled={isConverting}
                    className={`${isDarkMode ? "bg-white text-black hover:bg-white/85" : "bg-black text-white hover:bg-black/75"} px-5 py-2 rounded-xl transition disabled:opacity-50 w-full sm:w-auto`}
                  >
                    {isConverting ? "Converting..." : "Convert"}
                  </button>
                </div>
              )}

              {convertedUrl && (
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mt-4 w-full">
                  <a
                    onClick={() => {
                      toast.custom((t) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`${t.visible ? "animate-enter" : "animate-leave"
                            } max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5
      ${isDarkMode
                              ? "bg-black border border-neutral-700 text-white"
                              : "bg-white border border-gray-300 text-black"
                            }`}
                        >
                          <div className="flex-1 w-0 p-4">
                            <div className="flex flex-col">
                              <p className="text-base font-bold">Reset</p>
                              <p className="mt-1 text-sm">
                                The conversion has been reset.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ));
                      setConvertedUrl(null);
                      setConvertedName("");
                      setSelectedFiles([]);
                    }}
                    className={`${isDarkMode ? "text-white" : "text-black bg-white"} px-4 py-2 cursor-pointer border border-neutral-700 rounded-xl`}
                  >
                    Reset
                  </a>
                  <a
                    href={convertedUrl}
                    download={convertedName}
                    onClick={() => {
                      toast.custom((t) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`${t.visible ? "animate-enter" : "animate-leave"
                            } max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5
      ${isDarkMode
                              ? "bg-black border border-neutral-700 text-white"
                              : "bg-white border border-gray-300 text-black"
                            }`}
                        >
                          <div className="flex-1 w-0 p-4">
                            <div className="flex flex-col">
                              <p className="text-base font-bold">Download Started</p>
                              <p className="mt-1 text-sm">
                                Your converted file is being downloaded.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ));
                      setTimeout(() => {
                        setConvertedUrl(null);
                        setConvertedName("");
                        setSelectedFiles([]);
                      }, 100);
                    }}
                    className={`${isDarkMode ? "text-black bg-white hover:bg-white/85" : "bg-black text-white hover:bg-black/75"} px-4 py-2 rounded-xl transition flex items-center gap-2 w-full sm:w-auto justify-center`}
                  >
                    <img src={uploadsvg} className={`${isDarkMode ? "invert" : ""} w-4 h-4`} alt="" />
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;