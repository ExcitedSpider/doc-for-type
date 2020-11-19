const { mergeWith } = require('docz-utils')
const fs = require('fs-extra')

let custom = {}
const hasGatsbyConfig = fs.existsSync('./gatsby-config.custom.js')

if (hasGatsbyConfig) {
  try {
    custom = require('./gatsby-config.custom')
  } catch (err) {
    console.error(
      `Failed to load your gatsby-config.js file : `,
      JSON.stringify(err),
    )
  }
}

const config = {
  pathPrefix: '/',

  siteMetadata: {
    title: 'Docz Example Typescript',
    description: 'My awesome app using docz',
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-typescript',
      options: {
        isTSX: true,
        allExtensions: true,
      },
    },
    {
      resolve: 'gatsby-theme-docz',
      options: {
        themeConfig: {},
        src: './',
        gatsbyRoot: null,
        themesDir: 'src',
        mdxExtensions: ['.md', '.mdx'],
        docgenConfig: {},
        menu: [],
        mdPlugins: [],
        hastPlugins: [],
        ignore: [],
        typescript: true,
        ts: false,
        propsParser: true,
        'props-parser': true,
        debug: false,
        native: false,
        openBrowser: null,
        o: null,
        open: null,
        'open-browser': null,
        root: '/Users/qe/Workspace/adui-charts-doc-new/.docz',
        base: '/',
        source: './',
        'gatsby-root': null,
        files: '**/*.{md,markdown,mdx}',
        public: '/public',
        dest: '.docz/dist',
        d: '.docz/dist',
        editBranch: 'master',
        eb: 'master',
        'edit-branch': 'master',
        config: '',
        title: 'Docz Example Typescript',
        description: 'My awesome app using docz',
        host: 'localhost',
        port: 3000,
        p: 3000,
        separator: '-',
        paths: {
          root: '/Users/qe/Workspace/adui-charts-doc-new',
          templates:
            '/Users/qe/Workspace/adui-charts-doc-new/node_modules/docz-core/dist/templates',
          docz: '/Users/qe/Workspace/adui-charts-doc-new/.docz',
          cache: '/Users/qe/Workspace/adui-charts-doc-new/.docz/.cache',
          app: '/Users/qe/Workspace/adui-charts-doc-new/.docz/app',
          appPackageJson:
            '/Users/qe/Workspace/adui-charts-doc-new/package.json',
          appTsConfig: '/Users/qe/Workspace/adui-charts-doc-new/tsconfig.json',
          gatsbyConfig:
            '/Users/qe/Workspace/adui-charts-doc-new/gatsby-config.js',
          gatsbyBrowser:
            '/Users/qe/Workspace/adui-charts-doc-new/gatsby-browser.js',
          gatsbyNode: '/Users/qe/Workspace/adui-charts-doc-new/gatsby-node.js',
          gatsbySSR: '/Users/qe/Workspace/adui-charts-doc-new/gatsby-ssr.js',
          importsJs:
            '/Users/qe/Workspace/adui-charts-doc-new/.docz/app/imports.js',
          rootJs: '/Users/qe/Workspace/adui-charts-doc-new/.docz/app/root.jsx',
          indexJs:
            '/Users/qe/Workspace/adui-charts-doc-new/.docz/app/index.jsx',
          indexHtml:
            '/Users/qe/Workspace/adui-charts-doc-new/.docz/app/index.html',
          db: '/Users/qe/Workspace/adui-charts-doc-new/.docz/app/db.json',
        },
      },
    },
  ],
}

const merge = mergeWith((objValue, srcValue) => {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
})

module.exports = merge(config, custom)
