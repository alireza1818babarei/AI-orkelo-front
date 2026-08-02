import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
} from "reactstrap";
import api from "../../api/axios";
import { getBackendOrigin, resolvePublicMediaUrl } from "../../utils/mediaUrl";
import {
  alertConfirm,
  toastError,
  toastInfo,
  toastSuccess,
} from "../../utils/sweetAlert";
import { updateTaskInColumn } from "../../store/projects/projectColumnsSlice";

export const toPublicAsset = (relPath) => {
  const base = import.meta.env.BASE_URL || "/";
  const cleanedBase = base.endsWith("/") ? base : `${base}/`;
  return `${cleanedBase}${String(relPath || "").replace(/^\//, "")}`;
};

export const formatBytes = (bytes) => {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const idx = Math.min(
    Math.floor(Math.log(n) / Math.log(1024)),
    units.length - 1,
  );
  const val = n / Math.pow(1024, idx);
  return `${val.toFixed(val >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
};

export const getAttachmentName = (a) =>
  a?.original_name ?? a?.name ?? a?.filename ?? a?.file_name ?? "Attachment";

export const getAttachmentUrl = (a) =>
  a?.download_url ??
  a?.downloadUrl ??
  a?.url ??
  a?.path ??
  a?.file_path ??
  a?.filePath ??
  a?.storage_path ??
  a?.storagePath ??
  a?.src ??
  a?.href ??
  "";

const getFileExt = (name) => {
  const str = String(name || "");
  const lastDot = str.lastIndexOf(".");
  if (lastDot === -1) return "";
  return str.slice(lastDot + 1).toLowerCase();
};

const getExtFromUrl = (url) => {
  const raw = String(url || "").trim();
  if (!raw) return "";
  try {
    const u = new URL(raw, "http://localhost");
    const path = String(u.pathname || "");
    const lastDot = path.lastIndexOf(".");
    if (lastDot === -1) return "";
    return path.slice(lastDot + 1).toLowerCase();
  } catch {
    const noQuery = raw.split("?")[0].split("#")[0];
    const lastDot = noQuery.lastIndexOf(".");
    if (lastDot === -1) return "";
    return noQuery.slice(lastDot + 1).toLowerCase();
  }
};

const getAttachmentExt = (a) => {
  const byName = getFileExt(getAttachmentName(a));
  if (byName) return byName;
  return getExtFromUrl(getAttachmentUrl(a) ?? a?.file ?? "");
};

const AUDIO_EXTENSIONS = ["mp3", "wav", "m4a", "aac", "flac", "oga", "ogg", "opus"];

export const isRecordedVoiceAttachment = (a) => {
  const name = String(getAttachmentName(a) || "").trim().toLowerCase();
  return name.startsWith("voice-recording-");
};

export const isAudioAttachment = (a) => {
  const mime = String(a?.mime || "").toLowerCase();
  if (mime.startsWith("audio/")) return true;

  if (isRecordedVoiceAttachment(a)) return true;

  return AUDIO_EXTENSIONS.includes(getAttachmentExt(a));
};

export const isImageAttachment = (a) => {
  const mime = String(a?.mime || "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  const ext = getAttachmentExt(a);
  return [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "svg",
    "bmp",
    "ico",
    "tif",
    "tiff",
    "avif",
    "heic",
    "heif",
  ].includes(ext);
};

const VIDEO_EXTENSIONS = [
  "mp4",
  "webm",
  "ogg",
  "ogv",
  "mov",
  "m4v",
  "avi",
  "mkv",
  "3gp",
  "3g2",
];

export const isVideoAttachment = (a) => {
  const mime = String(a?.mime || "").toLowerCase();
  if (mime.startsWith("audio/")) return false;
  if (mime.startsWith("video/")) return true;
  return VIDEO_EXTENSIONS.includes(getAttachmentExt(a));
};

const resolveVideoMimeType = (a) => {
  const mime = String(a?.mime || "").toLowerCase();
  if (mime.startsWith("video/")) return mime;

  const ext = getAttachmentExt(a);
  const mimeByExt = {
    mp4: "video/mp4",
    m4v: "video/x-m4v",
    webm: "video/webm",
    ogg: "video/ogg",
    ogv: "video/ogg",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    "3gp": "video/3gpp",
    "3g2": "video/3gpp2",
  };

  return mimeByExt[ext] || "";
};

const resolveAudioMimeType = (a) => {
  const mime = String(a?.mime || "").toLowerCase();
  if (mime.startsWith("audio/")) return mime;

  const ext = getAttachmentExt(a);
  const mimeByExt = {
    aac: "audio/aac",
    flac: "audio/flac",
    m4a: "audio/mp4",
    mp3: "audio/mpeg",
    oga: "audio/ogg",
    ogg: "audio/ogg",
    opus: "audio/ogg",
    wav: "audio/wav",
  };

  return mimeByExt[ext] || "";
};

export const resolveAttachmentIcon = (a) => {
  const mime = String(a?.mime || "").toLowerCase();
  const ext = getAttachmentExt(a);

  if (isImageAttachment(a)) return "assets/images/icons/gallary.png";
  if (isAudioAttachment(a)) return "assets/images/icons/music.png";
  if (isVideoAttachment(a)) return "assets/images/icons/file.png";

  if (mime.includes("pdf") || ext === "pdf") return "assets/images/icons/pdf.png";
  if (ext === "zip" || mime.includes("zip")) return "assets/images/icons/zip.png";
  if (ext === "rar" || mime.includes("rar") || ext === "7z") return "assets/images/icons/rar.png";

  if (mime.includes("spreadsheet") || mime.includes("excel")) {
    return "assets/images/icons/excel.png";
  }

  const officeMap = {
    xls: "excel.png",
    xlsx: "excel.png",
    xlsm: "excel.png",
    xlsb: "excel.png",
    xlt: "excel.png",
    xltx: "excel.png",
    csv: "excel.png",
    doc: "doc.png",
    docx: "doc.png",
    ppt: "ppt.png",
    pptx: "ppt.png",
  };
  if (officeMap[ext]) return `assets/images/icons/${officeMap[ext]}`;

  if (ext) return `assets/images/icons/${ext}.png`;
  return "assets/images/icons/file.png";
};

export const resolveAttachmentHref = (url) => {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (raw.startsWith("blob:") || raw.startsWith("data:")) return raw;

  const publicMediaUrl = resolvePublicMediaUrl(raw);
  if (publicMediaUrl) return publicMediaUrl;

  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) return raw;

  try {
    const parsed = new URL(raw);
    const isLocal =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1";

    if (isLocal || parsed.pathname.startsWith("/storage/")) {
      return `${backendOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    return raw;
  } catch {
    const cutIndex = raw.search(/[?#]/);
    const pathPart = cutIndex === -1 ? raw : raw.slice(0, cutIndex);
    const rest = cutIndex === -1 ? "" : raw.slice(cutIndex);

    let path = String(pathPart || "");
    path = path.startsWith("/") ? path : `/${path}`;

    if (path.startsWith("/storage/")) return `${backendOrigin}${path}${rest}`;
    if (path.startsWith("/task_attachments/")) return `${backendOrigin}/storage${path}${rest}`;
    if (path.startsWith("/task_checklist_item_attachments/")) return `${backendOrigin}/storage${path}${rest}`;
    if (path.startsWith("/attachments/")) return `${backendOrigin}/storage${path}${rest}`;
    if (path.startsWith("/project_images/")) return `${backendOrigin}/storage${path}${rest}`;

    return `${backendOrigin}${path}${rest}`;
  }
};

const useAttachmentImageSrc = ({ attachment, href }) => {
  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const objectUrlRef = useRef(null);

  const isImg = isImageAttachment(attachment) && !!href;
  const shouldFetchAuthed = useMemo(() => {
    if (!isImg) return false;
    const h = String(href || "");
    if (!h) return false;
    if (h.includes("/api/v1/media/public/")) return false;
    if (h.includes("/storage/")) return false;
    return h.includes("/api/");
  }, [isImg, href]);

  useEffect(() => {
    setSrc(href || "");
  }, [href]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldFetchAuthed) return undefined;
    if (!href) return undefined;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(href, { responseType: "blob" });
        const blob = res?.data instanceof Blob ? res.data : new Blob([res?.data]);
        const url = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = url;
        setSrc(url);
      } catch {
        setSrc(href);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldFetchAuthed, href]);

  return { src: src || href || "", loading, isImg };
};

export const parseFilenameFromContentDisposition = (headerValue) => {
  const raw = String(headerValue || "").trim();
  if (!raw) return "";

  // RFC 5987 filename*=UTF-8''...
  const m5987 = raw.match(/filename\*\s*=\s*([^']*)''([^;]+)/i);
  if (m5987 && m5987[2]) {
    try {
      return decodeURIComponent(m5987[2].trim().replace(/^"|"$/g, ""));
    } catch {
      return m5987[2].trim().replace(/^"|"$/g, "");
    }
  }

  // filename="..."
  const m = raw.match(/filename\s*=\s*("?)([^\";]+)\1/i);
  if (m && m[2]) return m[2].trim();

  return "";
};

export const triggerBrowserDownload = ({ blob, filename }) => {
  const name = String(filename || "Attachment").trim() || "Attachment";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const isFileDragEvent = (event) => {
  const types = Array.from(event?.dataTransfer?.types || []);
  return types.includes("Files");
};

const getDataTransferFiles = (dataTransfer) =>
  Array.from(dataTransfer?.files || []).filter(
    (file) => file && (typeof File === "undefined" || file instanceof File),
  );

const normalizeResponseAttachments = (payload) => {
  const root = payload?.data ?? payload ?? null;
  if (Array.isArray(root)) return root;
  if (root && typeof root === "object") return [root];
  return [];
};

const VOICE_RECORDER_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
];

const getSupportedVoiceMimeType = () => {
  if (typeof MediaRecorder === "undefined") return "";
  if (typeof MediaRecorder.isTypeSupported !== "function") return "";

  return (
    VOICE_RECORDER_MIME_TYPES.find((mimeType) =>
      MediaRecorder.isTypeSupported(mimeType),
    ) || ""
  );
};

const getVoiceFileExtension = (mimeType) => {
  const normalized = String(mimeType || "").split(";")[0].toLowerCase();
  if (normalized.includes("ogg")) return "ogg";
  if (normalized.includes("mp4")) return "m4a";
  if (normalized.includes("mpeg")) return "mp3";
  if (normalized.includes("wav")) return "wav";
  return "webm";
};

const formatVoiceDuration = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(Number(ms || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const stopStreamTracks = (stream) => {
  stream?.getTracks?.().forEach((track) => track.stop());
};

const getAttachmentId = (attachment) =>
  attachment?.id ?? attachment?.attachment_id ?? null;

const MAX_REASONABLE_VOICE_SECONDS = 12 * 60 * 60;

const normalizeVoiceDurationSeconds = (value) => {
  const seconds = Number(value);
  if (
    !Number.isFinite(seconds) ||
    seconds <= 0 ||
    seconds > MAX_REASONABLE_VOICE_SECONDS
  ) {
    return 0;
  }

  return seconds;
};

const getVoiceAttachmentDurationSeconds = (attachment) => {
  const directSeconds = normalizeVoiceDurationSeconds(
    attachment?.voiceDurationSeconds ??
      attachment?.voice_duration_seconds ??
      attachment?.duration_seconds,
  );
  if (directSeconds) return directSeconds;

  const directMilliseconds = Number(
    attachment?.voiceDurationMs ??
      attachment?.voice_duration_ms ??
      attachment?.duration_ms,
  );
  if (Number.isFinite(directMilliseconds) && directMilliseconds > 0) {
    return normalizeVoiceDurationSeconds(directMilliseconds / 1000);
  }

  const name = String(getAttachmentName(attachment) || "");
  const match = name.match(/-(\d+)ms\.[a-z0-9]+$/i);
  if (!match) return 0;

  return normalizeVoiceDurationSeconds(Number(match[1]) / 1000);
};

const getFiniteAudioDuration = (audio, fallbackDuration = 0) => {
  const duration = Number(audio?.duration);
  const normalizedDuration = normalizeVoiceDurationSeconds(duration);
  if (normalizedDuration) return normalizedDuration;

  const seekable = audio?.seekable;
  if (!seekable?.length) return normalizeVoiceDurationSeconds(fallbackDuration);

  const seekableEnd = Number(seekable.end(seekable.length - 1));
  return (
    normalizeVoiceDurationSeconds(seekableEnd) ||
    normalizeVoiceDurationSeconds(fallbackDuration)
  );
};

const formatVoicePlaybackTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds || 0)));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

function VoiceAudioPlayer({ src, fallbackDuration = 0 }) {
  const audioRef = useRef(null);
  const durationProbeCleanupRef = useRef(null);
  const durationProbeTriedRef = useRef(false);
  const fallbackDurationSeconds = normalizeVoiceDurationSeconds(fallbackDuration);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(fallbackDurationSeconds);
  const [isPlaying, setIsPlaying] = useState(false);

  const probeAudioDuration = useCallback(() => {
    const audio = audioRef.current;
    if (
      !audio ||
      fallbackDurationSeconds ||
      durationProbeTriedRef.current ||
      getFiniteAudioDuration(audio)
    ) {
      return;
    }

    durationProbeTriedRef.current = true;
    const originalTime = Number.isFinite(audio.currentTime)
      ? audio.currentTime
      : 0;
    const wasPaused = audio.paused;
    const originalMuted = audio.muted;
    let completed = false;
    let timeoutId = null;

    const finishProbe = () => {
      if (completed) return;
      completed = true;
      audio.removeEventListener("timeupdate", finishProbe);
      if (timeoutId) window.clearTimeout(timeoutId);

      const nextDuration = getFiniteAudioDuration(audio);
      const restoredTime = nextDuration
        ? Math.min(originalTime, nextDuration)
        : originalTime;

      if (nextDuration) setDuration(nextDuration);
      setCurrentTime(restoredTime);

      try {
        audio.currentTime = restoredTime;
      } catch {
        // Some browsers reject seeking before the media is fully ready.
      }

      audio.muted = originalMuted;
      if (wasPaused) audio.pause();
      durationProbeCleanupRef.current = null;
    };

    durationProbeCleanupRef.current = finishProbe;
    audio.addEventListener("timeupdate", finishProbe);
    audio.muted = true;

    try {
      audio.currentTime = 1e9;
      timeoutId = window.setTimeout(finishProbe, 800);
    } catch {
      finishProbe();
    }
  }, [fallbackDurationSeconds]);

  const syncDuration = useCallback((shouldProbe = false) => {
    const nextDuration = getFiniteAudioDuration(
      audioRef.current,
      fallbackDurationSeconds,
    );
    if (nextDuration) {
      setDuration(nextDuration);
      return;
    }

    if (shouldProbe) probeAudioDuration();
  }, [fallbackDurationSeconds, probeAudioDuration]);

  useEffect(() => {
    durationProbeCleanupRef.current?.();
    durationProbeTriedRef.current = false;
    setCurrentTime(0);
    setDuration(fallbackDurationSeconds);
    setIsPlaying(false);
    audioRef.current?.load?.();
  }, [fallbackDurationSeconds, src]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      durationProbeCleanupRef.current?.();
      audio?.pause?.();
    };
  }, []);

  const playProgress =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    if (isPlaying) {
      audio.pause();
      return;
    }

    if (audio.ended) {
      audio.currentTime = 0;
      setCurrentTime(0);
    }

    try {
      await audio.play();
      syncDuration();
    } catch (err) {
      toastError(err?.message || "Could not play voice");
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (durationProbeCleanupRef.current) return;

    setCurrentTime(Number.isFinite(audio.currentTime) ? audio.currentTime : 0);
    syncDuration();
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;
    if (!audio || duration <= 0) return;

    const nextTime = Number(event.target.value);
    if (!Number.isFinite(nextTime)) return;

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <div className="task-voice-player">
      <audio
        ref={audioRef}
        preload="metadata"
        src={src}
        onLoadedMetadata={() => syncDuration(true)}
        onDurationChange={() => syncDuration(true)}
        onCanPlay={() => syncDuration()}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          syncDuration();
        }}
      />
      <div className="task-voice-player__controls">
        <button
          type="button"
          className="task-voice-player__play"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause voice" : "Play voice"}
          title={isPlaying ? "Pause" : "Play"}
        >
          <i
            className={`ti ${isPlaying ? "ti-player-pause" : "ti-player-play"}`}
            aria-hidden="true"
          ></i>
        </button>
        <div className="task-voice-player__track-wrap">
          <input
            className="task-voice-player__track"
            type="range"
            min="0"
            max={duration > 0 ? duration : 0}
            step="0.01"
            value={duration > 0 ? Math.min(currentTime, duration) : 0}
            onChange={handleSeek}
            disabled={duration <= 0}
            aria-label="Voice playback progress"
            style={{ "--voice-play-progress": `${playProgress}%` }}
          />
          <span className="task-voice-player__time">
            {formatVoicePlaybackTime(currentTime)}
            <span aria-hidden="true"> / </span>
            {duration > 0 ? formatVoicePlaybackTime(duration) : "--:--"}
          </span>
        </div>
      </div>
    </div>
  );
}

function VoiceRecorder({ autoStartToken, disabled, onUpload, onCancel, onSaved }) {
  const [recorderStatus, setRecorderStatus] = useState("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startedAtRef = useRef(null);
  const savedElapsedMsRef = useRef(0);
  const mountedRef = useRef(false);
  const autoStartedTokenRef = useRef(null);

  const isRecording = recorderStatus === "recording";
  const isPaused = recorderStatus === "paused";
  const isSaving = recorderStatus === "saving";
  const isStarting = recorderStatus === "starting";

  const cleanupRecorder = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        // The recorder may already be stopping in some browsers.
      }
    }

    stopStreamTracks(streamRef.current);
    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    startedAtRef.current = null;
    savedElapsedMsRef.current = 0;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanupRecorder();
    };
  }, [cleanupRecorder]);

  useEffect(() => {
    if (!isRecording) return undefined;

    const tick = () => {
      const startedAt = startedAtRef.current;
      const liveMs = startedAt ? Date.now() - startedAt : 0;
      setElapsedMs(savedElapsedMsRef.current + liveMs);
    };

    tick();
    const intervalId = window.setInterval(tick, 400);
    return () => window.clearInterval(intervalId);
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    if (disabled || recorderStatus !== "idle") return;

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      toastError("Voice recording is not supported in this browser");
      onCancel?.();
      return;
    }

    let stream = null;
    try {
      setRecorderStatus("starting");
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) {
        stopStreamTracks(stream);
        return;
      }

      const mimeType = getSupportedVoiceMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      chunksRef.current = [];
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data?.size) chunksRef.current.push(event.data);
      });
      recorder.addEventListener("error", () => {
        toastError("Voice recorder failed");
      });

      recorder.start();
      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      startedAtRef.current = Date.now();
      savedElapsedMsRef.current = 0;
      setElapsedMs(0);
      setRecorderStatus("recording");
    } catch (err) {
      stopStreamTracks(stream);
      if (!mountedRef.current) return;

      const message =
        err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
          ? "Microphone permission was denied"
          : "Could not start voice recording";
      toastError(message);
      setRecorderStatus("idle");
      onCancel?.();
    }
  }, [disabled, onCancel, recorderStatus]);

  useEffect(() => {
    if (autoStartToken == null) return;
    if (autoStartedTokenRef.current === autoStartToken) return;

    autoStartedTokenRef.current = autoStartToken;
    startRecording();
  }, [autoStartToken, startRecording]);

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;

    recorder.pause();
    const startedAt = startedAtRef.current;
    if (startedAt) {
      savedElapsedMsRef.current += Date.now() - startedAt;
      startedAtRef.current = null;
      setElapsedMs(savedElapsedMsRef.current);
    }
    setRecorderStatus("paused");
  }, []);

  const resumeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "paused") return;

    recorder.resume();
    startedAtRef.current = Date.now();
    setRecorderStatus("recording");
  }, []);

  const stopAndBuildBlob = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      const mimeType =
        String(recorder.mimeType || "").split(";")[0] ||
        getSupportedVoiceMimeType().split(";")[0] ||
        "audio/webm";

      const finish = () => {
        resolve(new Blob(chunksRef.current, { type: mimeType }));
      };

      recorder.addEventListener("stop", finish, { once: true });
      recorder.addEventListener("error", reject, { once: true });

      try {
        if (recorder.state === "inactive") {
          finish();
        } else {
          recorder.stop();
        }
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  const saveRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || isSaving || isStarting) return;

    const startedAt = startedAtRef.current;
    if (recorder.state === "recording" && startedAt) {
      savedElapsedMsRef.current += Date.now() - startedAt;
      startedAtRef.current = null;
      setElapsedMs(savedElapsedMsRef.current);
    }

    try {
      setRecorderStatus("saving");
      const blob = await stopAndBuildBlob();
      stopStreamTracks(streamRef.current);
      streamRef.current = null;

      if (!blob?.size) {
        throw new Error("Voice recording is empty");
      }

      const mimeType = blob.type || "audio/webm";
      const extension = getVoiceFileExtension(mimeType);
      const durationMs = Math.max(0, Math.round(savedElapsedMsRef.current));
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const file = new File(
        [blob],
        `voice-recording-${stamp}-${durationMs}ms.${extension}`,
        {
          type: mimeType,
        },
      );

      await onUpload?.(file, {
        durationSeconds: normalizeVoiceDurationSeconds(durationMs / 1000),
      });
      onSaved?.();
    } catch (err) {
      toastError(err?.message || "Save voice recording failed");
      onSaved?.();
    } finally {
      mediaRecorderRef.current = null;
      chunksRef.current = [];
      startedAtRef.current = null;
      savedElapsedMsRef.current = 0;
      setRecorderStatus("idle");
      setElapsedMs(0);
    }
  }, [isSaving, isStarting, onSaved, onUpload, stopAndBuildBlob]);

  const cancelRecording = useCallback(() => {
    cleanupRecorder();
    setRecorderStatus("idle");
    setElapsedMs(0);
    onCancel?.();
  }, [cleanupRecorder, onCancel]);

  const statusLabel = isStarting
    ? "Starting..."
    : isSaving
      ? "Saving..."
      : isPaused
        ? "Stopped"
        : "Recording";

  return (
    <div className={`task-voice-recorder is-${recorderStatus}`}>
      <div className="task-voice-recorder__head">
        <span className="task-voice-recorder__icon">
          {isStarting || isSaving ? (
            <Spinner size="sm" color="primary" />
          ) : (
            <i className="ti ti-microphone" aria-hidden="true"></i>
          )}
        </span>
        <span className="task-voice-recorder__meta">
          <span className="task-voice-recorder__title">Voice recording</span>
          <span className="task-voice-recorder__status">{statusLabel}</span>
        </span>
        <span className="task-voice-recorder__time">
          {formatVoiceDuration(elapsedMs)}
        </span>
      </div>

      <div className="task-voice-recorder__meter" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
          <span key={bar} style={{ "--voice-bar": bar }} />
        ))}
      </div>

      <div className="task-voice-recorder__actions">
        {isRecording ? (
          <button
            type="button"
            className="btn btn-sm btn-light task-voice-recorder__control"
            onClick={pauseRecording}
          >
            <i className="ti ti-player-pause" aria-hidden="true"></i>
            <span>Stop</span>
          </button>
        ) : null}
        {isPaused ? (
          <button
            type="button"
            className="btn btn-sm btn-light task-voice-recorder__control"
            onClick={resumeRecording}
          >
            <i className="ti ti-player-play" aria-hidden="true"></i>
            <span>Resume</span>
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn-sm btn-light task-voice-recorder__control"
          onClick={cancelRecording}
          disabled={isSaving}
        >
          <i className="ti ti-x" aria-hidden="true"></i>
          <span>Cancel</span>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary task-voice-recorder__control"
          onClick={saveRecording}
          disabled={isStarting || isSaving}
        >
          {isSaving ? (
            <Spinner size="sm" />
          ) : (
            <i className="ti ti-check" aria-hidden="true"></i>
          )}
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}

export function VoiceAttachmentsPanel({
  attachments = [],
  className = "",
  disabled = false,
  uploading = false,
  showTrigger = true,
  onUpload,
  onDelete,
  deletingId,
}) {
  const [recordingToken, setRecordingToken] = useState(null);
  const voiceItems = Array.isArray(attachments) ? attachments : [];
  const recorderOpen = recordingToken != null;
  const canStartRecording = !disabled && !uploading && !recorderOpen;

  const startRecording = useCallback(() => {
    if (!canStartRecording) return;
    setRecordingToken(Date.now());
  }, [canStartRecording]);

  const closeRecorder = useCallback(() => {
    setRecordingToken(null);
  }, []);

  const uploadVoice = useCallback(
    async (file, metadata) => {
      if (typeof onUpload !== "function") return 0;
      return onUpload(file, metadata);
    },
    [onUpload],
  );

  return (
    <div className={`task-voice-panel${className ? ` ${className}` : ""}`}>
      {showTrigger ? (
        <button
          type="button"
          className="task-voice-add-button"
          onClick={startRecording}
          disabled={!canStartRecording}
          title="Add voice"
        >
          <span className="task-voice-add-button__icon">
            <i className="ti ti-microphone" aria-hidden="true"></i>
          </span>
          <span className="task-voice-add-button__text">
            <span className="task-voice-add-button__title">Add voice</span>
            <span className="task-voice-add-button__hint">Record audio</span>
          </span>
        </button>
      ) : null}

      {recorderOpen || voiceItems.length ? (
        <div className="task-voice-box">
          {recorderOpen ? (
            <VoiceRecorder
              autoStartToken={recordingToken}
              disabled={disabled || uploading}
              onUpload={uploadVoice}
              onCancel={closeRecorder}
              onSaved={closeRecorder}
            />
          ) : null}

          {voiceItems.length ? (
            <div className="task-voice-list" role="list">
              {voiceItems.map((attachment, index) => {
                const attachmentId = getAttachmentId(attachment);
                const idKey =
                  attachmentId != null
                    ? String(attachmentId)
                    : `${getAttachmentName(attachment)}-${index}`;
                const href = resolveAttachmentHref(getAttachmentUrl(attachment));
                const deleting =
                  attachmentId != null && String(deletingId) === String(attachmentId);
                const fallbackDuration =
                  getVoiceAttachmentDurationSeconds(attachment);

                return (
                  <div
                    key={attachment?.id ?? attachment?.url ?? attachment?.path ?? idKey}
                    className="task-voice-card"
                    role="listitem"
                  >
                    <span className="task-voice-card__body">
                      {href ? (
                        <VoiceAudioPlayer
                          src={href}
                          fallbackDuration={fallbackDuration}
                        />
                      ) : (
                        <span className="task-voice-card__missing">
                          Audio unavailable
                        </span>
                      )}
                    </span>
                    {attachmentId != null ? (
                      <button
                        type="button"
                        className="task-voice-card__delete"
                        onClick={() => onDelete?.(attachment)}
                        disabled={deleting}
                        title="Delete voice"
                        aria-label="Delete voice"
                      >
                        {deleting ? (
                          <Spinner size="sm" />
                        ) : (
                          <i className="ti ti-trash" aria-hidden="true"></i>
                        )}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function TaskAttachments({
  projectId,
  taskId,
  columnId,
  onChanged,
  formatDateTime,
  initialAttachments,
  prefetched = false,
  extraAttachmentCount = 0,
}) {
  const dispatch = useDispatch();
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [attachmentUploadingCount, setAttachmentUploadingCount] = useState(0);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewDownloading, setPreviewDownloading] = useState(false);
  const [attachmentDragActive, setAttachmentDragActive] = useState(false);
  const seededRef = useRef(false);
  const attachmentDragDepthRef = useRef(0);
  const uploadAbortControllerRef = useRef(null);
  const uploadCancelReasonRef = useRef(null);
  const voiceAttachments = useMemo(
    () => (attachments || []).filter(isRecordedVoiceAttachment),
    [attachments],
  );
  const fileAttachments = useMemo(
    () => (attachments || []).filter((attachment) => !isRecordedVoiceAttachment(attachment)),
    [attachments],
  );

  const previewAttachmentCount = fileAttachments.length;
  const normalizedPreviewIndex = previewAttachmentCount
    ? Math.min(Math.max(previewIndex, 0), previewAttachmentCount - 1)
    : 0;
  const previewAttachment =
    previewOpen && previewAttachmentCount
      ? fileAttachments[normalizedPreviewIndex] ?? null
      : null;
  const canNavigatePreview = previewAttachmentCount > 1;

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
    setPreviewIndex(0);
  }, []);

  const openPreview = useCallback((index) => {
    setMenuOpenId(null);
    setPreviewIndex(index);
    setPreviewOpen(true);
  }, []);

  const showPreviousPreview = useCallback(() => {
    setPreviewIndex((current) => {
      if (previewAttachmentCount <= 1) return current;
      const currentIndex = Math.min(Math.max(current, 0), previewAttachmentCount - 1);
      return (currentIndex - 1 + previewAttachmentCount) % previewAttachmentCount;
    });
  }, [previewAttachmentCount]);

  const showNextPreview = useCallback(() => {
    setPreviewIndex((current) => {
      if (previewAttachmentCount <= 1) return current;
      const currentIndex = Math.min(Math.max(current, 0), previewAttachmentCount - 1);
      return (currentIndex + 1) % previewAttachmentCount;
    });
  }, [previewAttachmentCount]);

  const cancelAttachmentUpload = useCallback((event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    uploadCancelReasonRef.current = "manual";
    uploadAbortControllerRef.current?.abort();
  }, []);

  useEffect(() => () => {
    uploadCancelReasonRef.current = "unmount";
    uploadAbortControllerRef.current?.abort();
  }, []);

  const safeFormatDateTime = (value) => {
    if (typeof formatDateTime === "function") return formatDateTime(value);
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const setBoardCounts = useCallback((items) => {
    if (!taskId) return;
    const taskAttachmentCount = Array.isArray(items) ? items.length : 0;
    const checklistAttachmentCount = Number(extraAttachmentCount);
    const count =
      taskAttachmentCount +
      (Number.isFinite(checklistAttachmentCount) && checklistAttachmentCount > 0
        ? Math.floor(checklistAttachmentCount)
        : 0);

    dispatch(
      updateTaskInColumn({
        columnId,
        taskId,
        patch: {
          total_attachment: count,
          files_count: count,
          attachments_count: count,
        },
      }),
    );
  }, [columnId, dispatch, extraAttachmentCount, taskId]);

  const fetchAttachments = useCallback(async () => {
    if (!projectId || !taskId) return;
    try {
      setAttachmentsLoading(true);
      const res = await api.get(
        `/projects/${projectId}/tasks/${taskId}/attachments`,
      );
      const items = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(items) ? items : [];
      setAttachments(list);
      setBoardCounts(list);
    } catch (err) {
      toastError(err?.message || "Load attachments failed");
      setAttachments([]);
      setBoardCounts([]);
    } finally {
      setAttachmentsLoading(false);
    }
  }, [projectId, setBoardCounts, taskId]);

  useEffect(() => {
    if (!prefetched) return;
    if (!taskId) return;
    if (!Array.isArray(initialAttachments)) return;
    setAttachments(initialAttachments);
    setBoardCounts(initialAttachments);
    seededRef.current = true;
  }, [prefetched, initialAttachments, setBoardCounts, taskId]);

  useEffect(() => {
    if (!previewOpen) return undefined;

    if (!previewAttachmentCount) {
      closePreview();
      return undefined;
    }

    setPreviewIndex((current) =>
      Math.min(Math.max(current, 0), previewAttachmentCount - 1),
    );

    return undefined;
  }, [closePreview, previewAttachmentCount, previewOpen]);

  useEffect(() => {
    if (!previewOpen) return undefined;

    const handlePreviewKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPreviousPreview();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNextPreview();
      }
    };

    window.addEventListener("keydown", handlePreviewKeyDown);
    return () => window.removeEventListener("keydown", handlePreviewKeyDown);
  }, [previewOpen, showNextPreview, showPreviousPreview]);

  const downloadAttachment = async (attachment) => {
    const href = resolveAttachmentHref(getAttachmentUrl(attachment));
    const attachmentId = attachment?.id ?? attachment?.attachment_id ?? null;
    if (!href && !attachmentId) return;

    const fallbackName = getAttachmentName(attachment);
    const name = String(fallbackName || "Attachment").trim() || "Attachment";

    try {
      setPreviewDownloading(true);

      // Prefer same-origin API endpoint to avoid CORS issues with /storage/ downloads.
      if (projectId && taskId && attachmentId != null) {
        try {
          const res = await api.get(
            `/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}/download`,
            { responseType: "blob" },
          );
          const blob = res?.data instanceof Blob ? res.data : new Blob([res?.data]);
          const headerName = parseFilenameFromContentDisposition(
            res?.headers?.["content-disposition"] ?? res?.headers?.["Content-Disposition"],
          );
          triggerBrowserDownload({ blob, filename: headerName || name });
          return;
        } catch {
          // fall back below
        }
      }

      if (!href) throw new Error("Download url missing");

      const res = await api.get(href, { responseType: "blob" });
      const blob = res?.data instanceof Blob ? res.data : new Blob([res?.data]);
      const headerName = parseFilenameFromContentDisposition(
        res?.headers?.["content-disposition"] ?? res?.headers?.["Content-Disposition"],
      );
      triggerBrowserDownload({ blob, filename: headerName || name });
    } catch (err) {
      toastError(err?.message || "Download failed");
    } finally {
      setPreviewDownloading(false);
    }
  };

  useEffect(() => {
    if (prefetched && seededRef.current) return;
    fetchAttachments();
  }, [fetchAttachments]);

  const uploadAttachments = useCallback(async (files, options = {}) => {
    const selectedFiles = Array.from(files || []).filter(Boolean);
    if (!projectId || !taskId || !selectedFiles.length || attachmentUploading) {
      return 0;
    }
    let controller = null;
    try {
      setAttachmentUploading(true);
      setAttachmentUploadingCount(selectedFiles.length);
      const url = `/projects/${projectId}/tasks/${taskId}/attachments`;
      controller = new AbortController();
      uploadAbortControllerRef.current = controller;
      uploadCancelReasonRef.current = null;

      const fd = new FormData();
      selectedFiles.forEach((file) => {
        fd.append("files[]", file);
      });

      const res = await api.post(url, fd, { signal: controller.signal });
      const uploaded = normalizeResponseAttachments(res?.data);
      const uploadedCount = uploaded.length || selectedFiles.length;

      toastSuccess(
        uploadedCount > 1
          ? options.successMessagePlural || "Files attached"
          : options.successMessage || "File attached",
      );
      await fetchAttachments();
      onChanged?.();
      return uploadedCount;
    } catch (err) {
      if (
        uploadCancelReasonRef.current === "manual" ||
        err?.message === "canceled"
      ) {
        if (uploadCancelReasonRef.current === "manual") {
          toastInfo("Upload canceled");
        }
        return 0;
      }

      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Upload attachment failed";
      toastError(msg);
      return 0;
    } finally {
      if (uploadAbortControllerRef.current === controller) {
        uploadAbortControllerRef.current = null;
        uploadCancelReasonRef.current = null;
      }

      setAttachmentUploading(false);
      setAttachmentUploadingCount(0);
    }
  }, [attachmentUploading, fetchAttachments, onChanged, projectId, taskId]);

  const uploadVoiceAttachment = useCallback(
    (file) =>
      uploadAttachments([file], {
        successMessage: "Voice attached",
        successMessagePlural: "Voice recordings attached",
      }),
    [uploadAttachments],
  );

  const handleAttachmentDragEnter = useCallback((event) => {
    if (!isFileDragEvent(event)) return;

    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = attachmentUploading ? "none" : "copy";
    }

    attachmentDragDepthRef.current += 1;
    setAttachmentDragActive(true);
  }, [attachmentUploading]);

  const handleAttachmentDragOver = useCallback((event) => {
    if (!isFileDragEvent(event)) return;

    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = attachmentUploading ? "none" : "copy";
    }
  }, [attachmentUploading]);

  const handleAttachmentDragLeave = useCallback((event) => {
    if (!isFileDragEvent(event)) return;

    event.preventDefault();
    event.stopPropagation();

    attachmentDragDepthRef.current = Math.max(
      attachmentDragDepthRef.current - 1,
      0,
    );

    if (attachmentDragDepthRef.current === 0) {
      setAttachmentDragActive(false);
    }
  }, []);

  const handleAttachmentDrop = useCallback(async (event) => {
    if (!isFileDragEvent(event)) return;

    event.preventDefault();
    event.stopPropagation();

    attachmentDragDepthRef.current = 0;
    setAttachmentDragActive(false);

    if (attachmentUploading) return;

    const files = getDataTransferFiles(event.dataTransfer);
    if (!files.length) return;

    await uploadAttachments(files);
  }, [attachmentUploading, uploadAttachments]);

  useEffect(() => {
    if (!projectId || !taskId) return undefined;

    const onPaste = (e) => {
      const items = e?.clipboardData?.items;
      if (!items || !items.length) return;

      const files = [];
      for (const item of items) {
        if (!item) continue;
        if (item.kind !== "file") continue;
        const f = item.getAsFile?.();
        if (f) files.push(f);
      }

      if (!files.length) return;

      // Only intercept when clipboard actually contains files (so normal text paste is unaffected).
      e.preventDefault();
      e.stopPropagation();

      uploadAttachments(files);
    };

    document.addEventListener("paste", onPaste, true);
    return () => document.removeEventListener("paste", onPaste, true);
  }, [projectId, taskId, uploadAttachments]);

  const deleteAttachment = async (attachment) => {
    const attachmentId = getAttachmentId(attachment);
    if (!projectId || !taskId || !attachmentId) return;
    const isVoice = isAudioAttachment(attachment);
    try {
      const { isConfirmed } = await alertConfirm({
        title: isVoice ? "Delete voice" : "Delete attachment",
        text: isVoice
          ? "Voice recording will be deleted. Continue?"
          : "File will be deleted. Continue?",
        confirmText: "Delete",
        cancelText: "No",
      });
      if (!isConfirmed) return;

      setDeletingId(String(attachmentId));
      await api.delete(
        `/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`,
      );
      toastSuccess(isVoice ? "Voice deleted" : "File deleted");
      setMenuOpenId(null);
      await fetchAttachments();
      onChanged?.();
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Delete attachment failed";
      toastError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mb-3">
      <div className="task-attachment-actions">
        <label
          htmlFor="task-attachment-file"
          className={`task-attachment-dropzone ${
            attachmentDragActive ? "is-drag-over" : ""
          } ${
            attachmentUploading ? "is-uploading" : ""
          }`}
          onDragEnter={handleAttachmentDragEnter}
          onDragOver={handleAttachmentDragOver}
          onDragLeave={handleAttachmentDragLeave}
          onDrop={handleAttachmentDrop}
        >
          <span className="task-attachment-dropzone__icon">
            {attachmentUploading ? (
              <Spinner size="sm" color="primary" />
            ) : (
              <i className="fa-solid fa-cloud-arrow-up fa-fw"></i>
            )}
          </span>
          <span className="task-attachment-dropzone__text">
            <span className="task-attachment-dropzone__title">
              {attachmentUploading
                ? attachmentUploadingCount > 1
                  ? `Uploading ${attachmentUploadingCount} files...`
                  : "Uploading..."
                : "Add attachment"}
            </span>
            <span className="task-attachment-dropzone__hint">
              Drag files, choose files
            </span>
          </span>
          {attachmentUploading ? (
            <button
              type="button"
              className="task-attachment-dropzone__cancel"
              onClick={cancelAttachmentUpload}
              title="Cancel upload"
              aria-label="Cancel upload"
            >
              <i className="ti ti-x" aria-hidden="true"></i>
              <span>Cancel</span>
            </button>
          ) : null}
          <input
            type="file"
            name="files[]"
            id="task-attachment-file"
            className="d-none"
            multiple
            onChange={async (e) => {
              const input = e.currentTarget;
              const files = Array.from(input.files || []);
              if (!files.length) return;
              await uploadAttachments(files);
              if (input) {
                input.value = "";
              }
            }}
            disabled={attachmentUploading}
          />
        </label>

        <VoiceAttachmentsPanel
          className="task-voice-panel--task"
          attachments={voiceAttachments}
          disabled={!projectId || !taskId}
          uploading={attachmentUploading}
          onUpload={uploadVoiceAttachment}
          onDelete={deleteAttachment}
          deletingId={deletingId}
        />
      </div>

      <div className="mt-2">
        {attachmentsLoading ? (
          <div className="d-flex align-items-center gap-2 text-muted small">
            <Spinner size="sm" color="primary" />
            <span>Loading attachments...</span>
          </div>
        ) : fileAttachments?.length ? (
          <div className="row g-2">
            {fileAttachments.map((a, idx) => {
              const name = getAttachmentName(a);
              const attachmentId = getAttachmentId(a);
              const href = resolveAttachmentHref(getAttachmentUrl(a));
              const isImg = isImageAttachment(a) && !!href;
              const isAudio = isAudioAttachment(a) && !!href;
              const isVideo = isVideoAttachment(a) && !!href;
              const iconSrc = toPublicAsset(resolveAttachmentIcon(a));
              const fallbackIconSrc = toPublicAsset("assets/images/icons/file.png");
              const idKey = attachmentId != null ? String(attachmentId) : null;
              const menuOpen = idKey != null && menuOpenId === idKey;
              const deleting = idKey != null && deletingId === idKey;
              return (
                <div
                  key={a?.id ?? a?.url ?? a?.path ?? `${name}-${idx}`}
                  className="col-12 col-sm-6 col-md-4"
                >
                  <div className="position-relative h-100">
                    {idKey ? (
                      <div style={{ position: "absolute", top: 6, right: 8, zIndex: 2 }}>
                        <Dropdown
                          direction="up"
                          isOpen={menuOpen}
                          toggle={() =>
                            setMenuOpenId((prev) => (prev === idKey ? null : idKey))
                          }
                        >
                          <DropdownToggle
                            tag="button"
                            type="button"
                            className="btn p-0 text-muted"
                            title="Options"
                            aria-label="Options"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <i className="ti ti-dots-vertical fs-5"></i>
                          </DropdownToggle>
                          <DropdownMenu end>
                            <DropdownItem
                              className="text-danger"
                              disabled={deleting}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteAttachment(a);
                              }}
                            >
                              <div className="d-flex align-items-center justify-content-between gap-2">
                                <span>{deleting ? "Deleting..." : "Delete"}</span>
                                <i className="ti ti-trash fs-5"></i>
                              </div>
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    ) : null}

                    <a
                      href={href || "#"}
                      className="text-decoration-none"
                      title={name}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openPreview(idx);
                      }}
                    >
                      <div className="bg-light rounded-3 p-2 h-100">
	                      <div
	                        className="rounded-3 overflow-hidden bg-white d-flex-center"
	                        style={{ height: 84 }}
	                      >
	                        {isImg ? (
	                          <AttachmentImage
	                            attachment={a}
	                            href={href}
	                            alt={name}
	                            className="w-100 h-100"
	                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
	                            fallbackIconSrc={fallbackIconSrc}
	                          />
	                        ) : isAudio ? (
	                          <AttachmentAudioThumbnail />
	                        ) : isVideo ? (
	                          <AttachmentVideoThumbnail />
	                        ) : (
	                          <img
	                            src={iconSrc}
	                            alt={name}
	                            onError={(e) => {
	                              if (e.currentTarget.src === fallbackIconSrc) return;
	                              e.currentTarget.src = fallbackIconSrc;
	                            }}
	                            style={{ width: 38, height: 38, objectFit: "contain" }}
	                          />
	                        )}
	                      </div>
                      <div className="pt-2" style={{ minWidth: 0 }}>
                        <div className="small fw-semibold text-truncate text-dark">
                          {name}
                        </div>
                        <div className="text-muted small text-truncate">
                          {formatBytes(a?.size)}
                        </div>
                      </div>
                    </div>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : voiceAttachments.length ? null : (
          <div className="text-muted small">No attachments yet.</div>
        )}
      </div>

      <Modal
        isOpen={previewOpen}
        toggle={closePreview}
        centered
        size="lg"
        className="task-attachment-preview-modal"
      >
        <ModalHeader toggle={closePreview}>
          <div className="task-attachment-preview-modal__title">
            <span>{getAttachmentName(previewAttachment)}</span>
            {previewAttachmentCount ? (
              <span className="task-attachment-preview-modal__counter">
                {normalizedPreviewIndex + 1} / {previewAttachmentCount}
              </span>
            ) : null}
          </div>
        </ModalHeader>
        <ModalBody className="task-attachment-preview-modal__body">
          {previewAttachment ? (
	            (() => {
	              const name = getAttachmentName(previewAttachment);
	              const href = resolveAttachmentHref(getAttachmentUrl(previewAttachment));
	              const attachmentId = previewAttachment?.id ?? previewAttachment?.attachment_id ?? null;
	              const isImg = isImageAttachment(previewAttachment) && !!href;
	              const isAudio = isAudioAttachment(previewAttachment) && !!href;
	              const isVideo = isVideoAttachment(previewAttachment) && !!href;
	              const iconSrc = toPublicAsset(resolveAttachmentIcon(previewAttachment));
	              const fallbackIconSrc = toPublicAsset("assets/images/icons/file.png");

	              return (
	                <div className="d-flex flex-column gap-3">
                    <div className="task-attachment-preview-modal__content">
                      {canNavigatePreview ? (
                        <button
                          type="button"
                          className="task-attachment-preview-modal__nav task-attachment-preview-modal__nav--prev"
                          aria-label="Previous attachment"
                          title="Previous attachment"
                          onClick={showPreviousPreview}
                        >
                          <i className="ti ti-chevron-left" aria-hidden="true"></i>
                          <span className="visually-hidden">Previous attachment</span>
                        </button>
                      ) : null}

	                    <div className="task-attachment-preview-modal__stage bg-light rounded-3 d-flex-center overflow-hidden">
	                    {isImg ? (
	                      <AttachmentImage
	                        attachment={previewAttachment}
	                        href={href}
	                        alt={name}
	                        style={{ maxWidth: "100%", maxHeight: 520, objectFit: "contain" }}
	                        fallbackIconSrc={fallbackIconSrc}
	                      />
	                    ) : isAudio ? (
	                      <AttachmentAudio
	                        attachment={previewAttachment}
	                        href={href}
	                        className="task-attachment-preview-modal__audio"
	                        fallbackIconSrc={fallbackIconSrc}
	                      />
	                    ) : isVideo ? (
	                      <AttachmentVideo
	                        attachment={previewAttachment}
	                        href={href}
	                        className="task-attachment-preview-modal__video"
	                        fallbackIconSrc={fallbackIconSrc}
	                      />
	                    ) : (
	                      <div className="d-flex flex-column align-items-center gap-2 py-4">
	                        <img
	                          src={iconSrc}
	                          alt={name}
                          onError={(e) => {
                            if (e.currentTarget.src === fallbackIconSrc) return;
                            e.currentTarget.src = fallbackIconSrc;
                          }}
                          style={{ width: 84, height: 84, objectFit: "contain" }}
                        />
                        <div className="text-muted small">{formatBytes(previewAttachment?.size)}</div>
                      </div>
                    )}
                  </div>

                      {canNavigatePreview ? (
                        <button
                          type="button"
                          className="task-attachment-preview-modal__nav task-attachment-preview-modal__nav--next"
                          aria-label="Next attachment"
                          title="Next attachment"
                          onClick={showNextPreview}
                        >
                          <i className="ti ti-chevron-right" aria-hidden="true"></i>
                          <span className="visually-hidden">Next attachment</span>
                        </button>
                      ) : null}
                    </div>

                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="text-muted small">
                      {previewAttachment?.created_at
                        ? `Uploaded: ${safeFormatDateTime(previewAttachment.created_at)}`
                        : null}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={(!href && attachmentId == null) || previewDownloading}
                        onClick={() => downloadAttachment(previewAttachment)}
                      >
                        {previewDownloading ? (
                          <span className="d-inline-flex align-items-center gap-2">
                            <Spinner size="sm" />
                            <span>Downloading...</span>
                          </span>
                        ) : (
                          <>
                            <i className="ti ti-download me-1"></i>
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : null}
        </ModalBody>
      </Modal>
    </div>
  );
}

export function AttachmentImage({ attachment, href, alt, fallbackIconSrc, ...imgProps }) {
  const { src, loading } = useAttachmentImageSrc({ attachment, href });
  const [errored, setErrored] = useState(false);
  const iconSrc = toPublicAsset(resolveAttachmentIcon(attachment));
  const fallback = fallbackIconSrc || toPublicAsset("assets/images/icons/file.png");

  useEffect(() => {
    setErrored(false);
  }, [attachment, href]);

  if (!href) {
    return (
      <img
        src={iconSrc}
        alt={alt}
        onError={(e) => {
          if (e.currentTarget.src === fallback) return;
          e.currentTarget.src = fallback;
        }}
        style={{ width: 38, height: 38, objectFit: "contain" }}
      />
    );
  }

  if (errored) {
    return (
      <img
        src={iconSrc}
        alt={alt}
        onError={(e) => {
          if (e.currentTarget.src === fallback) return;
          e.currentTarget.src = fallback;
        }}
        style={{ width: 38, height: 38, objectFit: "contain" }}
      />
    );
  }

  if (loading && !src) {
    return (
      <div className="w-100 h-100 d-flex-center">
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <img
      src={src || href}
      alt={alt}
      onError={() => setErrored(true)}
      {...imgProps}
    />
  );
}

export function AttachmentVideoThumbnail() {
  return (
    <div className="task-attachment-video-thumb" aria-hidden="true">
      <span className="task-attachment-video-thumb__play">
        <i className="fa-solid fa-play"></i>
      </span>
    </div>
  );
}

export function AttachmentAudioThumbnail() {
  return (
    <div className="task-attachment-audio-thumb" aria-hidden="true">
      <span className="task-attachment-audio-thumb__icon">
        <i className="ti ti-music"></i>
      </span>
      <span className="task-attachment-audio-thumb__play">
        <i className="fa-solid fa-play"></i>
      </span>
    </div>
  );
}

export function AttachmentVideo({ attachment, href, fallbackIconSrc, ...videoProps }) {
  const [errored, setErrored] = useState(false);
  const iconSrc = toPublicAsset(resolveAttachmentIcon(attachment));
  const fallback = fallbackIconSrc || toPublicAsset("assets/images/icons/file.png");
  const mimeType = resolveVideoMimeType(attachment);

  useEffect(() => {
    setErrored(false);
  }, [attachment, href]);

  if (!href || errored) {
    return (
      <img
        src={iconSrc}
        alt={getAttachmentName(attachment)}
        onError={(e) => {
          if (e.currentTarget.src === fallback) return;
          e.currentTarget.src = fallback;
        }}
        style={{ width: 84, height: 84, objectFit: "contain" }}
      />
    );
  }

  return (
    <video
      key={href}
      controls
      preload="metadata"
      playsInline
      onError={() => setErrored(true)}
      {...videoProps}
    >
      <source src={href} type={mimeType || undefined} />
      Your browser does not support the video tag.
    </video>
  );
}

export function AttachmentAudio({ attachment, href, fallbackIconSrc, ...audioProps }) {
  const [errored, setErrored] = useState(false);
  const iconSrc = toPublicAsset(resolveAttachmentIcon(attachment));
  const fallback = fallbackIconSrc || toPublicAsset("assets/images/icons/file.png");
  const mimeType = resolveAudioMimeType(attachment);

  useEffect(() => {
    setErrored(false);
  }, [attachment, href]);

  if (!href || errored) {
    return (
      <img
        src={iconSrc}
        alt={getAttachmentName(attachment)}
        onError={(e) => {
          if (e.currentTarget.src === fallback) return;
          e.currentTarget.src = fallback;
        }}
        style={{ width: 84, height: 84, objectFit: "contain" }}
      />
    );
  }

  return (
    <div className="task-attachment-preview-modal__audio-shell">
      <span className="task-attachment-preview-modal__audio-icon">
        <i className="ti ti-music"></i>
      </span>
      <audio
        key={href}
        controls
        preload="metadata"
        onError={() => setErrored(true)}
        {...audioProps}
      >
        <source src={href} type={mimeType || undefined} />
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
}
