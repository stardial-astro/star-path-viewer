# Star Path Viewer

[English](README.md) | [简体中文](README.zh.md) | [繁体中文](README.zh-HK.md)

天体轨迹追踪天文小工具——显示上下五千年间制定日期和地点的天体视运动轨迹。

[![版本](https://img.shields.io/badge/Version-v1.3.1-blue)](#功能特性)
[![node](https://img.shields.io/badge/Node.js-24.14.0-5FA04E?logo=Node.js&logoColor=white)](https://www.npmjs.com)
[![react](https://img.shields.io/badge/React-19-1DAFB?logo=react&logoColor=white)](https://react.dev)
[![mui](https://img.shields.io/badge/MUI-7-007FFF?logo=mui&logoColor=white)](https://mui.com)

[<img alt="thumbnail" src="https://stardial-astro.github.io/star-path-data/images/star-path-viewer_thumbnail.png" width="320">](https://star-path-viewer.pages.dev/)

## 简介<!-- omit in toc -->

[Star Path Viewer](https://star-path-viewer.pages.dev/) 是一个由 [Stardial](https://github.com/stardial-astro) 团队开发的基于 [React](https://react.dev) 的网页应用。

[→ 计算功能源代码](https://github.com/claude-hao/star-path-calculator)

[→ 后端服务器仓库](https://github.com/lydiazly/star-path-calculator-flask)

[→ 星名列表](https://github.com/stardial-astro/star-path-data)

## 目录<!-- omit in toc -->

- [功能特性](#功能特性)
  - [主要功能](#主要功能)
  - [用户界面](#用户界面)
- [基本用法](#基本用法)
- [地理位置服务](#地理位置服务)
- [外部资源](#外部资源)
- [参考资料](#参考资料)
- [修改日志](#修改日志)

## 功能特性

### 主要功能

- :dizzy: 在天球坐标中绘制天体的**视运动**轨迹
- :sunrise: 计算所选天体在指定日期和地点观测时的**升落点和过中天位置及时刻**
- :sunrise_over_mountains: 标记不同的[晨昏蒙影](https://zh.wikipedia.org/wiki/%E6%9B%99%E6%9A%AE%E5%85%89)阶段并给出具体时刻
- :classical_building: 可选日期范围从**公元前3001年至公元3000年**
- :ringed_planet: 调用[美国喷气推进实验室（JPL）星历表](https://ssd.jpl.nasa.gov/planets/eph_export.html)和[依巴谷星表](https://www.cosmos.esa.int/web/hipparcos/home)
- :telescope: 如使用依巴谷星表检索天体，计算时考虑天体[自行](https://zh.wikipedia.org/wiki/%E8%87%AA%E8%A1%8C)
- :night_with_stars: 以不同线条表示天体经过昼夜和不同晨昏蒙影阶段的轨迹
- :clock1: 计算结果中同时包含[标准时间](https://zh.wikipedia.org/wiki/%E6%A8%99%E6%BA%96%E6%99%82%E9%96%93), [地方平时（LMT）](https://zh.wikipedia.org/wiki/%E5%9C%B0%E6%96%B9%E5%B9%B3%E6%99%82)和[世界时（UT1）](https://zh.wikipedia.org/wiki/%E4%B8%96%E7%95%8C%E6%97%B6)

  *输出的标准时间仅反映所选地点当前的时区划分供用户参考，且不考虑夏令时。*

### 用户界面

- :mag: 提供两种指定地点的方式供选择：地址搜索或经纬度输入
- :calendar: 支持以[格里历](https://zh.wikipedia.org/wiki/%E5%85%AC%E5%8E%86)或[儒略历](https://zh.wikipedia.org/wiki/%E5%84%92%E7%95%A5%E6%9B%86)输入日期
- :magic_wand: 可手动输入年月日，或选择某一年的二分二至点来快速输入日期
- :star: 可通过选择行星、查找依巴谷星表或输入[赤经赤纬](https://zh.wikipedia.org/wiki/%E8%B5%A4%E9%81%93%E5%9D%90%E6%A8%99%E7%B3%BB%E7%B5%B1)来选定天体或指定天球坐标[天球坐标](https://zh.wikipedia.org/wiki/%E5%9B%BD%E9%99%85%E5%A4%A9%E7%90%83%E5%8F%82%E8%80%83%E7%B3%BB)
- :mag: 可输入数字或名称来查找依巴谷星表编号，支持[拜耳命名法](https://zh.wikipedia.org/wiki/%E6%8B%9C%E8%80%B3%E5%91%BD%E5%90%8D%E6%B3%95)和[固有名称](https://en.wikipedia.org/wiki/Stellar_designations_and_names)（参见[参考资料](#参考资料)部分）
- :framed_picture: 图像下载支持 SVG、PNG 和 PDF 格式
- :clipboard: 表格下载支持 CSV、JSON 和 XLSX 格式

## 基本用法

1. **地理位置**：使用`搜索地址`搜索和选择一个地点，或者切换到`输入坐标`手动输入十进制小数的经纬度
2. **当地日期**：输入年月日，或者输入年份然后选择一个二分二至点来获得日期
   - 默认使用**格里历**进行日期输入
   - 选择二分二至点时将自动选择且只能选择**格里历**
3. **选择天体**：选择一颗行星，根据依巴谷星表编号选择一个天体，或指定赤经赤纬
   - 搜索依巴谷星表编号时下拉选单会显示编号和星名，选择一个即可
   - 赤经赤纬的输入可选择用`HMS与DMS格式`或`十进制格式`
4. **绘制星轨**：点击`绘制星轨`生成图像和升落点、晨昏蒙影时刻列表

> :bulb: *计算天体位置时考虑了[大气折射](https://zh.wikipedia.org/wiki/%E5%A4%A7%E6%B0%A3%E6%8A%98%E5%B0%84)效应。*

更多使用细节参见[使用指南](https://github.com/stardial-astro/star-path-viewer/wiki/1.-Guides)。

## 地理位置服务

该应用使用了一下地理位置服务：

1. 📍 **[browser-geo-tz](https://github.com/kevmo314/browser-geo-tz)**：根据 [node-geo-tz](https://github.com/evansiroky/node-geo-tz) 修改的轻量时区查询包

2. 🌎 **[Nominatim](https://nominatim.org/release-docs/latest/api/Overview)**：默认的**地点提示**和**逆地理解析**接口，使用 [OSM](www.openstreetmap.org) 地图数据

3. 🇨🇳 **[天地图](http://lbs.tianditu.gov.cn/server/guide.html)**：对于 Nominatim 不可用的地区，此为默认的**逆地理解析**服务

4. 🇨🇳 **[腾讯位置服务](https://lbs.qq.com/service/webService/webServiceGuide/webServiceOverview)**：对于 Nominatim 不可用的地区，此为默认的**地点提示**服务

5. 🇨🇳 **[百度地图](https://lbsyun.baidu.com/faq/api?title=webapi)**：对于 Nominatim 不可用的地区，此为默认的**逆地理解析**服务

> :bulb: 应用启动时会自动判断使用何种服务。如果您发现自动选择的服务有误，请检查系统时区、清空缓存然后刷新页面重试。

## 外部资源

- [美国喷气推进实验室（JPL）星历表](https://ssd.jpl.nasa.gov/planets/eph_export.html)（版本：DE406）

- [依巴谷星表](https://www.cosmos.esa.int/web/hipparcos/catalogues) [[FTP](https://cdsarc.cds.unistra.fr/ftp/cats/I/239)]

- 拜耳命名法和固有名称列表 [[FTP](https://cdsarc.cds.unistra.fr/ftp/I/239/version_cd/tables) (ident4, ident6)]

- [时区边界](https://github.com/evansiroky/timezone-boundary-builder)

- [香港天文台的中文星名列表](https://web.archive.org/web/20120209032035/http://www.lcsd.gov.hk/CE/Museum/Space/Research/StarName/c_research_chinengstars.htm)

- [中文简繁转换](https://pypi.org/project/OpenCC)

- [拼音转换](https://github.com/mozillazg/python-pinyin)

## 参考资料

- [巴黎天文台的升落点和过中天查询](https://ssp.imcce.fr/forms/visibility)

- [升落点和晨昏蒙影定义](https://aa.usno.navy.mil/faq/RST_defs)

- 关于晨昏时分天体的可见性：

  R. Tousey and M. J. Koomen, "The Visibility of Stars and Planets During Twilight," *Journal of the Optical Society of America*, Vol. 43, pp. 177-183, 1953. [Online]. Available: <https://opg.optica.org/josa/viewmedia.cfm?uri=josa-43-3-177&seq=0&html=true>

## 修改日志

- [v1.3.1] 2026-03-29
  - 升级至 MUI 7 和 React 19
  - 新增深浅主题切换和中文
  - 使用天地图和腾讯位置服务替代百度地图

- [v1.3.0] 2025-03-07
  - 使用 Vite

- [v1.2.0] 2024-12-16
  - 计算天体位置时引入大气折射

- [v1.1.0] 2024-12-10
  - 增加地方平时输出（LMT）
  - 优化 PDF 中的文字显示

- [v1.0.2] 2024-10-12
  - 优化表格显示

- [v1.0.1] 2024-09-14
  - 增加下载格式：CSV、JSON 和 XLSX
  - 在 SVG 和 PDF 中嵌入元数据
