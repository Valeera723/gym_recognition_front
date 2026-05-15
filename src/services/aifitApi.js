const API_BASE = import.meta.env.VITE_AIFIT_API_BASE ?? "";

export async function recognizeEquipmentImage(file) {
  const form = new FormData();
  form.append("image", file);
  return postForm("/api/equipment/recognize", form, mockEquipmentResult);
}

export async function startCorrectionSession(payload) {
  return postJson("/api/correction/session", payload, mockCorrectionResult);
}

export async function analyzeCorrectionVideo(file, payload = {}) {
  const form = new FormData();
  form.append("video", file);
  form.append("metadata", JSON.stringify(payload));
  return postForm("/api/correction/analyze-video", form, mockCorrectionResult);
}

async function postJson(path, payload, fallback) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) throw new Error(`API ${response.status}`);
    return response.json();
  } catch (error) {
    return fallback(error);
  }
}

async function postForm(path, form, fallback) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      body: form,
      method: "POST",
    });
    if (!response.ok) throw new Error(`API ${response.status}`);
    return response.json();
  } catch (error) {
    return fallback(error);
  }
}

function mockEquipmentResult() {
  return {
    equipment: "lat-pulldown",
    equipmentLabel: "高位下拉器械",
    confidence: 0.93,
    nextAction: "correction-session",
    tips: ["握距略宽于肩", "肩胛先下沉", "向胸口上方下拉"],
  };
}

function mockCorrectionResult() {
  return {
    sessionId: `mock-${Date.now()}`,
    score: 86,
    summary: "本组完成度 86",
    suggestions: ["离心阶段再慢一点", "保持胸椎打开", "避免耸肩代偿"],
  };
}
