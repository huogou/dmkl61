// 原作者线上教程「桌宠素材制作教程 / 视频生成教程」(key: video-generation)
// 由线上服务 wuguanwen.cn:10000/api/contents?page=resource 实时拉取后本地化保存。
// 仅本地化保存，未改动作者原意。代码围栏用 ~~~ 以避免与 TS 模板字符串的反引号冲突。
export const VIDEO_GEN_TUTORIAL = `# 桌宠素材制作教程

用你家小猫的照片，做一套专属桌宠素材。无需绘画或动画基础，借助 AI 工具和多多内置的视频转帧工具即可完成。

## 整体流程

1. **拍照片** — 拍几张猫咪的清晰照片
2. **AI 生成坐姿图** — 让 AI 画出端坐的猫咪（桌宠基础姿态）
3. **AI 生成动作视频** — 用坐姿图生成待机、睡觉、转头视频
4. **视频转帧** — 用多多内置工具把视频转成透明帧序列
5. **配置加载** — 放进 resources 文件夹，在多多里加载

---

## 第一步：拍摄猫咪照片

拿手机拍 2-3 张猫咪的清晰照片，作为 AI 的参考图。

**拍摄建议：**

- 光线充足，白天自然光最佳
- 正面或侧面，能看清花纹和颜色
- 背景简洁，纯色背景更好（方便 AI 识别主体）
- 多拍几张不同角度，挑最清晰的一张

> 猫咪自然状态的照片 AI 还原度更高，不用刻意摆拍。

<div style="display:flex; gap:12px;align-items:flex-start">
  <img src="https://wuguanwen.cn:10000/static/example/01-photo-example.jpg" alt="图片参考" style="width:50%" />
  <img src="https://wuguanwen.cn:10000/static/example/02-photo-example1.jpg" alt="图片参考" style="width:50%" />
</div>

---

## 第二步：AI 生成坐姿图片

用 AI 绘图工具，根据照片生成一张猫咪**端坐**的图片。这是桌宠的基础姿态，后续所有动作都基于它。

**推荐工具：** [豆包](https://www.doubao.com/chat/)、[即梦 AI](https://jimeng.jianying.com/ai-tool/home)、[可灵 AI](https://kling-ai.com/app)、[ChartGPT](https://chatgpt.com/)。

**提示词参考：**

~~~text
根据参考图片，生成该小猫的端坐的图片，坐姿参考【下面有图参考】。
要求：图片比例1:1、小猫占图片的60%并且居中、纯绿色背景无阴影
~~~

**关键要求：**

- **纯色背景**（绿色或蓝色最佳），后续转帧才能干净抠图
- **猫咪居中**，占比60%，不要占太满不然后续生成视频时很容易超出边界
- **端坐姿态**，可以把下面的图片一起上传到AI参考

<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:flex-start">
  <figure style="flex:1; min-width:180px; margin:0; text-align:center;">
    <img src="https://wuguanwen.cn:10000/static/example/03-photo-example.png" alt="坐姿参考" style="width:100%;border: 1px solid #000;border-radius: 8px;" />
    <figcaption>坐姿参考</figcaption>
  </figure>
  <figure style="flex:1; min-width:180px; margin:0; text-align:center">
    <img src="https://wuguanwen.cn:10000/static/example/04-photo-example.png" alt="成品参考" style="width:100%;border-radius: 8px;" />
    <figcaption>成品参考</figcaption>
  </figure>
</div>

---

## 第三步：AI 生成动作视频

用第二步的**坐姿图**作为首帧/参考图，借助 AI 的"图生视频"能力，分别生成三段动作视频：转头、待机、睡觉。每个动作单独生成一段，后面再逐段转帧, **要是生成的不符合，可以保存下面的示例视频，然后与你的小猫一起丢给AI，让AI替换掉就好**。

**推荐工具：** [豆包](https://www.doubao.com/chat/)、[即梦 AI](https://jimeng.jianying.com/ai-tool/home)、[可灵 AI](https://kling-ai.com/app)、[海螺 AI](https://hailuoai.com/)。选带"图生视频 / 首帧生成"功能的即可。

**通用要求（三段都适用）：**

- **上传坐姿图当首帧**，保持猫咪形象、花纹、颜色一致
- **背景保持纯绿色（或纯蓝）不变**，全程不要出现新背景、光影或阴影
- **镜头固定**，不要推拉、旋转、跟随；主体不要位移出画
- **动作幅度小、节奏慢**，桌宠缩小展示后才自然
- **时长 3-5 秒**即可，转帧后会循环播放
- **视频结尾姿态接近开头**，转帧循环时首尾衔接更顺

> 多数图生视频工具支持"首帧图 + 文字描述"。首帧统一用坐姿图，只靠提示词改动作，形象最稳。提示词可以让AI生成和优化

**示例视频** 示例的比例不正确，应该占画面的60%，与图片一致
<div style="display:flex; gap:12px; align-items:flex-start">
  <figure style="flex:1; min-width:180px; margin:0; text-align:center">
    <img src="https://wuguanwen.cn:10000/static/example/05-video-example.webp" alt="转头示例" style="width:100%" />
    <figcaption>转头示例</figcaption>
  </figure>
  <figure style="flex:1; min-width:180px; margin:0; text-align:center">
    <img src="https://wuguanwen.cn:10000/static/example/06-video-example.webp" alt="待机示例" style="width:100%" />
    <figcaption>待机示例</figcaption>
  </figure>
  <figure style="flex:1; min-width:180px; margin:0; text-align:center">
    <img src="https://wuguanwen.cn:10000/static/example/07-video-example.webp" alt="睡觉示例" style="width:100%" />
    <figcaption>睡觉示例</figcaption>
  </figure>
</div>

---

## 第四步：视频转帧

可以使用内置的工具进行转换
转换教程请看：设置 -> 视频转图片 -> 使用说明

---

## 第五步：配置并加载

配置教程请看：设置 -> 资源设置 -> 使用说明

---

## 小贴士

### 内存占用过大怎么办？
1. 把小猫的大小调小一点
2. 视频抽帧，降低一些帧数

### 有什么不明白的可以在关于页面留言
`
