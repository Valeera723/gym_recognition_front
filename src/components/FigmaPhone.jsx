export function FigmaPhone({ page, onNavigate, showHotspots }) {
  const imageUrl = `${import.meta.env.BASE_URL}figma-images/${encodeURIComponent(page.image)}`;

  return (
    <div className="phone-shell">
      <div className="phone-status-bar" aria-hidden="true">
        <span>9:41</span>
        <span>5G</span>
      </div>
      <div
        className="figma-page"
        style={{
          "--page-width": page.width,
          "--page-height": page.height,
          aspectRatio: `${page.width} / ${page.height}`,
        }}
      >
        <img
          alt={page.title}
          className="figma-page-image"
          draggable="false"
          src={imageUrl}
        />
        {page.links.map((link, index) => (
          <button
            aria-label={`${link.name} to page ${link.targetIndex}`}
            className={showHotspots ? "hotspot is-visible" : "hotspot"}
            key={`${page.index}-${index}-${link.name}`}
            onClick={() => onNavigate(link.targetIndex)}
            style={{
              left: `${(link.rect.x / page.width) * 100}%`,
              top: `${(link.rect.y / page.height) * 100}%`,
              width: `${(link.rect.width / page.width) * 100}%`,
              height: `${(link.rect.height / page.height) * 100}%`,
            }}
            title={`${link.name} -> ${link.targetIndex}`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
