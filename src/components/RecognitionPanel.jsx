import { useRef, useState } from "react";
import { Camera, FileVideo, ImageUp, Loader2, Square, Video } from "lucide-react";
import {
  analyzeCorrectionVideo,
  recognizeEquipmentImage,
  startCorrectionSession,
} from "../services/aifitApi.js";

export function RecognitionPanel({ currentPage, onEquipmentResolved, onCorrectionResolved }) {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  async function runImageRecognition(file) {
    if (!file) return;
    setStatus("recognizing");
    const response = await recognizeEquipmentImage(file);
    setResult(response);
    setStatus("done");
    if (response?.equipment) onEquipmentResolved(response);
  }

  async function openCamera() {
    setStatus("camera");
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    streamRef.current = stream;
    setStreaming(true);
    if (videoRef.current) videoRef.current.srcObject = stream;
  }

  async function captureFrame() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    stopCamera();
    await runImageRecognition(new File([blob], "camera-frame.jpg", { type: "image/jpeg" }));
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStreaming(false);
    setStatus("idle");
  }

  async function runRealtimeCorrection() {
    setStatus("session");
    const response = await startCorrectionSession({
      equipment: result?.equipment ?? "lat-pulldown",
      sourcePage: currentPage.title,
    });
    setResult(response);
    setStatus("done");
    onCorrectionResolved(response);
  }

  async function runVideoAnalysis(file) {
    if (!file) return;
    setStatus("analyzing");
    const response = await analyzeCorrectionVideo(file, {
      equipment: result?.equipment ?? "seated-row",
    });
    setResult(response);
    setStatus("done");
    onCorrectionResolved(response);
  }

  const busy = ["recognizing", "analyzing", "session"].includes(status);

  return (
    <div className="recognition-dock" aria-label="AI recognition controls">
      {streaming && (
        <div className="camera-preview">
          <video autoPlay muted playsInline ref={videoRef} />
          <div className="camera-actions">
            <button className="dock-button primary" onClick={captureFrame} type="button">
              <Camera size={18} />
              <span>拍摄</span>
            </button>
            <button className="dock-button" onClick={stopCamera} type="button">
              <Square size={18} />
              <span>停止</span>
            </button>
          </div>
        </div>
      )}

      <div className="dock-actions">
        <button className="dock-button primary" disabled={busy} onClick={openCamera} type="button">
          <Camera size={18} />
          <span>摄像头</span>
        </button>

        <label className="dock-button">
          <ImageUp size={18} />
          <span>图片</span>
          <input accept="image/*" hidden onChange={(event) => runImageRecognition(event.target.files?.[0])} type="file" />
        </label>

        <button className="dock-button" disabled={busy} onClick={runRealtimeCorrection} type="button">
          <Video size={18} />
          <span>实时纠偏</span>
        </button>

        <label className="dock-button">
          <FileVideo size={18} />
          <span>视频</span>
          <input accept="video/*" hidden onChange={(event) => runVideoAnalysis(event.target.files?.[0])} type="file" />
        </label>
      </div>

      <div className="dock-status">
        {busy && <Loader2 className="spin" size={16} />}
        <span>{statusLabel(status, result)}</span>
      </div>
    </div>
  );
}

function statusLabel(status, result) {
  if (status === "recognizing") return "识别中";
  if (status === "analyzing") return "分析中";
  if (status === "session") return "纠偏中";
  if (status === "camera") return "摄像头";
  if (result?.equipmentLabel) return result.equipmentLabel;
  if (result?.summary) return result.summary;
  return "AI ready";
}
