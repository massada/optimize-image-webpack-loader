//
// optimize-image-webpack-loader
//
// Copyright (c) 2018 José Massada <jose.massada@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import loaderUtils from 'loader-utils';
import sharp from 'sharp';

const defaultOptions = {
  name: '[name].[hash:8].[ext]',
  sharp: {},
  lean: false,
};

function toArray(value) {
  if (value === null || typeof value === 'undefined') {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function serializeAsset(asset, lean) {
  const { url, width } = asset;
  const data = `url: __webpack_public_path__ + '${url}', width: ${width}`;

  if (!lean) {
    return `{${data}, toString() { return this.url; }}`;
  }

  return `{${data}}`;
}

function serialize(assets, lean) {
  const data = assets.map((a) => serializeAsset(a, lean)).join(',\n  ');
  return `module.exports = ${assets.length > 1 ? `[${data}]` : data};`;
}

async function getMetadata(ctx, image, options) {
  const { cacheDir } = options;
  const key = `meta${ctx.resourcePath}`;

  if (cacheDir) {
    try {
      const { data } = await cacache.get(cacheDir, key);
      return JSON.parse(data);
    } catch (err) {}
  }

  const metadata = await image.metadata();

  if (cacheDir) {
    await cacache.put(cacheDir, key, JSON.stringify(metadata));
  }

  return metadata;
}

async function optimize(ctx, image, options) {
  const { name, width, emitFile, cacheDir } = options;
  const key = `${ctx.resourcePath}+${width}`;

  const url = loaderUtils.interpolateName(ctx, name, {
    content: key,
  });

  let data;
  if (cacheDir) {
    try {
      ({ data } = await cacache.get(cacheDir, key));
    } catch (err) {}
  }

  if (!data) {
    data = await image.resize(width).toBuffer();

    if (cacheDir) {
      await cacache.put(cacheDir, key, data);
    }
  }

  if (emitFile !== false) {
    ctx.emitFile(url, data);
  }

  return { url, width };
}

async function process(ctx, image, options) {
  const { name, width, emitFile, cache, lean } = options;

  const findCacheDirOptions = { name: 'optimize-image-webpack-loader' };
  const cacheDir = cache !== false ? findCacheDir(findCacheDirOptions) : null;

  const metadata = await getMetadata(ctx, image, { cacheDir });

  const promises = toArray(width || metadata.width).map((w) =>
    optimize(ctx, image, { name, width: w, emitFile, cacheDir })
  );

  const assets = await Promise.all(promises);
  return serialize(assets, lean);
}

export default function loader(content) {
  if (this.cacheable) {
    this.cacheable();
  }

  const cb = this.async();

  const options = Object.assign({}, defaultOptions);

  Object.assign(options, loaderUtils.getOptions(this) || {});
  if (this.resourceQuery) {
    Object.assign(options, loaderUtils.parseQuery(this.resourceQuery));
  }

  const image = sharp(content);
  Object.assign(image.options, options.sharp);

  process(this, image, options).then((data) => cb(null, data), cb);
}

export const raw = true;
