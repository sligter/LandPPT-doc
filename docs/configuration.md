---
id: configuration
title: 系统配置说明
slug: /configuration
---

> 所有运行时开关都集中在「系统配置中心」（默认地址 `http://<host>:8000/ai-config`）。

![image](https://img.pub/p/2c4509b730048d56ada9.png)

![image](https://img.pub/p/d748a1ff03d10ee6df5d.png)

![image](https://img.pub/p/c6e6d49a45ef625df514.png)

![image](https://img.pub/p/96098e7b04b7a643897e.png)

## 页面结构

| 标签页/区域 | 功能 | 备注 |
| ----------- | ---- | ---- |
| **AI 提供者** | 维护不同供应商的 API Key、Base URL、默认模型；可测试连通性、刷新状态 | 支持 OpenAI/Claude/Gemini/Azure/302AI/Ollama，自带模型列表拉取按钮 |
| **模型任务配置** | 在不同任务（大纲、配图、演讲稿、模板生成等）之间指定专用模型 | 留空则继承默认 provider，可精细化控制成本 |
| **生成参数** | Max Tokens、Temperature、Top-P、并发生成、自动布局修复 | 所有参数实时写入数据库，保存后即刻生效 |
| **应用配置** | HOST/PORT/BASE_URL、Session/Token、上传限制、数据库连接 | 适合运维/开发者调整服务特性 |
| **图片服务** | 启用本地图库、网络搜索、AI 生成；配置 provider 密钥和配额 | 与 [图床服务](./image-gallery.md) 联动 |



## 面向使用者的必备设置

### 1. AI 提供者

- **默认选择**：左上角单选按钮决定全局使用的 provider；如果接口连通，会显示绿色状态。
- **常见字段**：
  - OpenAI/兼容：`API Key`、`Base URL`、`默认模型`，可通过「📋」按钮拉取模型列表。
  - Anthropic、Google、Azure：分别填写官方密钥、端点和部署名称。
  - Ollama：设置 `Base URL`（默认 `http://localhost:11434`）与模型名（如 `llama3`）。
  - 302.AI：输入密钥即可，端点固定为 `https://api.302.ai/v1`。
- **模型任务配置**：在折叠面板中为「大纲、幻灯片、AI 编辑、演讲稿、配图提示词、模板生成、视觉分析」等功能指定不同模型。未填写时继承默认 provider，可用于区分高性能/低成本模型。

### 2. 生成参数

- **Max Tokens**：100~1,000,000。值越大越完整，也越耗时/耗费。
- **Temperature & Top-P**：建议 Temperature 0.5~0.8 控制创意度，Top-P 0.7~1.0 保障自然语言流畅。
- **Parallel Generation**：启用并发后可同时生成多页幻灯片，推荐值 3~5。若遇到模型限频或报错，可下调或关闭。
- **自动布局修复**：开启后，编辑器会在生成阶段尝试修复常见 HTML/CSS 排版问题。

### 3. 应用配置

- **运行参数**：`HOST`（默认 `0.0.0.0`）、`PORT`（默认 `8000`）、`BASE_URL`（配置反向代理或 CDN 时必填）、`RELOAD`（开发模式自动重启）。
- **安全**：`SECRET_KEY` 决定 Session/Token，加密必须自定义；`ACCESS_TOKEN_EXPIRE_MINUTES` 控制令牌有效期，0 代表永不过期。
- **上传/缓存**：`MAX_FILE_SIZE`、`UPLOAD_DIR`、`CACHE_TTL` 用于限制素材上传与研究结果缓存。
- **数据库**：`DATABASE_URL` 支持 SQLite、PostgreSQL、MySQL 等标准 SQLAlchemy URL。

### 4. 图片服务

1. **主开关**：勾选「启用图片服务」后可同时使用本地图库、网络搜索、AI 生成三种来源。
2. **AI 生成**：填写 `openai_api_key_image`（DALL·E）、`siliconflow_api_key`（Kolors）、`pollinations_api_token/referrer`，并在下拉框中选择默认 provider、图片质量、每页数量等。
3. **网络图库**：`unsplash_access_key`、`pixabay_api_key`、`searxng_host`（自建搜索实例）。
4. **来源细节**：为本地/网络/AI 分别设置「是否启用」「每页最大数量」「智能选择」等参数；Pollinations 还可以控制增强、NSFW 过滤、去 Logo、隐私、透明背景等选项。
5. **总体限制**：`max_total_images_per_slide` 与「智能图片选择」可以限制混合来源的总量并优化分配。

## 面向开发者/运维的扩展点

- **测试、刷新**：所有区域都提供「🧪 测试」与「🔄 刷新状态」，可用于 CI/CD 或运维巡检。
- **接口说明**：配置保存分别命中 `/api/config/ai_providers`、`/model_roles`、`/generation_params`、`/app_config`、`/image_service` 等端点，返回 JSON，方便脚本化。
- **版本管理**：配置存储在数据库中，但 `.env` 仍是初始来源。建议在部署流程中将 `.env` 与数据库配置表一同备份；如需恢复，可通过 API 或管理界面导入。
- **基础设施**：
  - 想要新增 provider：修改 `ai_config.html` & 后端配置 schema。
  - 想扩展图片服务：在 `image_service` API 中添加参数，同时更新前端 `image_gallery.html`。
  - 想锁定配置：可以在反向代理层限制 `/ai-config` 的访问，或在后端添加权限校验逻辑。

## 常见问题

- **保存后没有生效？** 检查是否被同事覆盖。密码类字段若为空不会覆盖旧值，若想清空请在后端 API 中手动设置。
- **反向代理后图片仍指向 localhost？** 在应用配置里将 `BASE_URL` 设置为真实外网地址，清除浏览器缓存后再次生成。
- **模型列表无法拉取？** 确认 `Base URL` 指向兼容 OpenAI 的 `/v1` 端点，同时密钥具有 `models` 权限。
- **图片服务报错？** 打开浏览器控制台查看 `image_service` 请求返回的 JSON，通常是密钥无效或网络受限。

通过合理设置上述选项，你可以精确控制 LandPPT 的模型策略、生成体验、系统资源与视觉输出，让平台在不同部署环境下都保持稳定可控。
