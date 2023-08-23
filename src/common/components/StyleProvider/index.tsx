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
import { useAllStyle, useTheme } from '@o2ter/react-ui';
import { I18nManager, StyleSheet } from 'react-native';
import { useSSRRegister } from '../SSRRegister';

const default_css = (theme: ReturnType<typeof useTheme>) => `
:root {
  --font-sans-serif: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-monospace: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: ${theme.fontSizeBase}px;
}
body {
  margin: 0;
  font-family: var(--font-sans-serif);
  background-color: ${theme.bodyBackground};
  color: ${theme.bodyColor};
}
`;

const css_mapping = {
  marginHorizontal: ['margin-left', 'margin-right'],
  marginVertical: ['margin-top', 'margin-bottom'],
  paddingHorizontal: ['padding-left', 'padding-right'],
  paddingVertical: ['padding-top', 'padding-bottom'],
};

const dir_mapping = (ltr: boolean) => ({
  borderBottomEndRadius: ltr ? 'border-bottom-right-radius' : 'border-bottom-left-radius',
  borderBottomStartRadius: ltr ? 'border-bottom-left-radius' : 'border-bottom-right-radius',
  borderEndWidth: ltr ? 'border-right-width' : 'border-left-width',
  borderStartWidth: ltr ? 'border-left-width' : 'border-right-width',
  borderTopEndRadius: ltr ? 'border-top-right-radius' : 'border-top-left-radius',
  borderTopStartRadius: ltr ? 'border-top-left-radius' : 'border-top-right-radius',
  end: ltr ? 'right' : 'left',
  marginEnd: ltr ? 'margin-right' : 'margin-left',
  marginStart: ltr ? 'margin-left' : 'margin-right',
  paddingEnd: ltr ? 'padding-right' : 'padding-left',
  paddingStart: ltr ? 'padding-left' : 'padding-right',
  start: ltr ? 'left' : 'right',
});

const numberStyleList = ['zIndex'];

const CSSStyleProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children
}) => {

  const theme = useTheme();
  const { classes } = useAllStyle();

  const styles = React.useMemo(() => {

    const _dir_mapping = dir_mapping(!I18nManager.isRTL);
    let css = default_css(theme);

    for (const [name, style] of _.toPairs(classes)) {
      const styles: string[] = [];
      for (const [k, v] of _.toPairs(StyleSheet.flatten(style))) {
        for (const _k of _.castArray(
          css_mapping[k as keyof typeof css_mapping]
          ?? _dir_mapping[k as keyof typeof _dir_mapping]
          ?? _.kebabCase(k)
        )) {
          if (_.isEmpty(_k)) continue;
          if (_.isString(v) || v === 0) {
            styles.push(`${_k}: ${v};`);
          } else if (_.isNumber(v)) {
            styles.push(_.includes(numberStyleList, _k) ? `${_k}: ${v};` : `${_k}: ${v}px;`);
          }
        }
      }
      css += `\n.${name} {\n  ${styles.join('\n  ')}\n}`;
    }

    return css;

  }, [classes]);

  if (typeof window === 'undefined') {
    const ssr_context = useSSRRegister();
    ssr_context['__INJECTED_STYLE__'] = styles;
  }

  React.useInsertionEffect(() => {

    const ssr_element = document.getElementById('react-booster-ssr-styles');
    if (ssr_element) ssr_element.remove();

    const stylesheet = document.createElement('style');
    stylesheet.textContent = styles;

    const [first] = document.head.querySelectorAll('style, link[rel="stylesheet"]');
    if (first) {
      document.head.insertBefore(stylesheet, first);
    } else {
      document.head.appendChild(stylesheet);
    }

    return () => stylesheet.remove();

  }, [styles]);

  return (
    <>{children}</>
  );
}

export const StyleProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children
}) => (
  <DefaultStyleProvider>
    <CSSStyleProvider>{children}</CSSStyleProvider>
  </DefaultStyleProvider>
);
