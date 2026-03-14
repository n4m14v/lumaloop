# Engine Package

Pure TypeScript interpreter for the Lightbot-like puzzle rules.

## Usage

```ts
import { runProgram } from "@lumaloop/engine";
import { basicLevelExample } from "@lumaloop/level-schema/src/examples/basicLevel";

const result = runProgram({
  level: basicLevelExample,
  program: {
    main: ["FORWARD", "FORWARD", "LIGHT"],
  },
});
```

The returned `RunResult` contains:

- Final status
- Full execution trace
- Activated targets
- Final robot state
- Step count
- Score details
