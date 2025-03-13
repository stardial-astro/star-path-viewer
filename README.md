# Star Path Viewer

An astronomical tool for tracing the positions of planets and stars on any chosen date in the ancient or future sky.

[![Version](https://img.shields.io/badge/Version-v1.3.0-blue)](#features)
[![node](https://img.shields.io/badge/Node.js-22.12.0-5FA04E?logo=Node.js&logoColor=white)](https://www.npmjs.com)
[![npm](https://img.shields.io/badge/npm-10.9.2-CB3837?logo=npm&logoColor=white)](https://www.npmjs.com)
[![react](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![mui](https://img.shields.io/badge/MUI-5.16.7-007FFF?logo=mui&logoColor=white)](https://mui.com)

[<img alt="thumbnail" src="https://stardial-astro.github.io/star-path-data/images/star-path-viewer_thumbnail.png" width="320">](https://star-path-viewer.pages.dev/)

## Description<!-- omit in toc -->

[Star Path Viewer](https://star-path-viewer.pages.dev/) is a [React](https://react.dev) web application developed by the team [Stardial](https://github.com/stardial-astro).

[→ Source code](https://github.com/claude-hao/star-path-calculator)

[→ Flask server](https://github.com/lydiazly/star-path-calculator-flask)

[→ Hosted data (star names)](https://github.com/stardial-astro/star-path-data)

## Table of Contents<!-- omit in toc -->

- [Features](#features)
  - [Main Functions](#main-functions)
  - [User Interface](#user-interface)
- [Usage](#usage)
- [Services](#services)
- [Resources](#resources)
- [References](#references)
- [Changelog](#changelog)

## Features

### Main Functions

- :dizzy: Plots an arc across the celestial sphere representing the **apparent motion** of a star in the sky.
- :sunrise: Calculates the star's **rising/setting/meridian-transit times** based on the provided date, location, and star.
- :sunrise_over_mountains: Marks the [civil and nautical twilights](https://en.wikipedia.org/wiki/Twilight).
- :classical_building: Covers dates from **3001 BCE to 3000 CE**.
- :ringed_planet: Utilizes [JPL DE406 ephemeris](https://ssd.jpl.nasa.gov/planets/eph_export.html) and [Hipparcos Catalogue](https://www.cosmos.esa.int/web/hipparcos/home) to calculate the positions of planets and stars for any given time.
- :telescope: Includes [proper motion](https://en.wikipedia.org/wiki/Proper_motion) of a star if the Hipparcos Catalogue number is provided.
- :night_with_stars: Displays star paths with distinct line styles for daytime, twilight stages, and nighttime.
- :clock1: Provides **[standard time](https://en.wikipedia.org/wiki/Standard_time)**, **[local mean time (LMT)](https://en.wikipedia.org/wiki/Local_mean_time)**, and **[UT1 time](https://en.wikipedia.org/wiki/Universal_Time)** in the results for the user's reference. (*The offsets are from UT1 and no Daylight Saving Time (DST) adjustments in this project.*)

### User Interface

- :mag: Offers various location input options, including location search, geolocation lookup, or manual latitude and longitude entry.
- :calendar: Accepts the **[Gregorian](https://en.wikipedia.org/wiki/Gregorian_calendar)** or **[Julian](https://en.wikipedia.org/wiki/Julian_calendar)** calendar date input.
- :magic_wand: Allows users to quickly retrieve **equinox** or **solstice** dates by inputting just the year and location, instead of a full date.
- :star: Supports star or planet input by **name**, **Hipparcos Catalogue number**, or [ICRS coordinates](https://en.wikipedia.org/wiki/International_Celestial_Reference_System_and_its_realizations) **[(RA, Dec)](https://en.wikipedia.org/wiki/Equatorial_coordinate_system)**.
- :mag: Allows searching for Hipparcos Catalogue numbers by integers or names, supporting [Bayer designations](https://en.wikipedia.org/wiki/Bayer_designation), proper names, and Chinese names (traditional, simplified, and pinyin) (see [Resources](#resources)).
- :framed_picture: SVG diagrams are available for download in SVG, PNG, or PDF formats.
- :clipboard: Annotation tables are available for download in CSV, JSON, or XLSX formats.

## Usage

1. Input a **location** or manually enter the `latitude` and `longitude` in decimal degrees.
2. Assign a **date** or toggle on an `equinox` or `solstice` button to look up the date (standard time) by the year and location.
   - The default calendar is the Gregorian calendar.
   - For equinox or solstice queries, only the Gregorian calendar is available.
3. Select a **planet**, or specify a **star** by giving its Hipparcos Catalogue number or (RA, Dec).
   - Type a name or number and choose a star from the drop-down list. The corresponding Hipparcos Catalogue number will be set up as well.
   - Enter `RA` in HMS format and `Dec` in DMS format, or both in decimal degrees.
4. Click `DRAW STAR PATH` to generate a diagram and a table of rising/setting/meridian-transit/twilight times.

> :bulb: Note that the [atmospheric refraction](https://en.wikipedia.org/wiki/Atmospheric_refraction) effect has been accounted for.

See [our wiki page](https://github.com/stardial-astro/star-path-viewer/wiki/1.-Guides) for detailed instructions.

## Services

This app relies on the following services:

1. **[browser-geo-tz](https://github.com/kevmo314/browser-geo-tz)** - A browser variant of the geographical timezone lookup package [node-geo-tz](https://github.com/evansiroky/node-geo-tz).

2. **[Nominatim API](https://nominatim.org/release-docs/latest/api/Overview)** - An API to search [OSM](www.openstreetmap.org) data by name and address (geocoding) and to generate synthetic addresses of OSM points (reverse geocoding).

3. **[Baidu Web Service API](https://lbsyun.baidu.com/faq/api?title=webapi)** - If a connection to Nominatim cannot be established, the system will switch to this alternative geocoding service.

> :bulb: The geocoding service is automatically determined when the website loads. If you are outside mainland China but notice that Baidu is being used, refreshing the page should resolve it and select Nominatim as intended.

## Resources

- Ephemeris Data: [JPL Planetary and Lunar Ephemerides](https://ssd.jpl.nasa.gov/planets/eph_export.html) (DE406)

- [The Hipparcos and Tycho Catalogues](https://www.cosmos.esa.int/web/hipparcos/catalogues) [[FTP](https://cdsarc.cds.unistra.fr/ftp/cats/I/239)]

- Bayer Designation and Proper Name [[FTP](https://cdsarc.cds.unistra.fr/ftp/I/239/version_cd/tables) (ident4, ident6)]

- Time Zones: [Timezone Boundary Builder](https://github.com/evansiroky/timezone-boundary-builder)

- Chinese Star Names: [Hong Kong Observatory](https://web.archive.org/web/20120209032035/http://www.lcsd.gov.hk/CE/Museum/Space/Research/StarName/c_research_chinengstars.htm)

- Traditional Chinese to Simplified Chinese Conversion: [Open Chinese Convert](https://pypi.org/project/OpenCC)

- Chinese Characters to Pinyin Conversion: [pypinyin](https://github.com/mozillazg/python-pinyin)

## References

- [IMCCE, Paris Observatory](https://www.imcce.fr)

- [Rise, Set, and Twilight Definitions](https://aa.usno.navy.mil/faq/RST_defs)

- R. Tousey and M. J. Koomen, "The Visibility of Stars and Planets During Twilight," *Journal of the Optical Society of America*, Vol. 43, pp. 177-183, 1953. [Online]. Available: <https://opg.optica.org/josa/viewmedia.cfm?uri=josa-43-3-177&seq=0&html=true>

## Changelog

- [v1.3.0] 2025-03-07
  - Migrated to Vite.

- [v1.2.1] 2025-01-05
  - Minor bug fixes.

- [v1.2.0] 2024-12-16
  - Included atmospheric refraction in position calculation.

- [v1.1.0] 2024-12-10
  - Added Local Mean Time (LMT) columns.
  - Fixed text display in exported PDFs.

- [v1.0.2] 2024-10-12
  - Made the first column of the annotation table sticky.

- [v1.0.1] 2024-09-14
  - Added table download buttons for CSV, JSON, and XLSX formats.
  - Embedded metadata in SVG and PDF.
