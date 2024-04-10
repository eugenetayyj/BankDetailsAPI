# Project Learnings

## File Types

I faced some difficulties introducing new files (eg. dto files) to the lambda package. I had initially named the files `.js` instead of `.mjs`. However, since this was a node.js project without any initial setup, the .js files could not be found on AWS.
`.mjs` files are treated as ES Modules which uses `import` and `export` syntax.
 `.js` files are treated as CommonJS modules which uses `require` and `module.exports` syntax.
The AWS runtime is using NodeJS and treats the `.js` files as a CommonJS module and hence cannot understand the `import` and `export` syntax

### Solutions
1. Use .mjs file types for the files. This should explicitly inform NodeJS to treat the files as ES Modules and accept `import` and `export` syntax.
2. Include `"type": "module"` in `package.json`. This tells NodeJS to treat .js files as ES Modules and hence accept `import` and `export` syntax.

## Reading CSV Files

When reading CSV files, it is important to take note of the line endings, new line characters and carriage return characters. These new line `\n` and carraige return `\r` characters denotes the end of a line but since we are using the values, it might read these into the variable and cause unexpected behavior that may inappropriately format the JSON.
Another issue that arose was Byte Order Mark (BOM) that was included at the start of the text file that was encoded in UTF-8. It is not visible in most editors but cause a problem where the variable in the JSON included a `?` to a value read from the cell.

### Solutions
`bankCode=$(echo $bankCode | tr -d '\n\r"' | sed 's/^\xEF\xBB\xBF//')`
We string operations when manipulating $bankCode such that the `\n` and `\r` are trimmed and we use `sed` to remove the Byte Order mark (`xEF\xBB\xBF` is the BOM in hexadecimal format)