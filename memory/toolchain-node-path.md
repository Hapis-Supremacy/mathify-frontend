---
name: toolchain-node-path
description: How to run node/tsc/eslint in this repo — node is not on the agent shell PATH
metadata:
  type: reference
---

Node is installed at `C:\Program Files\nodejs\node.exe` but is **not** on the
agent's Bash or PowerShell PATH (`npx`, `node`, `tsc` all fail with "not
recognized"). To run the toolchain, prepend the dir to PATH for the call:

```
$env:Path = "C:\Program Files\nodejs;" + $env:Path
& node ".\node_modules\typescript\bin\tsc" --noEmit          # typecheck
& node ".\node_modules\eslint\bin\eslint.js" <files...>      # lint
```

Both `tsc --noEmit` and `eslint` pass clean as of the admin-CRUD + RBAC work.
The repo enables the `react-hooks/set-state-in-effect` lint rule, so never call
`setState` synchronously in an effect body — only inside async callbacks (or add
the disable comment as the existing localStorage theme sync does).
