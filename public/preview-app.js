const quickPages = [
  ["启动", 15],
  ["计划", 13],
  ["识别", 12],
  ["结果", 14],
  ["纠偏", 30],
  ["总结", 58],
];

const aiPages = new Set([4, 12, 14, 30, 37, 46, 49, 53, 56, 57, 58, 59]);

const state = {
  current: 15,
  history: [],
  hotspots: true,
  manifest: null,
};

const elements = {
  aiPanel: document.querySelector("#aiPanel"),
  aiStatus: document.querySelector("#aiStatus"),
  back: document.querySelector("#back"),
  cameraBtn: document.querySelector("#cameraBtn"),
  home: document.querySelector("#home"),
  hotspots: document.querySelector("#hotspots"),
  imageInput: document.querySelector("#imageInput"),
  meta: document.querySelector("#meta"),
  pageSelect: document.querySelector("#pageSelect"),
  quick: document.querySelector("#quick"),
  screen: document.querySelector("#screen"),
  sessionBtn: document.querySelector("#sessionBtn"),
  videoInput: document.querySelector("#videoInput"),
};

const response = await fetch("/figma-manifest.json");
state.manifest = await response.json();

const pageByIndex = new Map(state.manifest.pages.map((page) => [page.index, page]));

elements.quick.innerHTML = quickPages
  .map(([label, index]) => `<button data-index="${index}">${label}</button>`)
  .join("");

elements.pageSelect.innerHTML = state.manifest.pages
  .slice()
  .sort((a, b) => a.index - b.index)
  .map((page) => `<option value="${page.index}">${String(page.index).padStart(2, "0")} · ${page.title}</option>`)
  .join("");

elements.quick.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (button) navigate(Number(button.dataset.index));
});

elements.back.addEventListener("click", () => {
  const previous = state.history.pop();
  if (previous !== undefined) {
    state.current = previous;
    render();
  }
});

elements.home.addEventListener("click", () => navigate(state.manifest.defaultPageIndex));

elements.hotspots.addEventListener("click", () => {
  state.hotspots = !state.hotspots;
  render();
});

elements.pageSelect.addEventListener("change", (event) => navigate(Number(event.target.value)));

elements.imageInput.addEventListener("change", () => {
  elements.aiStatus.textContent = "识别中";
  setTimeout(() => {
    elements.aiStatus.textContent = "高位下拉器械 93%";
    navigate(14);
  }, 520);
});

elements.sessionBtn.addEventListener("click", () => {
  elements.aiStatus.textContent = "纠偏中";
  setTimeout(() => {
    elements.aiStatus.textContent = "本组完成度 86";
    navigate(58);
  }, 520);
});

elements.videoInput.addEventListener("change", () => {
  elements.aiStatus.textContent = "分析中";
  setTimeout(() => {
    elements.aiStatus.textContent = "本组完成度 86";
    navigate(58);
  }, 700);
});

elements.cameraBtn.addEventListener("click", async () => {
  elements.aiStatus.textContent = "摄像头";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    stream.getTracks().forEach((track) => track.stop());
    elements.aiStatus.textContent = "高位下拉器械 93%";
    navigate(14);
  } catch {
    elements.aiStatus.textContent = "高位下拉器械 93%";
    navigate(14);
  }
});

function navigate(index) {
  if (!pageByIndex.has(index) || index === state.current) return;
  state.history.push(state.current);
  state.current = index;
  render();
}

function render() {
  const page = pageByIndex.get(state.current);
  elements.pageSelect.value = String(page.index);
  elements.hotspots.classList.toggle("active", state.hotspots);
  elements.aiPanel.style.display = aiPages.has(page.index) ? "grid" : "none";
  elements.meta.innerHTML = `<strong>${page.title}</strong><br>${Math.round(page.width)} x ${Math.round(page.height)}<br>${page.links.length} hotspots`;

  for (const button of elements.quick.querySelectorAll("button")) {
    button.classList.toggle("active", Number(button.dataset.index) === page.index);
  }

  elements.screen.style.aspectRatio = `${page.width} / ${page.height}`;
  elements.screen.innerHTML = `<img src="/figma-images/${encodeURIComponent(page.image)}" alt="${page.title}" />`;

  for (const [index, link] of page.links.entries()) {
    const hotspot = document.createElement("button");
    hotspot.className = state.hotspots ? "hotspot" : "hotspot hidden";
    hotspot.title = `${link.name} -> ${link.targetIndex}`;
    hotspot.style.left = `${(link.rect.x / page.width) * 100}%`;
    hotspot.style.top = `${(link.rect.y / page.height) * 100}%`;
    hotspot.style.width = `${(link.rect.width / page.width) * 100}%`;
    hotspot.style.height = `${(link.rect.height / page.height) * 100}%`;
    hotspot.addEventListener("click", () => navigate(link.targetIndex));
    hotspot.setAttribute("aria-label", `hotspot ${index + 1}`);
    elements.screen.append(hotspot);
  }
}

render();
