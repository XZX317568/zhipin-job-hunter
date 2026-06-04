---
name: boss-zhipin-job-hunter
description: Boss直聘找工作助手 — 搜索指定岗位、筛选公司背景、过滤发布时间、生成招呼语
runAs: inline
allowedTools: [run_command, run_background, write_file, read_file, web_search, web_fetch, ask_choice]
---

# 🎯 Boss直聘 找工作助手 — Boss Zhipin Job Hunter

> 通过浏览器自动化，在 Boss直聘 上搜索、筛选岗位，找到靠谱公司再投递。**搜索关键词由你填写。**
>
> 📦 **依赖**: Node.js + Playwright + Microsoft Edge

## 📋 使用前准备

你需要先安装依赖（一次性的）：

```bash
npm install playwright
```

并确保你电脑上有 **Microsoft Edge** 浏览器。

---

## ⚙️ 第一步：填写你的信息

请把下面的变量填上你的真实信息：

```javascript
// ===== 请修改为你自己的信息 =====
const MY_CONFIG = {
  // --- 求职意向 ---
  jobKeyword: '你的岗位关键词',     // 如 仓管员、仓库管理员
  city: '深圳',                     // 城市
  cityCode: '101280600',           // 城市编码（深圳=101280600）
  areaDistrict: '期望区域',         // 如 宝安区（可选）
  
  // --- 你的简历信息（用于生成招呼语）---
  name: '你的名字',
  yearsExp: '工作年限',
  education: '学历',
  currentLocation: '你住在哪',
  
  // --- Edge 浏览器路径 ---
  edgePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  userDataDir: 'C:\\Users\\你的用户名\\AppData\\Local\\Microsoft\\Edge\\User Data',
};
// ==============================
```

> 💡 城市编码可以在 Boss直聘 网页上搜一下你的城市，URL 里的 `city=xxxxxx` 就是编码。

---

## 🔍 第二步：搜索岗位

本脚本会启动 Edge、导航到 Boss直聘、搜索岗位并列出结果。

<details>
<summary><b>搜索脚本 boss-search.js</b>（点击展开）</summary>

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  page.setDefaultTimeout(60000);

  // 等待职位列表 API 响应
  const resPromise = page.waitForResponse(r =>
    r.url().includes('/wapi/zpgeek/search/joblist.json') && r.status() === 200
  );

  const searchUrl = \`https://www.zhipin.com/web/geek/job?city=\${CONFIG.cityCode}&query=\${encodeURIComponent(CONFIG.jobKeyword)}\`;
  await page.goto(searchUrl, {
    waitUntil: 'load', timeout: 20000,
  });
  const res = await resPromise;
  const body = await res.text();
  const data = JSON.parse(body);
  const jobList = (data?.zpData || data)?.jobList || [];
  console.log(`找到 ${jobList.length} 个职位\n`);

  // 获取 cookies
  const cookies = await context.cookies('https://www.zhipin.com');
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  const headers = {
    'Cookie': cookieStr,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://www.zhipin.com/web/geek/job',
    'Accept': 'application/json, text/plain, */*',
  };

  // 获取每个职位的公司活跃时间
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < jobList.length; i++) {
    const job = jobList[i];
    const detailUrl = `https://www.zhipin.com/wapi/zpgeek/job/detail.json?securityId=${encodeURIComponent(job.securityId)}&lid=${encodeURIComponent(job.lid)}&_=${Date.now()}`;

    let activeTime = 0;
    try {
      const resp = await fetch(detailUrl, { headers });
      const data = await resp.json();
      activeTime = data?.zpData?.brandComInfo?.activeTime || 0;
    } catch (e) {}

    const activeDate = activeTime
      ? new Date(activeTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      : '未知';
    const mark = activeTime === 0 ? '❓' : (activeTime >= oneWeekAgo ? '✅' : '❌');
    const area = [job.areaDistrict, job.businessDistrict].filter(Boolean).join(' ');

    console.log(
      `${String(i + 1).padStart(2)}. ${mark} ${(job.jobName || '').padEnd(22)} ` +
      `${(job.salaryDesc || '').padEnd(8)} ${(job.brandName || '').padEnd(14)} ` +
      `${area.padEnd(14)} ${activeDate}`
    );
  }

  console.log('\n完成！标记含义: ✅=本周活跃 ❌=超1周未活跃 ❓=未知');
})();
```
</details>

---

## 🧹 第三步：筛选公司

拿到岗位列表后，用下面的方法逐一筛选：

### 3.1 企业背景（企查查 / 天眼查）

> 需要你**手动打开企查查(qcc.com)或天眼查**搜索公司全名

| 检查项 | 危险信号 | 跳过 |
|--------|---------|------|
| 成立时间 | **< 1年** | ✅ |
| 注册资金 | **< 100万** 或 未显示 | ✅ |
| 实缴资本 | **< 30万** 或 **0元** | ✅ |
| 参保人数 | **0人** 或 未显示 | ✅ |
| 股东变更 | **频繁变更**（近1年>2次） | ✅ |

### 3.2 招聘信息雷区

仔细看职位描述的全文，以下潜台词都是坑：

| 原文 | 翻译 |
|------|------|
| 「积极完成领导交办的事务」 | ⚠️ 打杂背锅侠 |
| 「薪资提成高，收入无上限」 | ⚠️ 底薪极低甚至无底薪 |
| 「公司员工年轻，气氛活跃」 | ⚠️ 用情怀代替待遇 |
| 「接受小白/无经验也可」 | ⚠️ 门槛过低，流动性大 |
| 薪资范围过大（如 `3K-20K`） | ⚠️ 实际拿最低档 |
| 岗位名称花里胡哨 | ⚠️ 非标准岗位，避坑 |

✅ **靠谱公司的特征**：薪资结构明确、岗位职责清晰、要求具体。

### 3.3 社交平台口碑

在以下平台搜索 `公司名 + 避雷/加班/欠薪/PUA`：

- 脉脉
- 知乎
- 小红书
- 百度贴吧

如果**全是负面评价** → 跳过。

---

## ⏰ 第四步：过滤发布时间

用上面脚本输出的 `brandComInfo.activeTime` 字段来判断：

- **本周活跃（✅）** → 招聘方最近上线过，岗位大概率仍在招
- **超一周未活跃（❌）** → 可能已招到人，建议跳过
- **未知（❓）** → 你需手动点开职位看「发布日期」

**一周前发布的不要。**

---

## 💬 第五步：生成打招呼话术

根据你看中的岗位，我用以下模板生成招呼语，**你确认后再发**：

```
您好，我看到贵司在招${jobName}，我对这个岗位很感兴趣。
我有${yearsExp}的仓库管理经验，熟悉ERP系统操作、库存盘点、出入库管理，
目前住在${currentLocation}，通勤方便。
方便的话希望能进一步沟通，谢谢！
```

> **你确认前我不会发送任何消息。**

---

## 🚀 快速开始（一键流程）

当你准备好所有信息后，按顺序执行：

```bash
# 1️⃣ 关闭所有 Edge 窗口
taskkill /F /IM msedge.exe

# 2️⃣ 以调试模式启动 Edge
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222

# 3️⃣ 运行搜索脚本（上面第二步）
node boss-search.js

# 4️⃣ 在输出的列表中，告诉我看哪些编号的职位

# 5️⃣ 我帮你查详情 + 生成招呼语，你确认后投递
```

---

## 📁 文件清单

| 文件 | 说明 |
|------|------|
| `SKILL.md` | 本说明文档 |
| `boss-search.js` | 搜索 + 活跃时间过滤脚本 |
| `package.json` | Node依赖（至少需要 `playwright`） |

---

## ⚠️ 注意事项

1. **登录态**：确保你的 Edge 已经登录了 Boss直聘
2. **BOSS海投助手**：如果你装了此扩展，它会在 2-3 秒内清空页面。本 Skill 通过直接调 API 绕过
3. **隐私**：你的简历信息和浏览器 Cookie 仅用于本次会话，不会被保存或上传
4. **投递前请自行核实**：本工具仅做信息筛选，最终判断请结合实际情况
