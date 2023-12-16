//
//  index.js
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
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import { ReactRoute } from '../route';
import application from '../common/run/application';
import * as __APPLICATIONS__ from '__APPLICATIONS__';

const app = express();
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public'), { cacheControl: true }));

const react_env = {};
let __SERVER__ = {};
try { __SERVER__ = await import('__SERVER__'); } catch {};
if ('default' in __SERVER__) await __SERVER__.default(app, react_env);

for (const [name, { path, env }] of _.toPairs(__applications__)) {
  const route = ReactRoute(application(__APPLICATIONS__[name]), {
    env: {
      ...react_env,
      ...env,
    },
    jsSrc: `/${name}_bundle.js`,
    cssSrc: `/css/${name}_bundle.css`,
    preferredLocale: 'preferredLocale' in __SERVER__ ? (req) => __SERVER__.preferredLocale(name, req) : undefined,
    resources: 'resources' in __SERVER__ ? (req) => __SERVER__.resources(name, req) : undefined,
  });
  if (_.isEmpty(path) || path === '/') {
    app.use(route);
  } else {
    app.use(path, route);
  }
}

const PORT = !_.isEmpty(process.env.PORT) ? parseInt(process.env.PORT) : 8080;

const httpServer = require('http').createServer(app);
httpServer.listen(PORT, () => console.info(`listening on port ${PORT}`));
