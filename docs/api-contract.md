# AI-FIT API Contract

这份文档约定前端和 YOLOv11 / 动作纠偏后端怎么通信。后端同学实现接口时尽量保持这里的路径和返回字段稳定，前端同学不要在没有沟通的情况下改接口字段。

## Deployment Shape

开发期推荐结构：

```text
GitHub Pages frontend
  -> HTTPS request
  -> ngrok / Cloudflare Tunnel
  -> local GPU machine
  -> Python FastAPI backend
  -> YOLOv11 equipment model / correction scripts
```

前端通过环境变量配置后端地址：

```text
VITE_AIFIT_API_BASE=https://your-ngrok-domain.ngrok-free.app
```

## CORS

后端需要允许 GitHub Pages 域名访问：

```text
https://valeera723.github.io
```

开发期也可以允许：

```text
http://127.0.0.1:5173
http://127.0.0.1:4173
http://localhost:5173
```

## Authentication

演示期至少加一个简单 token，避免别人拿到 ngrok 地址后滥用 GPU。

推荐请求头：

```http
Authorization: Bearer <AIFIT_API_TOKEN>
```

前端环境变量：

```text
VITE_AIFIT_API_TOKEN=replace-me
```

当前前端还没有强制使用 token，接真实后端时再加入。

## Equipment Recognition

### `POST /api/equipment/recognize`

用于上传图片识别健身器械。

Request:

```http
Content-Type: multipart/form-data
```

Form fields:

```text
image: File
source?: "upload" | "camera"
```

Success response:

```json
{
  "equipment": "lat-pulldown",
  "equipmentLabel": "高位下拉器械",
  "confidence": 0.93,
  "nextAction": "correction-session",
  "tips": ["握距略宽于肩", "肩胛先下沉", "向胸口上方下拉"]
}
```

Error response:

```json
{
  "error": {
    "code": "NO_EQUIPMENT_DETECTED",
    "message": "未识别到明确的健身器械"
  }
}
```

## Correction Session

### `POST /api/correction/session`

用于启动实时动作纠偏会话。前端识别出器械后，可以用这个接口让后端选择对应动作纠偏脚本。

Request:

```json
{
  "equipment": "lat-pulldown",
  "exercise": "wide-grip-lat-pulldown",
  "sourcePage": "拍照识别器械页"
}
```

Success response:

```json
{
  "sessionId": "session_20260515_001",
  "equipment": "lat-pulldown",
  "exercise": "wide-grip-lat-pulldown",
  "streamUrl": "wss://your-ngrok-domain.ngrok-free.app/ws/correction/session_20260515_001",
  "status": "ready"
}
```

## Video Correction Analysis

### `POST /api/correction/analyze-video`

用于上传一段训练视频，后端在一组动作完成后给出评分和建议。

Request:

```http
Content-Type: multipart/form-data
```

Form fields:

```text
video: File
metadata: JSON string
```

Example metadata:

```json
{
  "equipment": "seated-row",
  "exercise": "seated-row",
  "repsTarget": 12
}
```

Success response:

```json
{
  "sessionId": "video_20260515_001",
  "score": 86,
  "summary": "本组完成度 86",
  "repCount": 11,
  "suggestions": ["离心阶段再慢一点", "保持胸椎打开", "避免耸肩代偿"],
  "timeline": [
    {
      "time": 3.2,
      "level": "warning",
      "message": "第 2 次动作出现耸肩"
    }
  ]
}
```

## Equipment IDs

先约定这些 ID，后续可以扩展：

```text
lat-pulldown
seated-row
face-pull
treadmill
smith-machine
leg-press
chest-press
cable-machine
unknown
```

## Frontend Integration Points

当前前端 API 文件：

```text
src/services/aifitApi.js
```

当前入口组件：

```text
src/components/RecognitionPanel.jsx
```

后端路径或返回字段调整时，请同步修改这两个文件，并更新本文档。
