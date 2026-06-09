---
layout: post
title: "抖音早安电台工作流搭建"
date: 2026-06-06 12:00:00 +0800
categories: [项目,抖音]
tags: [自动化流程,起号]
---

本文详细描述了本人搭建视频生成工作流时遇到的的困难以及搭建方法
搭建平台--cozi

## 搭建步骤

### 开始节点输入项：时间，主题，api key

开始节点用于接收输入的数据(可以与编程语言的输入输出类比，相当于封装一个对象)

### 生成文案时间

用两个ai模型分别生成时间和文案

文案生成提示词

```md
你是治愈情感文案专家，请根据用户提供的主题，创作相关的情感文案

## 技能
1.仔细分析用户输入的主题含义，确保全面理解主题核心要点。采用更宏观的创作视角
2.基于对主题的理解，创作出有氛围感且富有深度的情感文案。
3.使用电影旁白的深情风格，文案需能够引起用户的情感共鸣，精炼简短。

## 输出格式
1.最后直接输出创作好的文案，无需额外说明。

## 限制:
1.只围绕主题相关内容进行创作
2.输出的文案内容必须符合要求的风格和字数限制，不能偏离框架要求。
3.最后直接输出文案，文案字数 100 字左右。
```

时间生成提示词

```md
# 角色
从黄历信息中筛选需要的信息
## 技能
### 技能 1.根据用户提供的黄历信息获取日期信息
1.当用户请你查询指定日期的黄历信息时，仔细确认用户所提供的日期。并调用 to_cn_calendar 和 Chinese_almanac 完成查询农历日期
2.根据用户提供日期，动用技能查询 ⦿Chinese_almanac 获取黄历信息获取日期信息，严格按下放格式组装数据
模板:
"今天是 [月份] 月 [日期] 日 [星期]，农历 [月份] 月 [日期]，早安"< 注意里面的日期和月份格式不用加 0，比如 07 要处理成 7>
"月份 / 日期"<阳历，需处理日期格式，如 7/1 需处理成 07/01>
"农历 [月份] 月 [日期]"
"星期 [具体的星期]"

**必须以 JSON 格式输出**
json
{
  "date_info":{
    "text":"今天是6月29日星期日，农历六月初五，早安",
    "date":"6/29",
    "nongli":"农历6月初五",
    "week_day":"星期日"
  }
}

## 限制:
1.只讨论与黄历相关的内容，拒绝回答与黄历无关的话题。
2.所输出的内容必须按照给定的格式进行组织，不能偏离框架要求。
3.准确解读黄历信息，确保信息的可靠性。
```

用户提示词

```md
日期: {{input}}
黄历信息: {{date}}
字段说明:
-wxcy：今日五行对应颜色的吉凶寓意。
-rulueli：日历的鲁勒力数值。
-dizhi：今日与十二生肖的相合、相冲等关系。
-jieqi24：24 节气的具体日期。
-pzbj：民间特定日子的禁忌或注意事项。
-ganzhi：今日的干支纪年、纪月、纪日信息。
-gongli：公历日期，包括年份、月份、日期和星期几。
-chongsha：今日的冲煞信息。
-shengxiao：今日出生的人属相。
-yi：今日宜做的事。
-jsyq：今日的吉神宜趋和凶神宜忌。
-nongli：农历日期。
-zhishen：当日的值神。
-xsyj：今日的凶煞。
-nayin：今日的纳音信息。
-zhiri：今日的值日信息。
-jieri：今日的节日信息。
-xingzuo：今日出生的人的星座。
-tszf：今日的胎神占方信息。
-ji：今日忌做的事
```

### 组合文案并分段处理

通过字符串拼接来处理

### 根据文案生成视频内容

大模型输入关键字来输出文案

去空值（对文案进行处理）

```python
async def main(args: Args) -> Output:
    params = args.params
    texts = params['texts']

    # 移除数组中可能存在的空字符串元素
    texts = [t for t in texts if t]
    # 构建输出对象
    ret: Output = {
        "texts": "\n".join(texts)
    }
    return ret
```

### 对齐音频字幕

用米粒ai的插件进行对齐

### 视频选段整理

在已经准备好了的视频选段中随机挑选视频
并拼接为整个视频

```javascript
  async function main({ params }) {
      const clip_duration = 3;
      // 修正：上游传过来的参数名叫 input，不是 duration
      const duration = params.input ?? params.duration ?? 0;
      const total_duration_seconds = Math.max(0, Math.ceil(Number(duration) / 1000000));
      const num = Math.ceil(total_duration_seconds / clip_duration);
      const urls = getRandomVideos(num);

      return {
          "num": num,
          "total_seconds": total_duration_seconds,
          "video_urls": urls
      };
  }

  function getRandomVideos(num) {
      const video_urls = [
        //准备好的视频的url
      ];

      if (num <= video_urls.length) {
          return shuffleAndTake(video_urls, num);
      }
      return randomPick(video_urls, num);
  }

  function shuffleAndTake(arr, count) {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy.slice(0, count);
  }

  function randomPick(arr, count) {
      const result = [];
      for (let i = 0; i < count; i++) {
          result.push(arr[Math.floor(Math.random() * arr.length)]);
      }
      return result;
  }
```

### 数据重组

对前面的各个参数进行整合

其中要注意参数的传递

```javascript
async function main({ params }: { params: Record<string, any> }): Promise<Record<string, any>> {
    // 提取参数并增加空值兜底，避免参数缺失报错
    const bgm = params.bgm ?? '';
    const texts = params.texts ?? [];
    const video_urls = params.video_urls ?? [];
    const audioUrl = params.data ?? ''; // 修复1: 输入参数名为 data（来自 根据文案生成音频内容）
    const durationInput = Number(params.duration) || 0;
    const title = params.title ?? '';

    let common_timelines = [];
    let video_start = 0;
    let video_end = 0;
    let videos = [];

    // 遍历视频URL生成每个片段的时间线（3秒/段）
    video_urls.forEach((item) => {
        video_end = video_start + 3 * 1000000;
        videos.push({
            "video_url": item,
            "duration": 3 * 1000000,
            "start": video_start,
            "end": video_end,
            "width": 576,
            "height": 1024,
            "transition": "叠化",
            "transition_duration": 1000000
        });
        if (video_end > video_start) {
            video_start = video_end;
        }
    });

    // 背景音乐
    const audioBgm = [{
        "audio_url": bgm,
        "start": 2000000,
        "end": video_end || 3 * 1000000,
        "volume": 0.2
    }];

    // 公共时间线
    common_timelines.push({
        "start": 2000000,
        "end": video_end || 3 * 1000000
    });

    // 配音、字幕构建
    let captions = [];
    let audios = [];

    // 自动判断 duration 单位并转换为微秒
    const durationUs = durationInput < 1000000 && durationInput > 0
        ? durationInput * 1000000
        : durationInput;

    // 配音音频
    audios.push({
        "audio_url": audioUrl,
        "duration": durationUs,
        "start": 0,
        "end": durationUs
    });

    // 修复2: 用文本+时长计算近似时间线（原来依赖缺失的 timelines 输入）
    if (texts.length > 0 && durationUs > 0) {
        const segDuration = Math.floor(durationUs / texts.length);
        texts.forEach((text, idx) => {
            captions.push({
                'text': text,
                'start': idx * segDuration,
                'end': (idx + 1) * segDuration,
                "in_animation": "渐显",
                "out_animation": "渐隐"
            });
        });
    }

    // 标题字幕（0-2秒）
    const captionsTitle = [{
        'text': title,
        'start': 0,
        'end': 2000000,
        "in_animation": "",
        "out_animation": "渐隐"
    }];

    const ret = {
        "captions": JSON.stringify(captions),
        "audios": JSON.stringify(audios),
        "videos": JSON.stringify(videos),
        "audioBgm": JSON.stringify(audioBgm),
        "captionsTitle": JSON.stringify(captionsTitle),
        "common_timelines": common_timelines
    };

    return ret;
}
```

### 创建视频草稿

通过米核的剪映小助手对输入的数据进行处理
输出剪映视频草稿
