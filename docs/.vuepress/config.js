const getConfig = require("vuepress-bar");
const root = `${__dirname}/..`;

const sidebarConfig = getConfig(root, { addReadMeToFirstGroup: false }).sidebar;

module.exports = {
  head: [],
  base: '/doc-for-type/',
  markdown: {
    config: md => {
      md.use(require('markdown-it-task-lists'))
    }
  },
  themeConfig: {
    /** 列出全部标题 */
    displayAllHeaders: false,
    sidebarDepth: 6,
    /** 开放搜索 */
    search: true,
    searchMaxSuggestions: 10,
    /** 禁用上一篇/下一篇 */
    nextLinks: false,
    prevLinks: false,
    /** 侧边栏导航配置 */
    sidebar: sidebarConfig,
  },
};
