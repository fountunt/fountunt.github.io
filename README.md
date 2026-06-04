# Fountunt's Blog 🚀

> 记录思考，分享技术

基于 [Jekyll](https://jekyllrb.com) 构建，托管于 [GitHub Pages](https://pages.github.com)。

## 本地开发

```bash
# 安装 Ruby 和 Bundler
gem install bundler

# 安装依赖
bundle install

# 启动本地服务器
bundle exec jekyll serve

# 打开浏览器访问 http://localhost:4000
```

## 写新文章

在 `_posts` 目录下创建 `YYYY-MM-DD-title.md` 文件，格式如下：

```yaml
---
layout: post
title: "文章标题"
date: 2026-06-04 21:30:00 +0800
categories: [分类1, 分类2]
tags: [标签1, 标签2]
---

文章内容...
```

## 部署

推送到 `main` 分支后，GitHub Actions 会自动构建部署。

## 许可证

MIT
