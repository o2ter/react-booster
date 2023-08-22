//
//  decompress.js
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

export const decompress = (o) => {
  function r(r) {
    for (i = f = 0; i < r; )
      A < 2 && ((A = 64), (a = 92 < (a = o.charCodeAt(C++)) ? a - 59 : a - 58)),
        (f |= (0 < (a & (A /= 2))) << i),
        ++i;
  }
  for (var n, f, i, t, a, e = [], u = 1, _ = 3, c = 1, h = [], A = 0, C = 0;;) {
    if ((r(c + 1), 2 == f)) return h.join("");
    -2 & (t = f) ||
      (r(8 * f + 8),
      (e[(t = _++)] = String.fromCharCode(f)),
      --u || (u = 2 << c++)),
      h.push((t = e[t] || n + n[0])),
      n && ((e[_++] = n + t[0]), --u || (u = 2 << c++)),
      (n = t);
  }
};
