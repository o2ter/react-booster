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
import fs from 'fs';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import { BootstrapRoute, ReactRoute } from '@o2ter/react-route';
import application from '../common/run/application';
import __SERVER__ from '__SERVER__';
import __THEMES__ from '__THEMES__';

const app = express();
app.use(cookieParser());

app.use(express.static('dist/public'));

const react_env = {
  BOOTSTRAP_BASE_URL: '/css/bootstrap',
};

__SERVER__(app, react_env);

let precompiled = {};
try {
  const content = fs.readFileSync(path.join(__dirname, 'themes.json'), { encoding: 'utf-8' });
  precompiled = JSON.parse(content);
} catch { };

app.use('/css/bootstrap', BootstrapRoute(__THEMES__, precompiled));

for (const [name, path] of _.toPairs(__APPLICATIONS__)) {
  const route = ReactRoute(application(Dashboard), {
    env: react_env,
    jsSrc: `/${name}_bundle.js`,
    cssSrc: `/css/${name}_bundle.css`,
  });
  if (_.isEmpty(path) || path === '/') {
    app.use(route);
  } else {
    app.use(path, route);
  }
}

const httpServer = require('http').createServer(app);
httpServer.listen(8080, () => console.log('listening on port 8080'));
