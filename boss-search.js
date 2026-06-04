/**
 * Boss直聘 职位搜索脚本
 * 
 * 用法：
 * 1. 关闭所有 Edge: taskkill /F /IM msedge.exe
 * 2. 启动 Edge 调试: msedge.exe --remote-debugging-port=9222
 * 3. 运行本脚本: node boss-search.js
 * 
 * 需要先安装 playwright: npm install playwright
 */

const { chromium } = require('playwright');

// ===== 请修改为你的信息 =====
// ===== 👇 改成你的信息 =====
const CONFIG = {
  jobKeyword: '你的岗位关键词',  // 如: 仓管员、仓库管理员、仓库主管
  cityCode: '101280600',        // 城市编码（深圳=101280600）
};
// ============================

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  page.setDefaultTimeout(60000);

  console.log(`搜索 "${CONFIG.jobKeyword}" ...`);

  // 等待 API 响应
  const resPromise = page.waitForResponse(r =>
    r.url().includes('/wapi/zpgeek/search/joblist.json') && r.status() === 200
  );

  const searchUrl = `https://www.zhipin.com/web/geek/job?city=${CONFIG.cityCode}&query=${encodeURIComponent(CONFIG.jobKeyword)}`;

  await page.goto(searchUrl, { waitUntil: 'load', timeout: 20000 }).catch(() => {});
  const res = await resPromise;
  const body = await res.text();
  const data = JSON.parse(body);
  const jobList = (data?.zpData || data)?.jobList || [];
  console.log(`找到 ${jobList.length} 个职位\n`);

  // 获取 cookies
  const cookies = await context.cookies('https://www.zhipin.com');
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  const headers = {
    Cookie: cookieStr,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    Referer: 'https://www.zhipin.com/web/geek/job',
    Accept: 'application/json, text/plain, */*',
  };

  // 获取每个职位的公司活跃时间
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < jobList.length; i++) {
    const job = jobList[i];
    const detailUrl =
      `https://www.zhipin.com/wapi/zpgeek/job/detail.json?securityId=${encodeURIComponent(job.securityId)}&lid=${encodeURIComponent(job.lid)}&_=${Date.now()}`;

    let activeTime = 0;
    try {
      const resp = await fetch(detailUrl, { headers });
      const d = await resp.json();
      activeTime = d?.zpData?.brandComInfo?.activeTime || 0;
    } catch (e) {}

    const activeDate = activeTime
      ? new Date(activeTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      : '未知';
    const mark = activeTime === 0 ? '❓' : activeTime >= oneWeekAgo ? '✅' : '❌';
    const area = [job.areaDistrict, job.businessDistrict].filter(Boolean).join(' ');

    console.log(
      `${String(i + 1).padStart(2)}. ${mark} ${(job.jobName || '').padEnd(22)}` +
      ` ${(job.salaryDesc || '').padEnd(8)} ${(job.brandName || '').padEnd(14)}` +
      ` ${area.padEnd(14)} ${activeDate}`
    );
  }

  console.log('\n标记: ✅=本周活跃  ❌=超1周未活跃  ❓=未知');
  console.log('完成！浏览器保持打开。告诉我想看哪些职位编号~');
})();
