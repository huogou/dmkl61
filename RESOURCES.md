================================================================
dmkl61 桌宠 —— 素材补配说明（公司电脑 → 家里电脑）
（写给公司电脑上的 AI 看：按此清单打包素材，用户带回家后部署）
生成日期：2026-09-19
================================================================

【0. 背景】
家里电脑已从 git 仓库克隆源码并完成构建部署（见 DEPLOY.md），
目前只有六一（default 猫）在用仓库内置资源运行。
大米、可乐的正式素材 res_v2 和运行时配置不在 git 仓库里，
只存在于公司电脑，需要按本说明打包并带到家里电脑补配。

================================================================

【1. 公司电脑上需要打包的东西（共两处）】

  ① 素材目录 res_v2（约 70.5MB，三只猫的正式素材）
     路径：D:\SEO\发挥余热\桌宠\dmkl61-app\res_v2\
     内容：
       manifest.json         （六一的正式 manifest）
       dami\                 （大米素材 + dami\manifest.json）
       kele\                 （可乐素材 + kele\manifest.json）
       idle\ sleep\ wark\ fly\ follow\ fight\ （公共动作帧）
     打包方式：整个 res_v2 目录打包成 zip（或原目录直接拷贝），
     命名建议：res_v2_20260919.zip

  ② 运行时配置目录 .dmkl61（猫的资料/文案/资源路径）
     路径：C:\Users\Administrator\.dmkl61\
     需要打包的文件：
       cats\default.json       （六一配置）
       cats\cmtqqraj5.json     （大米配置，resourceRoot 指向 res_v2\dami）
       cats\kele001.json       （可乐配置，resourceRoot 指向 res_v2\kele）
       setting.json            （全局设置：大米资料、autoShowCats 等）
       avatars\                （三只猫头像，可选）
     注意：setting_backup_*.json 是备份，不用带。
     命名建议：dmkl61_config_20260919.zip

  ③ （可选）已部署好的完整运行目录
     如果图省事，也可以直接打包整个 D:\SEO\发挥余热\桌宠\dmkl61-app\
     （含 exe + res_v2 + dist），回家解压即用，跳过全部构建。
     本说明默认按「家里已构建、只补素材」走，所以主要用①②。

================================================================

【2. 用户怎么带到家里电脑】
  - U 盘 / 移动硬盘 / 网盘 / 微信文件传输，任选。
  - 总大小约 71MB（素材 70.5MB + 配置几 KB）。

================================================================

【3. 到家里电脑后的放置位置】
  ① res_v2 解压到：D:\桌宠\dmkl61-app\res_v2\
     （最终应存在 D:\桌宠\dmkl61-app\res_v2\manifest.json）
  ② 配置解压到：C:\Users\强哥\.dmkl61\
     （家里电脑用户名是「强哥」；若已自动生成过 default.json，直接覆盖）
================================================================

【4. 必须修改的配置（关键！resourceRoot 是绝对路径）】
  公司电脑路径 → 家里电脑路径 的对应关系：
    D:\SEO\发挥余热\桌宠\dmkl61-app\res_v2          → D:\桌宠\dmkl61-app\res_v2
    D:\SEO\发挥余热\桌宠\dmkl61-app\res_v2\dami    → D:\桌宠\dmkl61-app\res_v2\dami
    D:\SEO\发挥余热\桌宠\dmkl61-app\res_v2\kele    → D:\桌宠\dmkl61-app\res_v2\kele

  需要改的文件（用 JSON 转义，路径分隔符写双反斜杠）：
    C:\Users\强哥\.dmkl61\cats\default.json      → resourceRoot = "D:\\桌宠\\dmkl61-app\\res_v2"
    C:\Users\强哥\.dmkl61\cats\cmtqqraj5.json    → resourceRoot = "D:\\桌宠\\dmkl61-app\\res_v2\\dami"
    C:\Users\强哥\.dmkl61\cats\kele001.json      → resourceRoot = "D:\\桌宠\\dmkl61-app\\res_v2\\kele"

  autoShowCats（默认显示哪只/哪几只）：
    - 公司配置是 ["kele001"]（默认只显示可乐）
    - 家里电脑目前是 ["default"]（只有六一）
    - 想三只一起显示：改为 ["cmtqqraj5","default","kele001"]
    - 保持默认单猫：改回 ["kele001"]
    此值写在 C:\Users\强哥\.dmkl61\setting.json 的 autoShowCats 字段。

================================================================

【5. 补配后的验证清单】
  1) 杀掉旧进程：任务管理器结束 dmkl61.exe
  2) 清缓存（如有旧界面残留）：
     C:\Users\强哥\AppData\Local\com.huogou.dmkl61
  3) 重新启动 D:\桌宠\dmkl61-app\dmkl61.exe
  4) 确认：
     - 可乐（黑白奶牛猫）能显示、待机/呼吸正常、跟随可用
     - 大米（白猫粉耳）能显示、资料页显示「大米/妹妹/陪伴」标签
     - 三只猫说话不刷屏（约 1-2 分钟偶尔一句）
     - 动作切换有停留感（待机 45-90s、睡觉 90-180s）
  5) 若某只猫显示「缺资源引导」，检查对应 cats json 的 resourceRoot 路径是否真实存在。

================================================================

【6. 常见问题】
  - 家里电脑没装 res_v2 前只有六一 → 正常，素材到位即补全。
  - 素材包版本要和当前 commit 匹配（当前 main = 9b3b81c）。
    素材是冻结状态，直接拷最新版即可。
  - 无需重新编译 exe：素材和配置都是外置的，exe 启动时扫描。
================================================================
