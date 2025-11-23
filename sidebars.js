// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: '入门',
      collapsible: false,
      items: ['index', 'landppt'],
    },
    {
      type: 'category',
      label: 'AI 流程',
      collapsible: false,
      items: ['outline-board', 'ppt-editor'],
    },
    {
      type: 'category',
      label: '资源管理',
      collapsible: false,
      items: ['template-management', 'image-gallery'],
    },
    {
      type: 'category',
      label: '系统配置',
      collapsible: false,
      items: ['configuration'],
    },
  ],
};

export default sidebars;
