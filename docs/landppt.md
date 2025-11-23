---
id: landppt
title: LandPPT 项目说明
slug: /landppt
---

> LandPPT 将需求采集、深度研究、模板套用和 PPT 编辑整合为一个 AI 驱动的平台。本页聚焦「为什么选用 LandPPT、体验路径、部署方式以及组件之间的关系」。

## 核心能力图

![image](https://img.pub/p/223482017da336e24b40.png)

- **多阶段 AI 工作流**：需求确认 → AI 大纲 → PPT HTML → 导出 PPTX/PDF/图片。
- **模型矩阵**：可按功能拆分默认模型（大纲、内容、配图、演讲稿等），支持 OpenAI、Claude、Gemini、Azure OpenAI、302.AI、Ollama 等兼容接口。
- **内容输入**：手动主题 + 多文件上传（PDF/Word/Excel/Markdown/图片），辅以 MinerU、MarkItDown 做结构化解析。
- **研究与素材**：Tavily/SearXNG/Playwright 抓取最新资料；图像服务集成本地图床、Pixabay/Unsplash、DALL·E/SiliconFlow/Pollinations。
- **编辑体验**：可视化大纲 + CodeMirror 编辑器 + AI 助手，支持模板导入、视觉参考、批量操作、演讲稿导出。
- **企业部署**：单机/容器、本地模型（Ollama）、可选外网访问限制、细粒度 API Key 控制。

## 平台模块关系

| 模块 | 作用 | 文档 |
| ---- | ---- | ---- |
| 需求 & 大纲看板 | 确认素材、触发 AI 生成、审核结构 | [大纲生成与编辑](./outline-board.md) |
| PPT 编辑器 | 实时预览 + HTML/AI 编辑 + 导出 | [PPT 编辑器说明](./ppt-editor.md) |
| 模板管理 | 维护 HTML 模板、AI 生成模板、设为默认 | [模板管理配置](./template-management.md) |
| 图床服务 | 上传、搜索、批量处理图片素材 | [图床服务说明](./image-gallery.md) |
| 系统配置 | AI 供应商、生成参数、应用配置、图片服务 | [系统配置说明](./configuration.md) |

## 使用路径

1. **创建项目**：填写主题、受众、页数范围、场景或上传文件 → 选择 AI 模型与模板 → 提交生成。
2. **校对大纲**：在看板中切换详细/简洁视图、逐页编辑或直接编辑 JSON → 同步到 PPT 编辑器。
3. **编辑幻灯片**：在编辑器中预览、手写 HTML、调用 AI 对话优化布局并自动配图。
4. **导出/分享**：输出 HTML、PDF、PPTX 或分享链接；必要时回到大纲阶段重生，迭代更新。

## 部署方式

### 系统要求

- Python 3.11+
- SQLite 3（可替换为任意 SQLAlchemy 兼容数据库）
- Docker（可选）

### 使用 uv（推荐）

```bash
git clone https://github.com/sligter/LandPPT.git
cd LandPPT
uv sync
uv pip install apryse-sdk --extra-index-url=https://pypi.apryse.com  # PPTX 导出可选
cp .env.example .env
uv run python run.py
```

### 使用 venv/pip

```bash
git clone https://github.com/sligter/LandPPT.git
cd LandPPT
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -e .
cp .env.example .env
python run.py
```

### Docker

```bash
docker pull bradleylzh/landppt:latest
docker run -d \
  --name landppt \
  -p 8000:8000 \
  -v $(pwd)/.env:/app/.env \
  -v landppt_data:/app/data \
  -v landppt_reports:/app/research_reports \
  -v landppt_cache:/app/temp \
  bradleylzh/landppt:latest
docker logs -f landppt
```

> `.env` 是所有模式的必需文件，用于声明 API Key、数据库、图像服务等敏感配置。

## 配置概览

| 区域 | 关键字段/操作 |
| ---- | ------------- |
| AI 提供商 | `DEFAULT_AI_PROVIDER`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `AZURE_OPENAI_*`, `OLLAMA_BASE_URL` |
| 生成参数 | `MAX_TOKENS`, `TEMPERATURE`, `TOP_P`, `ENABLE_PARALLEL_GENERATION`, `PARALLEL_SLIDES_COUNT`, `ENABLE_AUTO_LAYOUT_REPAIR` |
| 研究服务 | `TAVILY_API_KEY`, `SEARXNG_HOST`, `RESEARCH_PROVIDER` |
| 图像服务 | `ENABLE_IMAGE_SERVICE`, `PIXABAY_API_KEY`, `UNSPLASH_ACCESS_KEY`, `SILICONFLOW_API_KEY`, `POLLINATIONS_API_TOKEN` |
| 应用配置 | `HOST`, `PORT`, `BASE_URL`, `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `MAX_FILE_SIZE`, `UPLOAD_DIR` |
| 导出/扩展 | `APRYSE_LICENSE_KEY`、`ENABLE_PARALLEL_GENERATION`、`ENABLE_SMART_IMAGE_SELECTION` |

详细字段含义请参阅 [系统配置说明](./configuration.md)。

## 技术栈与 API

- **后端**：FastAPI + SQLAlchemy + Pydantic，提供 Swagger (`/docs`) 与 ReDoc (`/redoc`)。
- **AI 集成**：OpenAI 官方 SDK、Anthropic、Google Gemini、Azure OpenAI、302.AI 以及任意兼容 OpenAI 的接口（可配置 Base URL）。
- **研究/解析**：MinerU、MarkItDown、BeautifulSoup4、Tavily、SearXNG、Playwright。
- **导出**：Playwright (HTML→PDF)、Apryse SDK (PPTX)。
- **可观测性**：内置执行日志面板，方便复盘 AI 生成过程。

## 面向开发者

1. **扩展模型/服务**：若要接入新的 provider，可参考 `ai_config.html` 中的卡片结构，新增字段后通过 `.env` + API 同步保存。
2. **自定义模板/编辑器**：所有前端界面采用 Jinja + 原生 JS，模板路径位于 `templates/`。可以安全地插入自定义组件、指令或内网脚本。
3. **二次开发建议**：
   - 使用 `.docusaurus` 生成的静态文档作为团队知识库，避免重复培训。
   - 新增 API 后，在 FastAPI Router 上添加 Tag，确保 Swagger 中易于检索。
   - 如果引入新语言或行业，可在大纲 JSON 的 `metadata` 中添加字段，编辑器会跟随展示。

## 常见问题

- **能否离线部署？** 可以，Docker + Ollama + 本地数据库即可；仅需要在 `.env` 中关闭图片/研究所需的外部服务。
- **批量生成会降低质量吗？** 不会，只是调整请求并发度；如受模型限频限制，可在「系统配置 → 生成参数」中调低并发页数。
- **图片链接指向 localhost？** 在「系统配置 → 应用配置 → BASE_URL」中填入代理域名后保存即可。
- **如何备份大纲？** 在大纲看板中点击“导出 JSON”；该文件也可以再次导入或直接写入编辑器。

## 资源与社区

- 仓库：[https://github.com/sligter/LandPPT](https://github.com/sligter/LandPPT)
- Issue：[https://github.com/sligter/LandPPT/issues](https://github.com/sligter/LandPPT/issues)
- Discussions：[https://github.com/sligter/LandPPT/discussions](https://github.com/sligter/LandPPT/discussions)
- Telegram：[https://t.me/+EaOfoceoNwdhNDVlsh](https://t.me/+EaOfoceoNwdhNDVlsh)
- Docker 镜像：`bradleylzh/landppt`
- 许可证：Apache-2.0（详见 `LICENSE`）

如果本项目对你有帮助，欢迎 Star ⭐ 并提出建议。
