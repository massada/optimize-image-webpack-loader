# optimize-image-webpack-loader
A image loader module for webpack.

## Requirements

This module requires a minimum of Node v6.9.0 and works with Webpack v3 and Webpack v4.

## Getting Started

### npm
```console
$ npm install optimize-image-webpack-loader
```

### yarn
```console
$ yarn add optimize-image-webpack-loader
```

## Options

### `name`
Type: `String`
Default: `'[name].[hash:8].[ext]'`

Specifies a custom image filename template for the target file(s) using the
query parameter `name`.

### `sharp`
Type: `Object`
Default: `{}`

Overwrites sharp options.

See (https://github.com/lovell/sharp/blob/master/lib/constructor.js) for
defaults.

### `widths`
Type: `Number|Array`
Default: `undefined`

Specifies the output image(s) width, defaults to loaded image width.

## Usage

### Example 1
```js
const config = {
  ...
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|tiff)$/,
        loader: 'optimize-image-webpack-loader',
        options: {
          name: 'images/[name].[hash:8].[ext]',
          sharp: {
            jpegQuality: 85,
            jpegProgressive: true,
            jpegChromaSubsampling: '4:2:0'
          },
          widths: [2000, 1000],
        },
      },
    ],
  },
  ...
};
```

### Example 2
```js
const url = require('./image.jpg?{widths:[500,250]}');
```

### Example 4
```js
const url = require('./image.jpg?{widths:125}');
```

## Changelog
See [Changelog](./CHANGELOG.md).

## License
Copyright (c) 2018 José Massada <jose.massada@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
