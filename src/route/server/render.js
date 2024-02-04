//
//  render.ts
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
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { I18nProvider } from '@o2ter/i18n';
import { AppRegistry } from 'react-native';
import { StaticNavigator, __FONTS__ } from '@o2ter/react-ui';
import { isPromiseLike } from '../utils';
import { SafeAreaProvider } from '../safeArea';
import { compress } from '../minify/compress';
import { serialize } from 'proto.io';
import { ServerResourceContext } from '../components/ServerResourceProvider/context';
import { SSRRegister } from '../../common/components/SSRRegister';

export const renderToHTML = async (App, {
  req,
  env,
  jsSrc,
  cssSrc,
  basename,
  preferredLocale,
  resources: _resources,
}) => {

  const ssr_context = {};
  const context = {};
  const resources = { request: req, resources: _resources ?? {} };

  const Main = () => (
    <SSRRegister context={ssr_context}>
      <ServerResourceContext.Provider value={resources}>
        <I18nProvider preferredLocale={preferredLocale}>
          <StaticNavigator basename={basename} location={req.originalUrl} context={context}>
            <SafeAreaProvider><App /></SafeAreaProvider>
          </StaticNavigator>
        </I18nProvider>
      </ServerResourceContext.Provider>
    </SSRRegister>
  );

  AppRegistry.registerComponent('App', () => Main);
  const { element, getStyleElement } = AppRegistry.getApplication('App');

  let html = ReactDOMServer.renderToString(element);
  while (_.some(_.values(resources.resource), x => isPromiseLike(x))) {
    resources.resource = _.fromPairs(await Promise.all(_.map(resources.resource, async (v, k) => [k, await v])));
    html = ReactDOMServer.renderToString(element);
  }

  const css = ReactDOMServer.renderToStaticMarkup(getStyleElement());

  const title = _.isString(context.title) ? `<title>${context.title}</title>` : '';

  let meta_string = '';
  if (context.meta) {
    for (const [key, value] of Object.entries(context.meta)) {
      meta_string += `\n<meta name="${key}" content="${value}">`;
    }
  }

  let injectedStyle = ssr_context['__INJECTED_STYLE__'] ?? '';
  if (injectedStyle) injectedStyle = `<style id="react-booster-ssr-styles">\n${injectedStyle}\n</style>`;

  return `
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover">
        <script src="${jsSrc}" defer></script>
        <link rel="stylesheet" href="${cssSrc}" />
        ${title}${meta_string}
        <style>
        ${_.map(_.toPairs(__FONTS__), ([name, url]) => `
          @font-face {
            src: url(${url});
            font-family: ${name};
          }
        `).join('')}
        </style>
        ${_.map(_.values(__FONTS__), url => `<link rel="preload" href="${url}" as="font" />`).join('\n')}
        ${css}${injectedStyle}
      </head>
      <body>
        <div id="root">${html}</div>
        <script id="__SSR_DATA__" type="text/plain">${compress(serialize({ basename, env, resources: resources.resources }))}</script>
      </body>
    </html>
  `;
}
