module.exports = {
  head: [
    ['script', { src: 'https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js' }],
  ],
  plugins: [
    'demo-block'
  ],
  themeConfig: {
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
