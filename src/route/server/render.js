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
  request,
  response,
  env,
  jsSrc,
  cssSrc,
  basename,
  preferredLocale,
  resources: _resources,
}) => {

  const ssr_context = {};
  const context = {};
  const resources = { request: request, resources: _resources ?? {} };

  const Main = () => (
    <SSRRegister context={ssr_context}>
      <ServerResourceContext.Provider value={resources}>
        <I18nProvider preferredLocale={preferredLocale}>
          <StaticNavigator basename={basename} location={request.originalUrl} context={context}>
            <SafeAreaProvider><App /></SafeAreaProvider>
          </StaticNavigator>
        </I18nProvider>
      </ServerResourceContext.Provider>
    </SSRRegister>
  );

  AppRegistry.registerComponent('App', () => Main);
  const { element, getStyleElement } = AppRegistry.getApplication('App');

  let body = ReactDOMServer.renderToString(element);
  while (_.some(_.values(resources.resource), x => isPromiseLike(x))) {
    resources.resource = _.fromPairs(await Promise.all(_.map(resources.resource, async (v, k) => [k, await v])));
    body = ReactDOMServer.renderToString(element);
  }

  const injectedStyle = ssr_context['__INJECTED_STYLE__'] ?? '';
  const ssrData = compress(serialize({ basename, env, resources: resources.resources }))

  const html = (
    <html>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover' />
        <script src={jsSrc} defer />
        <link rel='stylesheet' type='text/css' href={cssSrc} />
        {!_.isEmpty(context.title) && <title>{context.title}</title>}
        {_.map(context.meta, (value, key) => (
          <meta key={key} name={key} content={value} />
        ))}
        <style>
          {_.map(_.toPairs(__FONTS__), ([name, url]) => `
            @font-face {
              src: url(${url});
              font-family: ${name};
            }
          `).join('')}
        </style>
        {_.map(_.values(__FONTS__), url => (
          <link key={url} rel='preload' href={url} as='font' />
        ))}
        {getStyleElement()}
        {!_.isEmpty(injectedStyle) && <style id='react-booster-ssr-styles'>{injectedStyle}</style>}
      </head>
      <body>
        <div id='root' dangerouslySetInnerHTML={{ __html: body }} />
        <script id='__SSR_DATA__' type='text/plain' dangerouslySetInnerHTML={{ __html: ssrData }} />
      </body>
    </html>
  );

  const { pipe } = ReactDOMServer.renderToPipeableStream(html, {
    onShellReady() {
      response.status(context.statusCode ?? 200);
      response.setHeader('content-type', 'text/html');
      pipe(response);
    }
  });
}
