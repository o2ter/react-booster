//
//  index.tsx
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
import React from 'react';
import { DefaultStyleProvider } from '@o2ter/wireframe';
import { useAllStyle } from '@o2ter/react-ui';

const default_css = `
:root {
  --font-sans-serif: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-monospace: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
body {
  margin: 0;
  font-family: var(--font-sans-serif);
}
`;

const css_mapping = (ltr: boolean) => ({
  alignContent: 'align-content',
  alignItems: 'align-items',
  alignSelf: 'align-self',
  backgroundColor: 'background-color',
  borderBottomEndRadius: '',
  borderBottomLeftRadius: '',
  borderBottomRightRadius: '',
  borderBottomStartRadius: '',
  borderBottomWidth: 'border-bottom-width',
  borderColor: 'border-color',
  borderEndWidth: '',
  borderLeftWidth: 'border-left-width',
  borderRadius: 'border-radius',
  borderRightWidth: 'border-right-width',
  borderStartWidth: '',
  borderTopEndRadius: '',
  borderTopLeftRadius: '',
  borderTopRightRadius: '',
  borderTopStartRadius: '',
  borderTopWidth: 'border-top-width',
  borderWidth: 'border-width',
  bottom: 'bottom',
  color: 'color',
  display: 'display',
  end: 'end',
  flexDirection: 'flex-direction',
  fontSize: 'font-size',
  fontStyle: 'font-style',
  fontWeight: 'font-weight',
  gap: 'gap',
  height: 'height',
  left: 'left',
  margin: 'margin',
  marginBottom: 'margin-bottom',
  marginEnd: '',
  marginHorizontal: ['margin-left', 'margin-right'],
  marginLeft: 'margin-left',
  marginRight: 'margin-right',
  marginStart: '',
  marginTop: 'margin-top',
  marginVertical: ['margin-top', 'margin-bottom'],
  padding: 'padding',
  paddingBottom: 'padding-bottom',
  paddingEnd: '',
  paddingHorizontal: ['padding-left', 'padding-right'],
  paddingLeft: 'padding-left',
  paddingRight: 'padding-right',
  paddingStart: '',
  paddingTop: 'padding-top',
  paddingVertical: ['padding-top', 'padding-bottom'],
  position: 'position',
  right: 'right',
  start: '',
  textAlign: 'text-align',
  textDecorationLine: 'text-decoration-line',
  textTransform: 'text-transform',
  top: 'top',
  width: 'width',
  zIndex: 'z-index',
});

const CSSStyleProvider = ({
  children
}) => {
  const { classes } = useAllStyle();
  React.useEffect(() => {

    let css = default_css;

    for (const [name, style] of _.toPairs(classes)) {

    }

    const stylesheet = document.createElement('style');
    stylesheet.textContent = css;

    const [first] = document.head.querySelectorAll('style, link[rel="stylesheet"]');
    if (first) {
      document.head.insertBefore(stylesheet, first);
    } else {
      document.head.appendChild(stylesheet);
    }

    return () => stylesheet.remove();

  }, [classes]);
  return (
    <>{children}</>
  );
}

export const StyleProvider = ({
  children
}) => (
  <DefaultStyleProvider>
    <CSSStyleProvider>{children}</CSSStyleProvider>
  </DefaultStyleProvider>
);
