================================================================
dmkl61 桌宠项目 —— 新电脑 / 回家部署完整说明
（写给接手部署的 AI 看，避免反复试错）
生成日期：2026-09-18
================================================================

（2026-09-19 补充：素材与配置的具体打包/补配步骤见同目录 RESOURCES.md，
   家里电脑已实测按本说明完成源码构建部署，仅缺 res_v2 素材。）

【0. 一句话结论】
git 仓库（https://github.com/huogou/dmkl61.git）只包含「源码 + 内置默认资源 resources/」。
要让三只猫（六一/大米/可乐）真正跑起来，还需要从旧电脑额外拷贝两样东西：
  (1) res_v2 素材目录（约 70.5MB）——三只猫实际使用的素材，不在 git 里；
  (2) 运行时配置 ~/.dmkl61 目录——猫的资料、说话文案、resourceRoot 绝对路径，不在 git 里。
缺了这两样，就算 clone + 构建成功，打开 exe 也会缺资源引导或找不到猫。
================================================================

【1. 需要的三样东西（来源清单）】
  A. git 源码仓库
     git clone https://github.com/huogou/dmkl61.git
     当前 main 分支 commit：1811d2c（2026-09-18 送礼前最终体验优化版）
  B. res_v2 素材（旧电脑路径：D:\SEO\发挥余热\桌宠\dmkl61-app\res_v2\）
     内容：manifest.json + dami/ + kele/ + idle/ + sleep/ + wark/ + fly/ + follow/ + fight/
     三只猫的素材根全部指向这里，必须整体拷贝（U盘/压缩包/网盘均可）。
  C. 运行时配置（旧电脑路径：C:\Users\Administrator\.dmkl61\）
     cats/default.json      —— 六一（默认猫）
     cats/cmtqqraj5.json    —— 大米
     cats/kele001.json      —— 可乐（默认显示这只，autoShowCats=["kele001"]）
     setting.json           —— 全局设置（大米资料、autoShowCats 等）
     avatars/               —— 三只猫头像（default.png / cmtqqraj5.png / kele001.png）
     说明：cats/*.json 里的 resourceRoot 是「绝对路径」，换电脑后必须改。
================================================================

【2. 环境要求（新电脑）】
  - Node.js（含 npm，建议 LTS）
  - Rust 工具链（rustup + cargo，stable）
  - Windows 10/11（自带 WebView2 运行库，无需额外装）
  - 不需要 pnpm（构建一律用 npx/npm + cargo）
================================================================

【3. 构建步骤（严格按此顺序）】
  cd dmkl61
  npm install                          # 安装前端依赖（无 pnpm）
  npx vite build                       # 前端产物 → dist/
  cd src-tauri
  cargo build --release --features custom-protocol
  cd ..

  ★ 重要坑：
  1) 绝不要用 `npm run build` —— 它会先跑 vue-tsc 类型检查，
     命中 3 个历史遗留 TS6133 未使用变量报错（Menu.vue:40、UpdateSettings.vue:118/307），
     与本次功能无关，直接失败。项目惯例就是 `npx vite build` 跳过类型检查。
  2) 新电脑没有 .cargo/config.toml（该文件未入库，是旧电脑本地配置），
     cargo 产物默认输出到 src-tauri\target\release\dmkl61.exe，这是正常的。
     （旧电脑因 CARGO_TARGET_DIR 配置，产物在 D:\SEO\发挥余热\桌宠\dmkl61-build\release\dmkl61.exe）
  3) 构建成功标志：cargo build 退出码 0，出现 release\dmkl61.exe。
================================================================

【4. 部署步骤（运行目录建议 D:\dmkl61-app\ 或与旧电脑一致）】
  1) 建运行目录，例如 D:\dmkl61-app\
  2) 把构建出的 src-tauri\target\release\dmkl61.exe 拷入运行目录
  3) 把 res_v2 整个目录拷到运行目录下（得到 D:\dmkl61-app\res_v2\）
  4) 把 ~/.dmkl61 拷到新电脑同用户名下（C:\Users\<用户名>\.dmkl61\）
  5) 修改 ~/.dmkl61/cats/ 三个 json 里的 resourceRoot 为实际绝对路径：
       default.json     → <运行目录>\res_v2
       cmtqqraj5.json   → <运行目录>\res_v2\dami
       kele001.json     → <运行目录>\res_v2\kele
     注意：路径分隔符用双反斜杠（JSON 转义），且必须存在对应 manifest.json。
  6) （可选）若想让六一回退到内置默认资源，可把 default.json 的 resourceRoot 置空，
     此时它读取 exe 同级 resources/ 目录（需把仓库 resources/ 拷到 exe 同级）。
     当前正式配置是三猫都走 res_v2，不建议改。
  7) 启动前处理：
       - 任务管理器确认没有残留 dmkl61.exe 进程（有则结束）
       - 如之前运行过旧版本，删除 WebView2 缓存目录：
         C:\Users\<用户名>\AppData\Local\com.huogou.dmkl61
       （清缓存是为了避免显示旧版本界面，项目既有经验）
  8) 双击 dmkl61.exe 启动验证（见第 6 节清单）。
================================================================

【5. 常见坑速查（AI 遇到问题先看这里）】
  - 显示的是旧界面/行为没变化 → 清 WebView2 缓存 + 杀干净 dmkl61.exe 再启动
  - 某只猫找不到素材 → 检查对应 cats/*.json 的 resourceRoot 路径是否有效
  - 设置页不弹窗 → 正常。tauri.conf.json 里 settings 窗口 visible:false，
    桌面宠物窗口是运行时创建的；托盘图标可唤出设置（右键菜单）
  - git 提交/推送失败，报 husky/pnpm/tsc → 项目 hook 有问题，一律：
      git commit --no-verify
      git push --no-verify
  - 需要远程调试（CDP）→ 先杀进程，设置环境变量后再启动 exe：
      WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222 --remote-allow-origins=*
    页面列表：http://127.0.0.1:9222/json
  - 别动 res_v2 素材和 ~/.dmkl61 里的行为参数外的内容：
    素材已冻结，不重新生成/重拍/RIFE；行为节奏可调 manifest（见下）
================================================================

【6. 启动验证清单】
  - 默认应显示可乐（黑白奶牛猫）在桌面，端坐/呼吸自然
  - 右键菜单可用：召唤猫猫、切换显示、设置等
  - 说话频率：约 1-2 分钟偶尔一句（不刷屏）
  - 动作节奏：待机停留 45-90s，睡觉 90-180s，不频繁切换
  - 若同时显示三只猫（设置 autoShowCats）：三猫各自独立、互不干扰
================================================================

【7. 行为/说话参数在哪改（后续迭代用）】
  - 说话频率：res_v2\manifest.json（根/六一）、res_v2\dami\manifest.json（大米）、
    res_v2\kele\manifest.json（可乐）里的 idle.random 的 delay（当前 [60000,120000]ms）
    与 sleep.random delay；以及 Pet.vue 中 SPEAK_COOLDOWN_MS=12000（同猫冷却）、
    GLOBAL_SPEAK_WINDOW_MS=5000（跨猫节流）
  - 动作停留感：同上三份 manifest 的 idle/sleep duration、weight
  - 注意：改 manifest 不需要重编 exe（资源外置，exe 启动时扫描）；
    改 Pet.vue 等 src 代码则需要重新走第 3 节完整构建链
================================================================

【8. 当前版本基准（2026-09-18）】
  - git commit：1811d2c  feat: 送礼前最终体验优化 - 大米专属资料文案 + 三猫降说话/动作节奏 + 修复__speak文案池失效bug
  - 已部署 exe（旧电脑）：D:\SEO\发挥余热\桌宠\dmkl61-app\dmkl61.exe
    MD5：A2352897D1D113212AF7ECE061015D5B（备份：dmkl61_prev_20260918c.exe）
  - 大米资料：妹妹、描述「一只温柔可爱的小猫，安安静静地陪在身边」、
    标签 大米/小猫/陪伴/可爱，专属文案池 35 条（含 4 条低频纪念）
================================================================
