const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => (m && m.default) || m


exports.components = {
  "component---cache-dev-404-page-js": hot(preferDefault(require("/Users/qe/Workspace/adui-charts-doc-new/.docz/.cache/dev-404-page.js"))),
  "component---readme-md": hot(preferDefault(require("/Users/qe/Workspace/adui-charts-doc-new/README.md"))),
  "component---src-components-alert-mdx": hot(preferDefault(require("/Users/qe/Workspace/adui-charts-doc-new/src/components/Alert.mdx"))),
  "component---src-components-button-mdx": hot(preferDefault(require("/Users/qe/Workspace/adui-charts-doc-new/src/components/Button.mdx"))),
  "component---src-index-mdx": hot(preferDefault(require("/Users/qe/Workspace/adui-charts-doc-new/src/index.mdx"))),
  "component---src-options-tooltip-mdx": hot(preferDefault(require("/Users/qe/Workspace/adui-charts-doc-new/src/options/tooltip.mdx"))),
  "component---src-pages-404-js": hot(preferDefault(require("/Users/qe/Workspace/adui-charts-doc-new/.docz/src/pages/404.js")))
}

