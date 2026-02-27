# Memoria.chat

带记忆和人格的私人 AI 聊天客户端——你的 AI 搭档能记住你是谁、适应你的风格、在对话中持续进化。

开源、本地部署、零代码基础也能跑。支持 OpenAI / 火山引擎 / OpenRouter 三渠道多模型。

## 快速开始

**前置条件：** [Node.js](https://nodejs.org/)（推荐 v20）+ [Git](https://git-scm.com/downloads)

```bash
git clone https://github.com/rullerzhou-afk/memoria-chat.git
cd memoria-chat
npm install
cp .env.example .env   # 编辑 .env，填入至少一个渠道的 API Key
npm start              # 访问 http://127.0.0.1:3000
```

**后续更新：** `git pull && npm install && npm start`

## 功能特性

### 记忆系统
- **结构化长期记忆** — 三层分类存储（核心身份 / 偏好习惯 / 近期动态），每条含唯一 ID、日期、来源标记
- **自动学习** — 对话后自动提取用户信息，支持新增 / 更新 / 删除，矛盾信息自动替换而非堆积
- **智能注入** — 按优先级选择记忆注入上下文（identity 必带，其余按日期和 token 预算裁剪），不浪费 token
- **记忆管理** — 设置面板分类展示，支持手动添加和删除，容量告警

### 人格工程
- **自定义人格** — 通过 system prompt 定义 AI 的性格、语气、技能，内置精调模板
- **人格版本管理** — 修改时自动存快照，支持历史查看与一键恢复
- **个性化设置** — 自定义 AI 名称和你的称呼，对话体验更贴合
- **优先级规则** — 用户指令 > 人格设定 > 记忆，冲突时有明确的执行顺序

### 对话能力
- **三渠道多模型** — OpenAI / 火山引擎 / OpenRouter，根据模型 ID 自动路由
- **SSE 流式回复** — 实时显示生成内容，打字机效果
- **联网搜索** — Serper.dev Google 搜索，AI 自动判断是否需要搜索
- **思考链展示** — 推理模型的思考过程可折叠查看
- **图片上传** — 支持 vision 模型的图片理解

### 数据管理
- **ChatGPT 数据导入** — 拖入完整导出文件夹，对话和图片一起恢复；AI 分析后智能融合到现有 Prompt
- **对话持久化** — 服务端 JSON 文件存储，聊天记录不丢失
- **批量管理 & 搜索** — 全文搜索历史对话，支持批量删除
- **消息编辑与重新生成** — 编辑已发送消息或重新生成 AI 回复

### 其他
- **移动端适配** — 响应式布局，手机上也能流畅使用
- **亮/暗主题切换** — 暗色、亮色、跟随系统三档
- **Token 用量显示** — 每条回复显示 token 数、模型名、响应时间
- **上下文条数控制** — 可调节历史消息条数（4-500），平衡记忆与 token 消耗

## API Key 获取

三个渠道至少配置一个，下拉框只会显示已配置渠道的模型：

| 渠道 | 获取地址 | 说明 |
|------|----------|------|
| **OpenAI** | https://platform.openai.com/api-keys | GPT-4o / GPT-4.1 / o3 系列 |
| **火山引擎** | https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey | GLM / Kimi 系列，国内直连 |
| **OpenRouter** | https://openrouter.ai/keys | 聚合平台，一个 key 用几百个模型 |
| **Serper** (搜索) | https://serper.dev | 免费 2500 次 Google 搜索，配置后自动启用 |

## 环境变量

复制 `.env.example` 为 `.env` 并填写：

| 变量 | 必需 | 说明 |
|------|------|------|
| `OPENAI_API_KEY` | 三选一 | OpenAI API 密钥 |
| `OPENAI_BASE_URL` | 否 | OpenAI 兼容网关地址（默认官方） |
| `ARK_API_KEY` | 三选一 | 火山引擎方舟平台 API key |
| `ARK_BASE_URL` | 否 | 火山方舟 API 地址（默认 `https://ark.cn-beijing.volces.com/api/v3`） |
| `OPENROUTER_API_KEY` | 三选一 | OpenRouter API key |
| `OPENROUTER_BASE_URL` | 否 | OpenRouter API 地址（默认 `https://openrouter.ai/api/v1`） |
| `OPENROUTER_SITE_URL` | 否 | OpenRouter 请求头 `HTTP-Referer` |
| `OPENROUTER_APP_NAME` | 否 | OpenRouter 请求头 `X-Title`（默认 `memoria-chat`） |
| `ADMIN_TOKEN` | 视情况 | 鉴权 token；非 localhost 访问时**必须设置** |
| `SERPER_API_KEY` | 否 | Serper.dev 搜索 API key |
| `HOST` / `PORT` | 否 | 监听地址，默认 `127.0.0.1:3000` |
| `MODEL` | 否 | 默认模型，fallback `gpt-4o` |
| `AUTO_LEARN_MODEL` | 否 | 自动记忆提取模型，留空自动选择 |
| `AUTO_LEARN_COOLDOWN` | 否 | 自动记忆冷却秒数，默认 `300` |

## 远程访问

默认只监听 localhost。需要远程访问时，在 `.env` 中设置 `HOST=0.0.0.0` 和 `ADMIN_TOKEN`。推荐通过 [Tailscale](https://tailscale.com/)、[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) 或 ngrok 暴露端口。

## Docker 部署

```bash
git clone https://github.com/rullerzhou-afk/memoria-chat.git
cd memoria-chat
cp .env.example .env    # 编辑 .env，填入 API Key 和 ADMIN_TOKEN（Docker 部署必填）
docker compose up -d    # 访问 http://localhost:3000
```

```bash
docker compose logs -f          # 查看日志
docker compose down && docker compose up -d   # 修改 .env 后重建（restart 不会重读 .env）
git pull && docker compose up -d --build      # 更新版本
```

数据持久化在宿主机 `data/` 和 `prompts/`，删除容器不丢数据。

## 配置文件

通过网页设置面板或直接编辑文件，修改后无需重启：

| 文件 | 用途 |
|------|------|
| `prompts/system.md` | 人格指令（AI 的性格、语气、规则） |
| `prompts/memory.md` | 用户记忆（auto-learn 自动维护） |
| `prompts/config.json` | 模型参数（model、temperature 等） |

## 模型推荐

| 模型 | 体验 | 适合场景 |
|------|------|----------|
| `gpt-4o-2024-11-20` | ⭐⭐⭐⭐⭐ 人格最稳 | 人格还原、深度对话 |
| `gpt-4.1` | ⭐⭐⭐⭐ 指令遵循强 | 工具向用户 |
| GLM-4-Plus / GLM-4.7 | ⭐⭐⭐⭐ 中文自然 | 国内直连 |
| Kimi | ⭐⭐⭐⭐ 长上下文好 | 长文创作 |
| DeepSeek R1 | ⭐⭐⭐ 推理强，人格弱 | 数学/逻辑/代码 |

## 联网搜索

配置 `SERPER_API_KEY` 后自动启用。搜索依赖 function calling，部分模型不支持：

| 模型 | 搜索 | 说明 |
|------|:----:|------|
| GPT-4o / GPT-4.1 / o3 | ✅ | 原生 function calling |
| OpenRouter 多数模型 | ✅ | Claude / Gemini 等 |
| DeepSeek R1 等推理模型 | ❌ | 不支持 function calling |
| GLM / Kimi | ❌ | 不返回结构化工具调用 |

## 技术栈

- **后端**: Node.js + Express + OpenAI SDK (v4)
- **前端**: 纯 HTML/CSS/JS（无框架），marked.js + DOMPurify (CDN)
- **存储**: 文件系统（JSON）

无构建步骤、无数据库、无框架依赖，一个 `npm start` 就跑起来。

## License

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) — 可自由下载、学习、修改、分享，但不可商用。
