import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Star Path Viewer',
  description: 'Trace a star in the ancient or future sky.',

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Get Started', link: '/guide' },
          { text: 'Examples', link: '/examples' },
          { text: 'Troubleshooting', link: '/troubleshooting' },
          { text: 'Conventions', link: '/conventions' },
        ],
        sidebar: [
          { text: 'Get Started', link: '/guide' },
          { text: 'Examples', link: '/examples' },
          { text: 'Troubleshooting', link: '/troubleshooting' },
          { text: 'Conventions', link: '/conventions' },
        ],
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh',
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '开始使用', link: '/zh/guide' },
          { text: '参考用例', link: '/zh/examples' },
          { text: '问题排查', link: '/zh/troubleshooting' },
          { text: '惯例约定', link: '/zh/conventions' },
        ],
        sidebar: [
          { text: '开始使用', link: '/zh/guide' },
          { text: '参考用例', link: '/zh/examples' },
          { text: '问题排查', link: '/zh/troubleshooting' },
          { text: '惯例约定', link: '/zh/conventions' },
        ],
      },
    },
    'zh-HK': {
      label: '繁體中文',
      lang: 'zh-HK',
      link: '/zh-HK/',
      themeConfig: {
        nav: [
          { text: '開始使用', link: '/zh-HK/guide' },
          { text: '參考用例', link: '/zh-HK/examples' },
          { text: '問題排查', link: '/zh-HK/troubleshooting' },
          { text: '慣例約定', link: '/zh-HK/conventions' },
        ],
        sidebar: [
          { text: '開始使用', link: '/zh-HK/guide' },
          { text: '參考用例', link: '/zh-HK/examples' },
          { text: '問題排查', link: '/zh-HK/troubleshooting' },
          { text: '慣例約定', link: '/zh-HK/conventions' },
        ],
      },
    },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/stardial-astro/star-path-viewer',
      },
    ],
  },
});
