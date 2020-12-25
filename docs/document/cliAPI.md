# 使用 CLI

如果只想将本工具手工使用，或者用来和其他语言集成，那么 CLI 是一个非常好的选择。CLI 具备 JS API 完全的功能，可以互相替代。

```bash
doc4type -i main.ts -t mytype
```

```
Options:
  -p, -i, --input, --path  The path of input file            [string] [required]
  -t, --typeName           The type name that to be doc      [string] [required]
  -o, --output             The path of output file. If not provided, use
                           inputdir and typename as output path         [string]
  -r, --root               The root of files                            [string]
  -f, --format             The doc format, one of:          [markdown,json,html]
                                                  [string] [default: "markdown"]
      --title              The title (first h1 element) of output document
                                                                        [string]
      --help               Show help                                   [boolean]
      --version            Show version number                         [boolean]
```