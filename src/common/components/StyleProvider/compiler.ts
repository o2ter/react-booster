//
//  compiler.ts
//
//  The MIT License
//  Copyright (c) 2021 - 2023 O2ter Limited. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import _ from 'lodash';
import postcss from 'postcss-js';
import prefixer from 'autoprefixer';

const UNITLESS = [
  'box-flex',
  'box-flex-group',
  'column-count',
  'flex',
  'flex-grow',
  'flex-positive',
  'flex-shrink',
  'flex-negative',
  'font-weight',
  'line-clamp',
  'line-height',
  'opacity',
  'order',
  'orphans',
  'tab-size',
  'widows',
  'z-index',
  'zoom',
  'fill-opacity',
  'stroke-dashoffset',
  'stroke-opacity',
  'stroke-width',
];

export const cssCompiler = (input: postcss.CssInJs) => {
  const _prefixer = postcss.sync([prefixer]);
  const styles: string[] = [];
  for (const [k, v] of _.toPairs(_prefixer(input))) {
    const _k = k[0].toUpperCase() === k[0] ? `-${_.kebabCase(k)}` : _.kebabCase(k);
    if (_.isEmpty(_k)) continue;
    if (_.isString(v) || v === 0) {
      styles.push(`${_k}: ${v};`);
    } else if (_.isNumber(v)) {
      styles.push(_.includes(UNITLESS, _k) ? `${_k}: ${v};` : `${_k}: ${v}px;`);
    }
  }
  return styles.join('\n');
}
