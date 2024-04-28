//
//  quill.ts
//
//  The MIT License
//  Copyright (c) 2021 - 2024 O2ter Limited. All rights reserved.
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
import { useTheme } from '@o2ter/react-ui';

export const quillStyleGenerator = (theme: ReturnType<typeof useTheme>) => `
.ql-container {
  font-size: ${theme.fontSizes['normal']}px;
}
${_.map([1, 2, 3, 4, 5, 6], i => `
  .ql-bubble .ql-editor h${i} {
    font-size: ${theme.headerFontSizes[i]}px;
  }
  .ql-snow .ql-editor h${i} {
    font-size: ${theme.headerFontSizes[i]}px;
  }
  .ql-bubble .ql-picker.ql-header .ql-picker-item[data-value="${i}"]::before {
    font-size: ${theme.headerFontSizes[i]}px;
  }
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="${i}"]::before {
    font-size: ${theme.headerFontSizes[i]}px;
  }
`).join('')}
${_.map(['small', 'normal', 'large'], i => `
  .ql-editor .ql-size-${i} {
    font-size: ${theme.fontSizes[i]}px;
  }
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value=${i}]::before {
    font-size: ${theme.fontSizes[i]}px;
  }
`).join('')}
`;
