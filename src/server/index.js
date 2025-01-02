//
//  index.js
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

import _ from 'lodash';
import path from 'path';
import { Server } from '@o2ter/server-js';
import { ReactRoute } from '../route';
import application from '../common/run/application';
import * as __APPLICATIONS__ from '__APPLICATIONS__';

let __SERVER__ = {};
try {
  __SERVER__ = await import('__SERVER__');
} catch(e) {
  console.error(e);
};

const app = 'serverOptions' in __SERVER__ ? new Server(__SERVER__.serverOptions) : new Server;

app.use(Server.static(path.join(__dirname, 'public'), { cacheControl: true }));

const server_env = {};
if ('default' in __SERVER__) await __SERVER__.default(app, server_env);

for (const [name, { path, basename, env }] of _.toPairs(__applications__)) {
  const { default: App, root: Root } = __APPLICATIONS__[name];
  const route = ReactRoute(application(App, Root), {
    env: {
      ...server_env,
      ...env,
    },
    jsSrc: `/${name}_bundle.js`,
    cssSrc: `/css/${name}_bundle.css`,
    basename: basename ?? '/',
    preferredLocale: 'preferredLocale' in __SERVER__ ? (req) => __SERVER__.preferredLocale(app, name, req) : undefined,
    resources: 'resources' in __SERVER__ ? (req) => __SERVER__.resources(app, name, req) : undefined,
  });
  if (_.isEmpty(path) || path === '/') {
    app.use(route);
  } else {
    app.use(path, route);
  }
}

app.use((err, req, res, next) => {
  res.status(500).json(err instanceof Error ? { message: err.message } : err);
});

const PORT = !_.isEmpty(process.env.PORT) ? parseInt(process.env.PORT) : 8080;

app.listen(PORT, () => console.info(`listening on port ${PORT}`));
