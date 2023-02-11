## Starting the program

```bash
npm install
```

There are several ways to run the code.

### Inside vscode

* Just press F5 in vscode
* Press ctrl-shift-p and choose "Debug: Select and start debugging"
* Using the UI


### Directly running .ts from command line

Use one of the following (depends on what you like)

```bash
node --transpile-only ./src/index.ts   # This one is faster!
npm start
```

### Compile to javascript and then run it

```bash
tsc -b -v
node dist/index.js
```

## eslint

Eslint is configured, run linting by executing:

```bash
npm run lint
```