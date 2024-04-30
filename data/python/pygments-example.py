from pygments import highlight
from pygments.lexers import get_lexer_by_name

# Formatting the output to be sent to a terminal
# Hence using Terminal256Formatter. Many other formatters 
from pygments.formatters import Terminal256Formatter, HtmlFormatter
from pygments.styles import get_all_styles

import markdown 

# Using my favorite style - monokai
markdown_text = """
# Heading 1
## Heading 2
This is `inline code`.
```c
// fenced code block
void foo() {
    printf("bar");
}
```\

### Lists
- **bold**
- *italic*
#### Checklists
- [ ] TBD
- [x] Done

# Title
토람코

## Info
|   Name   |   Type   |
| -------- | -------- |
|  토람코   |  블로그  |

"""

header = """
<head>
<style>
table, th, td {
  border: 1px solid black;
  border-collapse: collapse;
}
</style>
</head>
"""

print(highlight(markdown_text, 
        lexer=get_lexer_by_name("markdown"), 
        formatter=HtmlFormatter(style="monokai")))

print(list(get_all_styles()))

result = markdown.markdown(markdown_text, extensions=['tables'])

print(result)
