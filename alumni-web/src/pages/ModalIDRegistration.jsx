import React, { useState, useRef, useCallback, useEffect } from "react";
import { verifyAlumniID, normalizeImageForOCR } from "../utils/ocrUtils";
import IDRegistrationView from "../Views/IDRegistrationview";

const ModalIDRegistration = ({ onVerified, onSwitchToLogin, onClose }) => {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionRef = useRef(null);
  const capturedRef = useRef(false);

  const [agreed, setAgreed] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [camGuide, setCamGuide] = useState(
    "Align your Alumni ID inside the frame",
  );

  // OCR trigger
  useEffect(() => {
    if (!imageFile) return;
    (async () => {
      setStatus("scanning");
      setErrorMsg("");
      setExtractedData(null);
      try {
        // Mobile file-picker/camera photos come in at full sensor resolution
        // (often several MB), which silently fails against the OCR
        // provider's file-size limit. Normalize (downscale + recompress)
        // every image — gallery pick, native camera photo, or in-app
        // camera capture — before sending it for OCR. This does not change
        // OCR logic/thresholds/validation, only what bytes reach it.
        const normalizedFile = await normalizeImageForOCR(imageFile);
        const result = await verifyAlumniID(normalizedFile);
        if (result.verified) {
          setStatus("verified");
          setExtractedData(result.extracted);
        } else {
          setStatus("failed");
          setErrorMsg(result.reason);
        }
      } catch (err) {
        setStatus("failed");
        setErrorMsg(err.message || "Something went wrong. Please try again.");
      }
    })();
  }, [imageFile]);

  const stopCamera = useCallback(() => {
    if (detectionRef.current) {
      cancelAnimationFrame(detectionRef.current);
      detectionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCamGuide("Align your Alumni ID inside the frame");
    capturedRef.current = false;
  }, []);

  const startDetectionLoop = useCallback(() => {
    const GRACE_PERIOD_MS = 3000;
    const STABLE_NEEDED = 70;
    const startTime = Date.now();
    let stable = 0;
    let lastScore = 0;

    const analyse = () => {
      if (!videoRef.current || !canvasRef.current || capturedRef.current)
        return;

      const elapsed = Date.now() - startTime;
      if (elapsed < GRACE_PERIOD_MS) {
        const secondsLeft = Math.ceil((GRACE_PERIOD_MS - elapsed) / 1000);
        if (secondsLeft > 0)
          setCamGuide(`Get your Alumni ID ready... (${secondsLeft})`);
        detectionRef.current = requestAnimationFrame(analyse);
        return;
      }
      if (elapsed >= GRACE_PERIOD_MS && elapsed < GRACE_PERIOD_MS + 100) {
        setCamGuide("Align your Alumni ID inside the frame");
      }

      const video = videoRef.current;
      const vW = video.videoWidth || 640;
      const vH = video.videoHeight || 480;
      const fX = Math.floor(vW * 0.06);
      const fY = Math.floor(vH * 0.2);
      const fW = Math.floor(vW * 0.88);
      const fH = Math.floor(vH * 0.6);
      const W = 160;
      const H = Math.round(160 * (fH / fW));

      const canvas = canvasRef.current;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, fX, fY, fW, fH, 0, 0, W, H);
      const { data } = ctx.getImageData(0, 0, W, H);

      let bright = 0;
      for (let i = 0; i < data.length; i += 4)
        bright += (data[i] + data[i + 1] + data[i + 2]) / 3;
      const avgBright = bright / (W * H);
      if (avgBright < 35) {
        setCamGuide("Too dark — move to a brighter area");
        stable = 0;
        detectionRef.current = requestAnimationFrame(analyse);
        return;
      }
      if (avgBright > 230) {
        setCamGuide("Too bright — reduce glare or move away from light");
        stable = 0;
        detectionRef.current = requestAnimationFrame(analyse);
        return;
      }

      const g = (i) => (data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3;
      const edge = new Uint8Array(W * H);
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          const gx =
            -g(i - W - 1) +
            g(i - W + 1) -
            2 * g(i - 1) +
            2 * g(i + 1) -
            g(i + W - 1) +
            g(i + W + 1);
          const gy =
            -g(i - W - 1) -
            2 * g(i - W) -
            g(i - W + 1) +
            g(i + W - 1) +
            2 * g(i + W) +
            g(i + W + 1);
          if (Math.sqrt(gx * gx + gy * gy) > 45) edge[i] = 1;
        }
      }

      const BORDER = 12;
      let topE = 0,
        botE = 0,
        leftE = 0,
        rightE = 0;
      for (let x = 0; x < W; x++) {
        for (let y = 0; y < BORDER; y++) if (edge[y * W + x]) topE++;
        for (let y = H - BORDER; y < H; y++) if (edge[y * W + x]) botE++;
      }
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < BORDER; x++) if (edge[y * W + x]) leftE++;
        for (let x = W - BORDER; x < W; x++) if (edge[y * W + x]) rightE++;
      }

      const topScore = topE / (W * BORDER);
      const botScore = botE / (W * BORDER);
      const leftScore = leftE / (H * BORDER);
      const rightScore = rightE / (H * BORDER);
      const BORDER_THRESH = 0.12;
      const cardFillsFrame =
        topScore > BORDER_THRESH &&
        botScore > BORDER_THRESH &&
        leftScore > BORDER_THRESH &&
        rightScore > BORDER_THRESH;
      let totalEdge = 0;
      for (let i = 0; i < edge.length; i++) if (edge[i]) totalEdge++;
      const density = totalEdge / (W * H);

      const skinRatio = (() => {
        let skinCount = 0;
        let total = 0;
        const xStart = Math.floor(W * 0.2);
        const xEnd = Math.floor(W * 0.8);
        const yStart = Math.floor(H * 0.2);
        const yEnd = Math.floor(H * 0.8);
        for (let y = yStart; y < yEnd; y++) {
          for (let x = xStart; x < xEnd; x++) {
            const i = (y * W + x) * 4;
            const r = data[i],
              g = data[i + 1],
              b = data[i + 2];
            if (
              r > 95 &&
              g > 40 &&
              b > 20 &&
              r > g &&
              g > b &&
              r - g > 15 &&
              r - b > 15
            )
              skinCount++;
            total++;
          }
        }
        return skinCount / total;
      })();
      const likelySkin = skinRatio > 0.55;

      const score = topScore + botScore + leftScore + rightScore + density;
      const diff = Math.abs(score - lastScore);
      lastScore = score;

      if (!cardFillsFrame && density < 0.05) {
        setCamGuide("Place your Alumni ID inside the frame");
        stable = 0;
      } else if (likelySkin && cardFillsFrame) {
        setCamGuide("That looks like a hand — please show your Alumni ID");
        stable = 0;
      } else if (
        !cardFillsFrame &&
        topScore < BORDER_THRESH &&
        botScore < BORDER_THRESH
      ) {
        setCamGuide("Move closer — ID is too far away");
        stable = 0;
      } else if (
        !cardFillsFrame &&
        (leftScore < BORDER_THRESH || rightScore < BORDER_THRESH)
      ) {
        setCamGuide("Centre the ID — align it with the frame edges");
        stable = 0;
      } else if (!cardFillsFrame) {
        setCamGuide("Align the ID to fill the frame");
        stable = 0;
      } else if (diff > 0.08) {
        setCamGuide("Hold still — keep the ID steady");
        stable = Math.max(0, stable - 8);
      } else {
        stable++;
        const left = Math.max(0, STABLE_NEEDED - stable);
        if (left > 40) setCamGuide("ID detected — hold steady...");
        else if (left > 0) setCamGuide(`Almost ready — keep still (${left})`);
        else {
          capturedRef.current = true;
          setCamGuide("✓ Capturing...");
          canvas.width = vW;
          canvas.height = vH;
          ctx.drawImage(video, 0, 0, vW, vH);
          canvas.toBlob(
            (blob) => {
              const file = new File([blob], "captured-id.jpg", {
                type: "image/jpeg",
              });
              setPreview(URL.createObjectURL(blob));
              setImageFile(file);
              stopCamera();
            },
            "image/jpeg",
            0.95,
          );
          return;
        }
      }
      detectionRef.current = requestAnimationFrame(analyse);
    };
    detectionRef.current = requestAnimationFrame(analyse);
  }, [stopCamera]);

  const startCamera = async () => {
    setShowModal(false);
    capturedRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setCamGuide("Align your Alumni ID inside the frame");
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            startDetectionLoop();
          };
        }
      }, 100);
    } catch (err) {
      setErrorMsg(
        "Could not access camera. Please allow camera permission or use file upload instead.",
      );
      setStatus("failed");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setShowModal(false);
  };

  const handleReset = () => {
    setPreview(null);
    setImageFile(null);
    setStatus("idle");
    setErrorMsg("");
    setExtractedData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNext = () => {
    if (status !== "verified" || !agreed) return;
    onVerified({ fromIDVerification: true, ...extractedData });
  };

  const borderColor = {
    idle: "rgba(0,0,0,0.25)",
    scanning: "#51A2FF",
    verified: "#22C55E",
    failed: "#EF4444",
  }[status];
  const frameBorder = camGuide.startsWith("✓")
    ? "#22C55E"
    : camGuide.startsWith("Good") || camGuide.startsWith("Almost")
      ? "#F59E0B"
      : "rgba(81,162,255,0.8)";

  return (
    <IDRegistrationView
      fileInputRef={fileInputRef}
      videoRef={videoRef}
      canvasRef={canvasRef}
      agreed={agreed}
      preview={preview}
      showModal={showModal}
      cameraActive={cameraActive}
      status={status}
      errorMsg={errorMsg}
      extractedData={extractedData}
      camGuide={camGuide}
      borderColor={borderColor}
      frameBorder={frameBorder}
      setAgreed={setAgreed}
      setShowModal={setShowModal}
      startCamera={startCamera}
      stopCamera={stopCamera}
      handleFileChange={handleFileChange}
      handleReset={handleReset}
      handleNext={handleNext}
      isModal
      onClose={onClose}
      onSwitchToLogin={onSwitchToLogin}
    />
  );
};

export default ModalIDRegistration;