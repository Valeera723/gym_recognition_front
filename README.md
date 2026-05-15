# AI-FIT Mobile Web Rebuild

This project rebuilds the AI-FIT Figma prototype as a maintainable mobile web app.

## Source Material

- Figma prototype: https://www.figma.com/proto/X9ZgG2nXPGt7alEb1Bucu7/AI-FIT?node-id=102-4626&scaling=scale-down&content-scaling=fixed&page-id=0%3A1
- Figma design: https://www.figma.com/design/X9ZgG2nXPGt7alEb1Bucu7/AI-FIT?node-id=0-1&t=i2ubKgCBnKxVWOAs-1
- Figma Dev Mode: https://www.figma.com/design/X9ZgG2nXPGt7alEb1Bucu7/AI-FIT?node-id=0-1&m=dev&t=i2ubKgCBnKxVWOAs-1
- Local export used for the first pass: `D:\gym_equipment recognition`

## Run

Install dependencies, then start Vite:

```powershell
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

This Codex environment currently has Node but no `npm`, so `public/preview.html` is also included as a dependency-free preview of the same Figma manifest and assets.

## Deploy To GitHub Pages

1. Create a GitHub repository, for example `aifit-mobile-web`.
2. Push this project to the `main` branch.
3. In the GitHub repository, open `Settings > Pages`.
4. Set `Build and deployment > Source` to `GitHub Actions`.
5. Open the `Actions` tab and wait for `Deploy AI-FIT to GitHub Pages` to finish.

The site URL will usually be:

```text
https://YOUR_GITHUB_USERNAME.github.io/aifit-mobile-web/
```

## AI Integration Boundary

The frontend is prepared for a Python YOLOv11 backend with these endpoints:

- `POST /api/equipment/recognize`
- `POST /api/correction/session`
- `POST /api/correction/analyze-video`

Set `VITE_AIFIT_API_BASE` when the backend runs on a separate host or port.
