(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{364:function(t,s,a){"use strict";a.r(s);var n=a(42),e=Object(n.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"使用注释-api"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#使用注释-api"}},[t._v("#")]),t._v(" 使用注释 API")]),t._v(" "),a("p",[t._v("使用注释 API 可以在生成的文档中插入对应的内容")]),t._v(" "),a("p",[t._v("不使用注释也可以按照类型生成文档的基本结构，但使用注释会让生成的文档可读性更高。")]),t._v(" "),a("p",[t._v("本项目实现的注释是 jsdoc 的子集，语法相同。")]),t._v(" "),a("h2",{attrs:{id:"description"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#description"}},[t._v("#")]),t._v(" @description")]),t._v(" "),a("p",[t._v("生成一段说明文档。没有任何 jsdoc 标注的注释内容也将被视为 "),a("code",[t._v("@description")]),t._v(" 内容。")]),t._v(" "),a("p",[t._v("输入：")]),t._v(" "),a("div",{staticClass:"language-ts extra-class"},[a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/** \n * @description This is a Circle\n */")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("interface")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Circle")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  kind"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"circle"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  radius"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("number")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("输出：")]),t._v(" "),a("div",{staticClass:"language-md extra-class"},[a("pre",{pre:!0,attrs:{class:"language-md"}},[a("code",[a("span",{pre:!0,attrs:{class:"token title important"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("##")]),t._v(" Circle")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 类型: "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`object`")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 描述: This is a Circle\n")])])]),a("h2",{attrs:{id:"example"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#example"}},[t._v("#")]),t._v(" @example")]),t._v(" "),a("p",[t._v("生成一段代码示例文档")]),t._v(" "),a("p",[t._v("输入：")]),t._v(" "),a("div",{staticClass:"language-ts extra-class"},[a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/** \n * @example { kind: 'circle', radius: 5}\n */")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("interface")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Circle")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  kind"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"circle"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  radius"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("number")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("输出：")]),t._v(" "),a("div",{staticClass:"language-md extra-class"},[a("pre",{pre:!0,attrs:{class:"language-md"}},[a("code",[a("span",{pre:!0,attrs:{class:"token title important"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("##")]),t._v(" Circle ")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 类型: "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`object`")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 描述: 暂无描述 \n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 示例:\n{ kind: 'circle', radius: 5} \n")])])]),a("h2",{attrs:{id:"link"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#link"}},[t._v("#")]),t._v(" @link")]),t._v(" "),a("p",[t._v("生成链接，用于处理一些比较复杂深层的类型。使用了 @link 的类型，将不会生成 json 子类型描述。")]),t._v(" "),a("p",[t._v("输入：")]),t._v(" "),a("div",{staticClass:"language-ts extra-class"},[a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/** \n * @link /components/Circle\n */")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("interface")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Circle")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  kind"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"circle"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  radius"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("number")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("输出：")]),t._v(" "),a("div",{staticClass:"language-md extra-class"},[a("pre",{pre:!0,attrs:{class:"language-md"}},[a("code",[a("span",{pre:!0,attrs:{class:"token title important"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("##")]),t._v(" [Circle](/components/Circle)")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 类型: "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`object`")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 描述: 暂无描述 \n")])])]),a("h2",{attrs:{id:"default"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#default"}},[t._v("#")]),t._v(" @default")]),t._v(" "),a("p",[t._v("生成默认值描述。")]),t._v(" "),a("p",[t._v("输入:")]),t._v(" "),a("div",{staticClass:"language-ts extra-class"},[a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("interface")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("MyObject")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/**\n   * @default true\n   */")]),t._v("\n  varBoolean"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("boolean")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/**\n   * @default 123\n   */")]),t._v("\n  varInteger"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("number")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v('/**\n   * @default "foo"\n   */')]),t._v("\n  varString"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("string")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("输出:")]),t._v(" "),a("div",{staticClass:"language-md extra-class"},[a("pre",{pre:!0,attrs:{class:"language-md"}},[a("code",[a("span",{pre:!0,attrs:{class:"token title important"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("##")]),t._v(" varBoolean <small>")]),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`required`")]),a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("small")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v(" \n\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 类型: "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`boolean`")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 描述: 暂无描述 \n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 默认值: "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`true`")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token title important"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("##")]),t._v(" varInteger <small>")]),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`required`")]),a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("small")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v(" \n\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 类型: "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`number`")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 描述: 暂无描述 \n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 默认值: "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`123`")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token title important"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("##")]),t._v(" varFloat <small>")]),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`required`")]),a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("small")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v(" \n\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 类型: "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`number`")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 描述: 暂无描述 \n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 默认值: "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`3.21`")]),t._v("\n")])])]),a("h2",{attrs:{id:"title"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#title"}},[t._v("#")]),t._v(" @title")]),t._v(" "),a("p",[t._v("仅能够用于顶层类型。为生成的文档配置标题。除了使用 "),a("code",[t._v("@title")]),t._v("，也可以在 API 或 CLI 调用时使用 "),a("code",[t._v("--title")]),t._v(" 参数。详情可参考 "),a("RouterLink",{attrs:{to:"/document/APIOption.html#title"}},[t._v("API 文档")])],1),t._v(" "),a("p",[t._v("输入:")]),t._v(" "),a("div",{staticClass:"language-ts extra-class"},[a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/** \n * @title 配置项文档\n */")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("type")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Option")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" value"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("number")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("输出")]),t._v(" "),a("div",{staticClass:"language-markdown extra-class"},[a("pre",{pre:!0,attrs:{class:"language-markdown"}},[a("code",[a("span",{pre:!0,attrs:{class:"token title important"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("#")]),t._v(" 配置项文档")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 类型: "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`object`")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 描述: 暂无描述 \n\n"),a("span",{pre:!0,attrs:{class:"token title important"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("##")]),t._v(" value")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 类型: "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`number`")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v(" 描述: 暂无描述 \n")])])]),a("h2",{attrs:{id:"fragment"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#fragment"}},[t._v("#")]),t._v(" @fragment")]),t._v(" "),a("p",[t._v("在标题下部直接嵌入一段 markdown 片段，用于生成一些比较复杂的片段。本项目会对 markdown 输出的格式进行 lint，可能出现多余的空行、缩进，属于正常现象。")]),t._v(" "),a("p",[t._v("输入:")]),t._v(" "),a("div",{staticClass:"language-ts extra-class"},[a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/**\n * @fragment\n * 这是一个 `markdown` 片段\n * > 用于测试\n */")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("interface")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("MyObject")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/** \n   * @fragment\n   * ![img](../assets/data.svg)\n  */")]),t._v("\n  data"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("string")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("输出:")]),t._v(" "),a("div",{staticClass:"language-md extra-class"},[a("pre",{pre:!0,attrs:{class:"language-md"}},[a("code",[a("span",{pre:!0,attrs:{class:"token title important"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("#")]),t._v(" MyObject")]),t._v("\n\n这是一个 "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`markdown`")]),t._v(" 片段\n\n"),a("span",{pre:!0,attrs:{class:"token blockquote punctuation"}},[t._v(">")]),t._v(" 用于测试\n\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v("   类型: "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`object`")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v("   描述: 暂无描述\n\n"),a("span",{pre:!0,attrs:{class:"token title important"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("##")]),t._v(" data <sup>")]),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`required`")]),a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("sup")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token url"}},[t._v("!["),a("span",{pre:!0,attrs:{class:"token content"}},[t._v("img")]),t._v("](../assets/data.svg)")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v("   类型: "),a("span",{pre:!0,attrs:{class:"token code keyword"}},[t._v("`string`")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token list punctuation"}},[t._v("*")]),t._v("   描述: 暂无描述\n\n")])])]),a("h2",{attrs:{id:"max-和-min"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#max-和-min"}},[t._v("#")]),t._v(" @max 和 @min")]),t._v(" "),a("p",[t._v("生成最大、最小值描述")])])}),[],!1,null,null,null);s.default=e.exports}}]);