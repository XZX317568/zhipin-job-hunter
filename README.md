# 🎯 Boss直聘 找工作助手

> 通过浏览器自动化 + API 数据，在 Boss直聘 上智能搜索岗位，自动筛选靠谱公司。

[![Node](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org)
[![Playwright](https://img.shields.io/badge/Playwright-1.60%2B-blue)](https://playwright.dev)
[![Edge](https://img.shields.io/badge/Microsoft%20Edge-✓-blueviolet)](https://www.microsoft.com/edge)
[![GitHub stars](https://img.shields.io/github/stars/XZX317568/zhipin-job-hunter?style=social)](https://github.com/XZX317568/zhipin-job-hunter)

> ⭐ 如果这个工具帮到了你，麻烦点个 **Star**，让更多人看到~

---

## ✨ 功能

| 功能 | 说明 |
|------|------|
| 🔍 **一键搜索** | 自动搜索 Boss直聘 指定岗位（关键词、城市由你设置） |
| ✅ **发布时间过滤** | 通过 API 获取公司活跃时间，自动标记一周以上未活跃的岗位 |
| 🏢 **公司背调查询** | 提供企查查/天眼查的筛选标准（注册资金、实缴资本、参保人数、成立年限） |
| 🚩 **招聘雷区检测** | 自动识别「打杂背锅」「底薪陷阱」「气氛活跃」等坑人话术 |
| 📱 **社交口碑参考** | 指导在脉脉/知乎/小红书查公司评价 |
| 💬 **招呼语生成** | 根据你的简历信息生成话术，确认后再投递 |

## 💡 在其他 AI 软件上使用

这个工具不依赖特定 AI，你可以用任何方式使用它：

### 方案一：复制粘贴（最简单 · 推荐）

```bash
# 1. 安装 + 运行
npm install
node boss-search.js
```

```text
# 2. 把输出的职位列表复制下来
 1. ✅ 岗位名称         薪资     公司名        区域          活跃时间
 2. ✅ 岗位名称         薪资     公司名        区域          活跃时间
...
```

```text
# 3. 粘贴到任意 AI（ChatGPT / Claude / Kimi / 通义 / DeepSeek / 豆包）
#    加上这句话让它帮你筛选：

请帮我看一下这些 Boss直聘 的职位，按以下标准筛选：

1️⃣ 企查查查公司：成立<1年、注册资金<100万、实缴资本<30万、参保0人、股东频繁变更的跳过
2️⃣ 招聘信息雷区：「积极完成领导交办事务」「薪资提成高收入无上限」「公司年轻气氛活跃」「薪资范围过大(3K-20K)」的跳过
3️⃣ 社交平台口碑：告诉我哪些公司需要查脉脉/知乎/小红书
4️⃣ activeTime 超过一周未活跃的跳过
5️⃣ 结合我的位置（你在哪）推荐通勤方便的
```

> ✅ 任何 AI 都能看懂中文招聘信息，按 SKILL.md 里的标准帮你筛选

### 方案二：导出 JSON 分析（适合深度研究）

```bash
# 修改 boss-search.js，在最后加一行：
const fs = require('fs');
fs.writeFileSync('jobs.json', JSON.stringify(jobList, null, 2));
```

然后把 `jobs.json` 上传给 AI（Claude / ChatGPT 支持文件上传），让它帮你逐家分析。

### 方案三：纯手动（不需要任何 AI）

```bash
node boss-search.js
```

脚本输出的列表已经标记了 ✅❌，你再打开 **企查查(qcc.com)** 搜公司名看注册资金和参保人数，全程不需要 AI 参与。

### 方案四：作为 MCP 工具（给支持 MCP 的 AI 客户端）

如果你用的 AI 客户端支持 MCP（如 Claude Desktop、Continue、Cursor），可以用 `add_mcp_server` 注册本工具为可调用工具。具体参考各客户端的 MCP 配置文档。

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动 Edge 调试模式

```bash
# 先关闭所有 Edge
taskkill /F /IM msedge.exe

# 以调试模式启动
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222
```

> 🧩 确保你已经登录了 Boss直聘

### 3. 运行搜索

```bash
node boss-search.js
```

脚本会自动搜索你设置的岗位关键词，输出类似：

```
 1. ✅ 岗位名称               薪资      公司名           区域          活跃时间
 2. ✅ 岗位名称               薪资      公司名           区域          活跃时间
 3. ❌ 岗位名称               薪资      公司名           区域          活跃时间
```

标记含义：✅ 本周活跃 | ❌ 超一周未活跃 | ❓ 未知

### 4. 筛选公司

拿到列表后，打开 **企查查(qcc.com)** 检查：

| 检查项 | 危险信号 |
|--------|---------|
| 成立时间 | < 1年 |
| 注册资金 | < 100万 |
| 实缴资本 | < 30万 或 0 |
| 参保人数 | 0人 |

然后在 **脉脉/知乎/小红书** 搜公司名查口碑。

## 📁 文件结构

```
├── SKILL.md          # 技能文档（含完整筛选方法）
├── boss-search.js    # 搜索脚本（一键运行）
├── package.json      # Node 依赖
├── .gitignore
└── README.md
```

## ⚙️ 自定义配置

打开 `boss-search.js`，修改顶部：

```js
const CONFIG = {
  jobKeyword: '你的岗位关键词',  // 如 仓管员、仓库管理员
  cityCode: '101280600',        // 城市编码（深圳=101280600）
};
```

### 常见城市编码

| 城市 | 编码 | 城市 | 编码 |
|------|:----:|------|:----:|
| 北京 | `101010100` | 广州 | `101280100` |
| 上海 | `101020100` | **深圳** | **`101280600`** |
| 杭州 | `101210100` | 东莞 | `101281600` |
| 成都 | `101270100` | 佛山 | `101280300` |
| 武汉 | `101200100` | 珠海 | `101280700` |
| 南京 | `101190100` | 中山 | `101281700` |
| 西安 | `101110100` | 惠州 | `101280500` |
| 长沙 | `101250100` | 苏州 | `101190400` |

> 其他城市可在 Boss直聘 搜索栏 URL 中获取（`city=xxxxxx`）。

## ❓ 常见问题

### 运行报错 `Cannot find module 'playwright'`
```bash
npm install
```

### 启动 Edge 后脚本没反应
确认 Edge 是以调试模式启动的（启动后命令行显示 `DevTools listening on ws://127.0.0.1:9222`）

### 输出全是 ❓ 未知
说明没有获取到公司活跃时间，可能是 Cookie 过期了，刷新 Edge 重新登录 Boss直聘

### 脚本提示「未捕获到职位列表」
- 检查 Edge 是否已登录 Boss直聘
- 检查网络是否能访问 `zhipin.com`
- 检查城市编码和关键词是否正确

### 想一次性搜多个岗位
目前每次只能填一个关键词。你可以在 boss-search.js 的 `searchUrl` 中用 `|` 分隔：`query=岗位A|岗位B`

## 🗺️ 功能规划

| 状态 | 功能 | 说明 |
|:----:|------|------|
| ✅ | 一键搜索 | 已实现 |
| ✅ | 发布时间过滤 | 已实现 |
| ✅ | 公司背调查询指南 | 已实现 |
| 🔜 | **多岗位同时搜索** | 一次搜多个关键词 |
| 🔜 | **薪资过滤** | 低于指定薪资自动标记 |
| 🔜 | **导出 CSV/Excel** | 方便表格对比 |
| 🔜 | **多页抓取** | 不限于第 1 页 |
| 🔜 | **Mac 支持** | macOS Edge 调试模式 |
| 🔜 | **简历匹配度** | 岗位要求 vs 你的简历 |

> 💡 有功能建议？欢迎提 [Issue](https://github.com/XZX317568/zhipin-job-hunter/issues)

## ⚠️ 注意

- 本工具仅做**信息筛选**，投递前请自行核实
- 你的 Cookie 仅用于本次会话，不会被保存或上传
- 如果装了 **BOSS海投助手** 扩展，它会在 2-3 秒内清空页面，本工具通过直接调 API 绕过

## 📄 License

MIT
