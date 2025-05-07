//
//  index.tsx
//
//  The MIT License
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
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

import React from 'react';
import { I18nProvider } from '@o2ter/i18n';
import { AppRegistry } from 'react-native';
import { BrowserNavigator } from '@o2ter/react-ui';
import { SafeAreaProvider } from '../safeArea';
import { ServerResourceContext } from '../components/ServerResourceProvider/context';

import { decompress } from '../minify/decompress';
import { deserialize } from 'proto.io/client';

const __SSR_DATA__: any = typeof document !== 'undefined' ? (() => {
  const element: any = document.getElementById('__SSR_DATA__');
  element.remove();
  return deserialize(decompress(element.text.trim()));
})() : {};

const {
  env = {},
  resources = {},
  basename,
} = __SSR_DATA__;

export { env };

const _resources = { resources };

export const runApplication = (App: React.FunctionComponent) => {

  const preferredLocale = document.cookie.split('; ').find((row) => row.startsWith('PREFERRED_LOCALE='))?.split('=')[1];

  const Main = () => (
    <ServerResourceContext.Provider value={_resources}>
      <I18nProvider
        preferredLocale={preferredLocale}
        onChange={locale => document.cookie = `PREFERRED_LOCALE=${locale}; max-age=31536000; path=/`}>
        <BrowserNavigator basename={basename}>
          <SafeAreaProvider><App /></SafeAreaProvider>
        </BrowserNavigator>
      </I18nProvider>
    </ServerResourceContext.Provider>
  );

  AppRegistry.registerComponent('App', () => Main);
  AppRegistry.runApplication('App', { rootTag: document.getElementById('root') });
}
