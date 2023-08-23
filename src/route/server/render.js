import _ from 'lodash';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { I18nProvider } from '@o2ter/i18n';
import { AppRegistry } from 'react-native';
import { StaticNavigator } from '@o2ter/react-ui';
import { SafeAreaProvider } from '../safeArea';
import { compress } from '../minify/compress';
import { serialize } from 'proto.io';
import { ServerResourceContext } from '../components/ServerResourceProvider/context';
import { SSRRegister } from '../../common/components/SSRRegister';

export function defaultPreferredLocale(req) {

  if (_.isString(req.cookies['PREFERRED_LOCALE'])) {
    return req.cookies['PREFERRED_LOCALE'];
  }

  if (_.isString(req.headers['accept-language'])) {

    const acceptLanguage = req.headers['accept-language'].split(',');

    for (const language of acceptLanguage) {

      return language.split(';')[0].trim();
    }
  }
}
export function renderToHTML(App, {
  env, jsSrc, cssSrc, location, preferredLocale, resources,
}) {

  const ssr_context = {};
  const context = {};

  const Main = () => (
    <SSRRegister context={ssr_context}>
      <ServerResourceContext.Provider value={resources}>
        <I18nProvider preferredLocale={preferredLocale}>
          <StaticNavigator location={location} context={context}>
            <SafeAreaProvider><App /></SafeAreaProvider>
          </StaticNavigator>
        </I18nProvider>
      </ServerResourceContext.Provider>
    </SSRRegister>
  );

  AppRegistry.registerComponent('App', () => Main);
  const { element, getStyleElement } = AppRegistry.getApplication('App');

  const html = ReactDOMServer.renderToString(element);
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
        ${title}${meta_string}${injectedStyle}
        <link rel="stylesheet" href="${cssSrc}" />
        ${css}
      </head>
      <body>
        <div id="root">${html}</div>
        <script id="env" type="text/plain">${compress(serialize(env))}</script>
        <script id="resources" type="text/plain">${compress(serialize(resources))}</script>
        <script src="${jsSrc}"></script>
      </body>
    </html>
  `;
}
