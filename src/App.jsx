import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Dumbbell,
  Home,
  ImageUp,
  Play,
  RotateCcw,
  Search,
  Upload,
  Video,
} from "lucide-react";
import manifest from "./data/figmaManifest.json";
import { FigmaPhone } from "./components/FigmaPhone.jsx";
import { RecognitionPanel } from "./components/RecognitionPanel.jsx";

const pageMap = new Map(manifest.pages.map((page) => [page.index, page]));

const quickPages = [
  { label: "启动", index: 15, icon: Home },
  { label: "计划", index: 13, icon: Dumbbell },
  { label: "识别", index: 12, icon: Camera },
  { label: "结果", index: 14, icon: Search },
  { label: "纠偏", index: 30, icon: Video },
  { label: "总结", index: 58, icon: Play },
];

const aiPages = new Set([4, 12, 14, 30, 37, 46, 49, 53, 56, 57, 58, 59]);

export function App() {
  const [pageIndex, setPageIndex] = useState(manifest.defaultPageIndex);
  const [history, setHistory] = useState([]);
  const [showHotspots, setShowHotspots] = useState(true);

  const page = pageMap.get(pageIndex) ?? pageMap.get(manifest.defaultPageIndex);
  const orderedPages = useMemo(
    () => [...manifest.pages].sort((a, b) => a.index - b.index),
    [],
  );

  function navigate(nextIndex) {
    if (!pageMap.has(nextIndex) || nextIndex === page.index) return;
    setHistory((items) => [...items, page.index].slice(-30));
    setPageIndex(nextIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setHistory((items) => {
      if (!items.length) return items;
      const next = [...items];
      const previous = next.pop();
      setPageIndex(previous);
      return next;
    });
  }

  return (
    <main className="app-shell">
      <aside className="workspace-panel" aria-label="AI-FIT prototype controls">
        <div className="brand-lockup">
          <span className="brand-mark">AI</span>
          <div>
            <h1>AI-FIT</h1>
            <p>Mobile prototype rebuild</p>
          </div>
        </div>

        <div className="toolbar-grid" aria-label="Quick pages">
          {quickPages.map(({ label, index, icon: Icon }) => (
            <button
              className={page.index === index ? "tool-button is-active" : "tool-button"}
              key={index}
              onClick={() => navigate(index)}
              title={label}
              type="button"
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="panel-row">
          <button className="icon-button" disabled={!history.length} onClick={goBack} title="返回" type="button">
            <ArrowLeft size={18} />
          </button>
          <button className="icon-button" onClick={() => navigate(manifest.defaultPageIndex)} title="回到启动页" type="button">
            <RotateCcw size={18} />
          </button>
          <button
            className={showHotspots ? "segmented is-on" : "segmented"}
            onClick={() => setShowHotspots((value) => !value)}
            type="button"
          >
            热区
          </button>
        </div>

        <label className="page-select">
          <span>页面</span>
          <select value={page.index} onChange={(event) => navigate(Number(event.target.value))}>
            {orderedPages.map((item) => (
              <option key={item.index} value={item.index}>
                {String(item.index).padStart(2, "0")} · {item.title}
              </option>
            ))}
          </select>
        </label>

        <div className="handoff-card">
          <strong>{page.title}</strong>
          <span>{Math.round(page.width)} x {Math.round(page.height)}</span>
          <span>{page.links.length} hotspots</span>
        </div>

        <div className="api-card">
          <div className="api-card-title">
            <Upload size={17} />
            <span>YOLOv11 API boundary</span>
          </div>
          <code>POST /api/equipment/recognize</code>
          <code>POST /api/correction/session</code>
          <code>POST /api/correction/analyze-video</code>
        </div>
      </aside>

      <section className="phone-stage">
        <FigmaPhone page={page} onNavigate={navigate} showHotspots={showHotspots} />
        {aiPages.has(page.index) && (
          <RecognitionPanel
            currentPage={page}
            onEquipmentResolved={() => navigate(14)}
            onCorrectionResolved={() => navigate(58)}
          />
        )}
      </section>
    </main>
  );
}
