# Star Path Viewer

[English](README.md) | [簡體中文](README.zh.md) | [繁體中文](README.zh-HK.md)

天體軌跡追蹤天文小工具——顯示上下五千年間制定日期和地點的天體視運動軌跡。

[![版本](https://img.shields.io/badge/Version-v1.3.2-blue)](#功能特性)
[![node](https://img.shields.io/badge/Node.js-24.14.0-5FA04E?logo=Node.js&logoColor=white)](https://www.npmjs.com)
[![react](https://img.shields.io/badge/React-19-1DAFB?logo=react&logoColor=white)](https://react.dev)
[![mui](https://img.shields.io/badge/MUI-7-007FFF?logo=mui&logoColor=white)](https://mui.com)

[<img alt="thumbnail" src="https://stardial-astro.github.io/star-path-data/images/star-path-viewer_thumbnail.png" width="320">](https://star-path-viewer.pages.dev/)

## 簡介<!-- omit in toc -->

[Star Path Viewer](https://star-path-viewer.pages.dev/) 是一個由 [Stardial](https://github.com/stardial-astro) 團隊開發的基於 [React](https://react.dev) 的網頁應用。

[→ 計算功能源代碼](https://github.com/claude-hao/star-path-calculator)

[→ 後端服務器倉庫](https://github.com/lydiazly/star-path-calculator-flask)

[→ 星名列表](https://github.com/stardial-astro/star-path-data)

## 目錄<!-- omit in toc -->

- [功能特性](#功能特性)
  - [主要功能](#主要功能)
  - [用户界面](#用户界面)
- [基本用法](#基本用法)
- [地理位置服務](#地理位置服務)
- [外部資源](#外部資源)
- [參考資料](#參考資料)
- [修改日誌](#修改日誌)

## 功能特性

### 主要功能

- :dizzy: 在天球座標中繪製天體的**視運動**軌跡
- :sunrise: 計算所選天體在指定日期和地點觀測時的**升落點和過中天位置及時刻**
- :sunrise_over_mountains: 標記不同的[晨昏蒙影](https://zh.wikipedia.org/wiki/%E6%9B%99%E6%9A%AE%E5%85%89)階段並給出具體時刻
- :classical_building: 可選日期範圍從**公元前3001年至公元3000年**
- :ringed_planet: 調用[美國噴氣推進實驗室（JPL）星曆錶](https://ssd.jpl.nasa.gov/planets/eph_export.html)和[依巴谷星表](https://www.cosmos.esa.int/web/hipparcos/home)
- :telescope: 如使用依巴谷星表檢索天體，計算時考慮天體[自行](https://zh.wikipedia.org/wiki/%E8%87%AA%E8%A1%8C)
- :night_with_stars: 以不同線條表示天體經過晝夜和不同晨昏蒙影階段的軌跡
- :clock1: 計算結果中同時包含[標準時間](https://zh.wikipedia.org/wiki/%E6%A8%99%E6%BA%96%E6%99%82%E9%96%93), [地方平時（LMT）](https://zh.wikipedia.org/wiki/%E5%9C%B0%E6%96%B9%E5%B9%B3%E6%99%82)和[世界時（UT1）](https://zh.wikipedia.org/wiki/%E4%B8%96%E7%95%8C%E6%97%B6)

  *輸出的標準時間僅反映所選地點當前的時區劃分供用户參考，且不考慮夏令時。*

### 用户界面

- :mag: 提供兩種指定地點的方式供選擇：地址搜索或經緯度輸入
- :calendar: 支持以[格里曆](https://zh.wikipedia.org/wiki/%E5%85%AC%E5%8E%86)或[儒略曆](https://zh.wikipedia.org/wiki/%E5%84%92%E7%95%A5%E6%9B%86)輸入日期
- :magic_wand: 可手動輸入年月日，或選擇某一年的二分二至點來快速輸入日期
- :star: 可通過選擇行星、查找依巴谷星表或輸入[赤經赤緯](https://zh.wikipedia.org/wiki/%E8%B5%A4%E9%81%93%E5%9D%90%E6%A8%99%E7%B3%BB%E7%B5%B1)來選定天體或指定天球座標[天球座標](https://zh.wikipedia.org/wiki/%E5%9B%BD%E9%99%85%E5%A4%A9%E7%90%83%E5%8F%82%E8%80%83%E7%B3%BB)
- :mag: 可輸入數字或名稱來查找依巴谷星表編號，支持[拜耳命名法](https://zh.wikipedia.org/wiki/%E6%8B%9C%E8%80%B3%E5%91%BD%E5%90%8D%E6%B3%95)和[固有名稱](https://en.wikipedia.org/wiki/Stellar_designations_and_names)（參見[參考資料](#參考資料)部分）
- :framed_picture: 圖像下載支持 SVG、PNG 和 PDF 格式
- :clipboard: 表格下載支持 CSV、JSON 和 XLSX 格式

## 基本用法

1. **地理位置**：使用`搜索地址`搜索和選擇一個地點，或者切換到`輸入座標`手動輸入十進制小數的經緯度
2. **當地日期**：輸入年月日，或者輸入年份然後選擇一個二分二至點來獲得日期
   - 默認使用**格里曆**進行日期輸入
   - 選擇二分二至點時將自動選擇且只能選擇**格里曆**
3. **選擇天體**：選擇一顆行星，根據依巴谷星表編號選擇一個天體，或指定赤經赤緯
   - 搜索依巴谷星表編號時下拉選單會顯示編號和星名，選擇一個即可
   - 赤經赤緯的輸入可選擇用`HMS與DMS格式`或`十進制格式`
4. **繪製星軌**：點擊`繪製星軌`生成圖像和升落點、晨昏蒙影時刻列表

> :bulb: *計算天體位置時考慮了[大氣折射](https://zh.wikipedia.org/wiki/%E5%A4%A7%E6%B0%A3%E6%8A%98%E5%B0%84)效應。*

更多使用細節參見[使用指南](https://github.com/stardial-astro/star-path-viewer/wiki/1.-Guides)。

## 地理位置服務

該應用使用了一下地理位置服務：

1. 📍 **[browser-geo-tz](https://github.com/kevmo314/browser-geo-tz)**：根據 [node-geo-tz](https://github.com/evansiroky/node-geo-tz) 修改的輕量時區查詢包

2. 🌎 **[Nominatim](https://nominatim.org/release-docs/latest/api/Overview)**：默認的**地點提示**和**逆地理解析**接口，使用 [OSM](www.openstreetmap.org) 地圖數據

3. 🇨🇳 **[天地圖](http://lbs.tianditu.gov.cn/server/guide.html)**：對於 Nominatim 不可用的地區，此為默認的**逆地理解析**服務

4. 🇨🇳 **[騰訊位置服務](https://lbs.qq.com/service/webService/webServiceGuide/webServiceOverview)**：對於 Nominatim 不可用的地區，此為默認的**地點提示**服務

5. 🇨🇳 **[百度地圖](https://lbsyun.baidu.com/faq/api?title=webapi)**：對於 Nominatim 不可用的地區，此為默認的**逆地理解析**服務

> :bulb: 應用啟動時會自動判斷使用何種服務。如果您發現自動選擇的服務有誤，請檢查系統時區、清空緩存然後刷新頁面重試。

## 外部資源

- [美國噴氣推進實驗室（JPL）星曆錶](https://ssd.jpl.nasa.gov/planets/eph_export.html)（版本：DE406）

- [依巴谷星表](https://www.cosmos.esa.int/web/hipparcos/catalogues) [[FTP](https://cdsarc.cds.unistra.fr/ftp/cats/I/239)]

- 拜耳命名法和固有名稱列表 [[FTP](https://cdsarc.cds.unistra.fr/ftp/I/239/version_cd/tables) (ident4, ident6)]

- [時區邊界](https://github.com/evansiroky/timezone-boundary-builder)

- [香港天文台的中文星名列表](https://web.archive.org/web/20120209032035/http://www.lcsd.gov.hk/CE/Museum/Space/Research/StarName/c_research_chinengstars.htm)

- [中文簡繁轉換](https://pypi.org/project/OpenCC)

- [拼音轉換](https://github.com/mozillazg/python-pinyin)

## 參考資料

- [巴黎天文台的升落點和過中天查詢](https://ssp.imcce.fr/forms/visibility)

- [升落點和晨昏蒙影定義](https://aa.usno.navy.mil/faq/RST_defs)

- 關於晨昏時分天體的可見性：

  R. Tousey and M. J. Koomen, "The Visibility of Stars and Planets During Twilight," *Journal of the Optical Society of America*, Vol. 43, pp. 177-183, 1953. [Online]. Available: <https://opg.optica.org/josa/viewmedia.cfm?uri=josa-43-3-177&seq=0&html=true>

## 修改日誌

- [v1.3.2] 2026-04-26
  - Bug 修復

- [v1.3.1] 2026-03-29
  - 升級至 MUI 7 和 React 19
  - 新增深淺主題切換和中文
  - 使用天地圖和騰訊位置服務替代百度地圖

- [v1.3.0] 2025-03-07
  - 使用 Vite

- [v1.2.0] 2024-12-16
  - 計算天體位置時引入大氣折射

- [v1.1.0] 2024-12-10
  - 增加地方平時輸出（LMT）
  - 優化 PDF 中的文字顯示

- [v1.0.2] 2024-10-12
  - 優化表格顯示

- [v1.0.1] 2024-09-14
  - 增加下載格式：CSV、JSON 和 XLSX
  - 在 SVG 和 PDF 中嵌入元數據
