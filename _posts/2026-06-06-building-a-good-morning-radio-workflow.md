---
layout: post
titil: "抖音早安电台工作流搭建"
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

文案生成提示词
```
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
```
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
```
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
### 根据文案生成视频内容

去空值
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

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/46c2177de7307de206fe4ac7ffc43fa72510af28.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/8fd9fcf4947b37b8b4d42dab6a061756d5bc56b1.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/a2e38c05895ccb9d8e8116b77af8277691097663.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/6a5e35c8b095bee0a57a9911d5f8b2d5ec8b686d.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/bd993229ac40d88b607f9e1a4b4e83857915a06f.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/93bbbd5dd0d0f2cd61d22c0877966d38b1df7a2b.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/86a4e6507f036a8dc7c56581888f68d087abdc4a.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/5c84153c21b81c42eb5a1879a3bcce5045398e2b.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/b102f211c5a9b7617a567d6b7d57c9bb3a5dc1ed.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/8da435f114353b1b2e53d9554d05eadd88f88480.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/32fb3cdbaae92d3652a6d4061d27ef4c49d81c59.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/ee085c6785fa4fc01bcb9317bf8cda63ecbf26e2.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/4795c5903cb746c1e950ec9e3c6b590c5a57d8d5.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/b7cbd06a5011199b2d074685a5901c5b417eac71.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/0cbc467c456ca33b3af48526add4535219e1cf9b.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/c51b33546bdf8e09390b5085c12c6cc64050f2b7.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/0d782370cbb0c5e879d6106d71db55d4abb51b70.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/76a4a8bb37c7eb761582e612070eaf6ddf21811e.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/b542654b9c151fa515c0fca36304d3b35b9127c3.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/3d970d2d1df6a302c26df44f27525fd7e4c038c9.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/50a82576bb72a92d88424b4b7ed5f3ddb1a6b567.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/e0b93bf86ed284f06ba2b1ac799f443b0249db7f.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/f0e3a4cd3de0f8e341c503d4212df6274f377b8b.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/ae9fcc18e8bba64a73820a3e8c5ec32cb0e5d9a8.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/be0921849286abfa4ac0865ab1b458d7944e0b80.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/538e40294e80875f08f3a7e63cbc778879c3b5b3.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/68fec4931b736c6bf8ef5c398709ddc0f8a75f7b.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/e359064f0a190a51c9a0ea9c1aed04c65d8c7d9b.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/13015710724d659e02d799063d0fa07e969c2840.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/e64e7adb8fe61f0323c77634d1de382f9a56646f.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/d6f32ceadd0d9dce14a4b7517883b553d60c50ea.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/ad729279c2c940661e3fa22c791d92c27f88f22e.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/3c08999e5c845c78ab4fa3f707eab94291ea917f.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/02b240cad1fd70265b99e056c8bde796a648ded3.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/fc27c16e2c34b087697af38b450ce2fe5f5414ce.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/ab3570a472bc0e775ecee080378a6d046dd6c6b2.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/50de43aff9d3bcc72501c33d9e780ebdd3077226.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/11066628fad7a4d31257e8c27fc8472b371eeb6f.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/3281c4709d4d919a588b5e7ddeee979b3090190e.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/c1f4d90377380a8202d5513fda54a05a0dd23247.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/0b465d86930b70849d02aa1adc2d39a2ddc2a7d4.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/20727f5e6e050f9d7eb9f8ab84d229fbf49b6f7b.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/3ad2d6e4b64aee8f632015c202081f3651e8f8ed.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/e82e83679b396ba755cc1b6bb6fdc7694cccc1fe.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/3258970575635029928c658d710af5b91ec583a0.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/a4154472795fbdd1b36aea12eb7e9b9ed53671aa.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/20df3926b94d5634f889e7a0cde04de9736a29fb.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/c6cc9509ac2a34244e3db4e03b5ffb2938ff5ef9.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/7b6f3bab8390e854fe9a73e76e740aec50e3f8af.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/bac41456960e3cdf5b12fd79c7d8d36bc55fab2b.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/e9a564504d51e5c579e2774d95b5426feac20e59.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/110d8db7fd7a8f158fe1093b5abc984a7e025215.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/51c6d397154e6577655dab7de1878c483d076c6e.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/dbffc3066ce065f4f2a9faf212dbb36586543266.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/a08390e47f54a01743f41b2405d88f3ec7410cf3.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/8a079875fa01f34b1f0a9adaac7f378e9b11a507.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/089ecf0c7d187635446b6c6e8c8ec0c1241d232c.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/42ba677a58c40811e48add81c8e30de631526805.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/3202a1cc1a37ce176f179a492f57009a7bfd935c.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/a37aac43a0868e1f6c16ba7210122734e7d0f889.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/54be3209d0365cc9aceefe54a23a50c7dfebfb14.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/357f35b60eae1a8c2ed1f285812a9922ea734df0.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/824a900c5749d490b66246bb6e3ddedcdd99dd1a.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/67bdfa9440485d7211c1d4a37b3a683d67bd7c15.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/0a88daa56d5345ab3afc1bf975cd21d195340c25.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/ce7a28c621b3856e0d7cf87b1533b63b1bd93f2a.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/6a27c847ba0719d2203a49269bbabb76fb4445bf.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/aab0048729b989548daae19a55a22fbf53bd3167.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/e50535b93c98bf4ceafcf5e1b95c3d73406c9a85.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/db0baef3bdfbaa4716bd8ece8df10b03c2144bae.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/0cb4cf08f3b2673bf6331a967c04ba743ab958ff.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/c6c4b91d01b92190dc7bfd5752defe7551938963.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/5afc4042b873f37f61d2ece69207fcd6179e22b6.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/249d1414f327298ea6308f68d8035407808cada3.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/bc11dad4c1ced4221f09393e3a5386eb12614711.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/9bad95780f671ddb1b795b914947dc67d32d5a0a.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/c7b2f49dd00ee57bd515321e3e4d630f088a0eda.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/61877f9dc37f1eb02a73b1459267b917dce6017b.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/28cbe8e5cf1cc69051c6d9a8653349892a65185b.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/f0ac800aa1b9d08efbf01eba8612441afc3096ac.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/cb7f705dc9f9456f4e21219c5e5f7bf69caa65c1.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/170a02a4645d105bb2e1ca135751f9ed387f28fd.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/d3a3e9269097486fe697d3b36723cd1cd91e35c7.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/40f0dfebc241312d831ec5f376f7b060f8746bdd.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/36a7eea1cb2dd747cbfd4225070e43993db11ad6.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/0be0f659ad28334bc1c4cdb7ce481a0efd5d2f7f.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/e60af35db2cc5f529b5da9468d4fb00516c11475.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/4ea3137e1f271ac98bf7923ec12e0ab850025b9e.mp4",

  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/09b35cb9abde7d8794e2e993c77972b0192cae0e.mp4",
  "https://befun-static.oss-cn-shenzhen.aliyuncs.com/clip/material/44ce2b0bcc7fec1fb74bd702e21b61a74e7210cc.mp4"
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
、
### 创建视频草稿
通过米核的剪映小助手对输入的数据进行处理
输出剪映视频草稿