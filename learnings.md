# Project Learnings

## File Typesd

I faced some difficulties introducing new files (eg. dto files) to the lambda package. I had initially named the files `.js` instead of `.mjs`. However, since this was a node.js project without any initial setup, the .js files could not be found on AWS.
`.mjs` files are treated as ES Modules which uses `import` and `export` syntax.
 `.js` files are treated as CommonJS modules which uses `require` and `module.exports` syntax.
The AWS runtime is using NodeJS and treats the `.js` files as a CommonJS module and hence cannot understand the `import` and `export` syntax

### Solutions
1. Use .mjs file types for the files. This should explicitly inform NodeJS to treat the files as ES Modules and accept `import` and `export` syntax.
2. Include `"type": "module"` in `package.json`. This tells NodeJS to treat .js files as ES Modules and hence accept `import` and `export` syntax.