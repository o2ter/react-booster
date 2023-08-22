//
//  index.ts
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

import express, { Request } from 'express';
import cookieParser from 'cookie-parser';

import { defaultPreferredLocale, renderToHTML } from './render';
import { Awaitable } from 'sugax/dist/index.web';

type ReactRouteOptions = {
  env: any;
  jsSrc: string;
  cssSrc: string;
  preferredLocale?: (req: Request) => Awaitable<string | undefined>;
  resources?: (req: Request) => Awaitable<any>;
}

export const ReactRoute = (App: any, {
  env = {},
  jsSrc = '/bundle.js',
  cssSrc = '/css/bundle.css',
  preferredLocale = defaultPreferredLocale,
  resources,
}: ReactRouteOptions) => {

  const router = express.Router();
  router.use(cookieParser() as any);

  router.get('*', async (req, res) => {
    const _preferredLocale = await preferredLocale(req);
    res.cookie('PREFERRED_LOCALE', _preferredLocale, { maxAge: 31536000 });
    res.send(renderToHTML(App, {
      env,
      jsSrc,
      cssSrc,
      preferredLocale: _preferredLocale,
      location: req.path,
      resources: await resources?.(req),
    }));
  });

  return router;
}