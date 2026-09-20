================================================================
dmkl61 桌宠 —— 仓库内容与跨电脑部署说明
（写给任何新接手的 AI / 人：clone 仓库后如何在一台新电脑上跑起来）
更新日期：2026-09-20
================================================================

【0. 重要约定（从此生效）】
本仓库【不只包含源代码】，还包含运行 dmkl61 必需的全部素材和配置模板。
以后任何改动，如果涉及以下内容，必须一并提交到仓库：
  - res_v2/        （三只猫的正式动画素材）
  - runtime-config/（猫的资料/文案/行为配置模板）
  - resources/      （默认猫「六一」内置素材）
  - 任何新猫的帧素材、manifest.json、文案
禁止再出现「代码推上去了、素材没推」导致新电脑上跑不出猫的情况。
素材和配置是外置文件，exe 启动时扫描，不需要重新编译就能生效。

================================================================
【1. 仓库里有什么】
  res_v2/              三只猫正式素材（约 70.5MB，2843 个文件）
                        manifest.json、dami/（大米）、kele/（可乐）、
                        idle/ sleep/ wark/ fly/ follow/ fight/
  resources/           默认猫「六一」内置素材（debug 和 release 都用这个兜底）
  runtime-config/      运行时配置模板（~/.dmkl61 的备份）
                        setting.json、cats/{default,cmtqqraj5,kele001}.json、
                        avatars/*.png
  src/ src-tauri/      源代码（Vue3 + Tauri2 + Rust）

================================================================
【2. 新电脑部署步骤（clone 后从零跑起来）】
  前置：装好 git / Node / Rust / MSVC（见 DEPLOY.md）。
  1) git clone https://github.com/huogou/dmkl61.git
  2) cd dmkl61
  3) npm install（或 pnpm install）
  4) npx vite build
  5) cd src-tauri && cargo build --release --features custom-protocol
  6) 把编译产物 exe 拷到运行目录，例如 D:\桌宠\dmkl61-app\
  7) 把仓库里的 res_v2/ 复制到运行目录旁边：
        D:\桌宠\dmkl61-app\res_v2\
     （最终应存在 D:\桌宠\dmkl61-app\res_v2\manifest.json）
  8) 把 runtime-config/ 复制到用户主目录：
        C:\Users\<用户名>\.dmkl61\
     （覆盖 cats/、avatars/、setting.json）

================================================================
【3. 必须修改的配置（关键！resourceRoot 是绝对路径）】
runtime-config 里 cats/*.json 的 resourceRoot 写的是公司电脑绝对路径，
新电脑必须按实际路径改（路径分隔符用双反斜杠）：

  公司电脑（模板原值）：
    D:\SEO\发挥余热\桌宠\dmkl61-app\res_v2          → 默认六一
    D:\SEO\发挥余热\桌宠\dmkl61-app\res_v2\dami     → 大米
    D:\SEO\发挥余热\桌宠\dmkl61-app\res_v2\kele     → 可乐

  家里电脑（示例）：
    C:\Users\强哥\.dmkl61\cats\default.json
      → resourceRoot = "D:\\桌宠\\dmkl61-app\\res_v2"
    C:\Users\强哥\.dmkl61\cats\cmtqqraj5.json（大米）
      → resourceRoot = "D:\\桌宠\\dmkl61-app\\res_v2\\dami"
    C:\Users\强哥\.dmkl61\cats\kele001.json（可乐）
      → resourceRoot = "D:\\桌宠\\dmkl61-app\\res_v2\\kele"

  autoShowCats（写在 setting.json，决定开机显示哪几只猫）：
    - 三只一起显示：["cmtqqraj5","default","kele001"]
    - 只显示单猫： ["kele001"] / ["default"] 等

================================================================
【4. 验证清单】
  1) 结束旧 dmkl61 进程
  2) 删除 WebView2 缓存（如有界面残留）：
     C:\Users\<用户名>\AppData\Local\com.???（按实际 identifier）
  3) 启动 dmkl61.exe
  4) 确认：
     - 六一会显示、待机/呼吸正常
     - 大米（白猫粉耳）、可乐（黑白奶牛猫）能上桌
     - 三只猫说话不刷屏（约 1-2 分钟偶尔一句）
     - 动作切换有停留感（待机 45-90s、睡觉 90-180s）
  5) 某只猫显示「缺资源引导」→ 检查对应 cats json 的 resourceRoot 是否真实存在。

================================================================
【5. 常见问题】
  - 无需重新编译 exe 就能换素材/改文案：素材和配置都是外置的。
  - 素材是冻结状态，不要重拍视频、不要重新 RIFE。
  - 提交素材/配置改动时，确认 res_v2/ 和 runtime-config/ 都已 git add。

================================================================
【6. 当前进度（2026-09-20 更新）】
当前版本：v0.3.2（已打 tag，GitHub Actions CI 自动构建发布）

已完成功能：
  - 三猫（六一/大米/可乐）完整上桌，动作素材冻结
  - 开机自启（右键托盘菜单可开关）
  - 关于页改造：
      * 顶部三猫合影横幅（暖色渐变 + 三猫呼吸浮动动画）
      * 三猫日常照片墙（每只猫一横排，待机/睡觉/走路/跳跃/跟随）
      * 三猫小头像 + 彩色年龄 badge（六一橙7岁、大米粉4岁、可乐蓝4岁）
      * 缩略图 hover 放大、点击全屏预览（点空白关闭）
      * 底部寄语："这只桌面上的小世界，是用心做出来的礼物。"
  - 程序图标与猫头像解耦：
      * 关于页只管全局程序图标（~/.dmkl61/app-icon.png）
      * 每只猫头像在「基础设置」页独立设置，互不影响
      * 程序图标已设为三猫合影
  - 发版流程：node scripts/release.mjs patch（自动 bump 版本 + tag + push + CI 构建 Release）
  - 说话频率已降低、动作节奏已放缓（见 AI 接手日志）

已知限制：
  - 可乐无跳跃动作素材（素材冻结，接受现状）
  - 可乐行走是正面走来素材，非标准侧面走路（接受现状）
  - 检查更新需 CI 跑完 v0.3.2 Release 后才可用

================================================================
