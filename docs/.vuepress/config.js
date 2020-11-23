module.exports = {
  head: [
    ['script', { src: 'https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js' }],
  ],
  plugins: ['demo-block'],
  themeConfig: {
    /** 开放搜索 */
    search: true,
    searchMaxSuggestions: 10,
    /** 禁用上一篇/下一篇 */
    nextLinks: false,
    prevLinks: false,
    /** 侧边栏导航配置 */
    sidebar: [
      '/',
      {
        title: 'IOptionMain',
        collapsable: true,
        children: [
          {
            title: 'Components',
            collapsable: true,
            children: [
              ['/IOptionMain/coord/doc', 'coord'],
              ['/IOptionMain/tooltip/doc', 'tooltip'],
            ],
          },
          ['/IOptionMain/theme/doc', 'theme'],
        ],
      },
    ],
  },
};
