//
//  index.ts
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
import type { Request } from 'express';
import { ServerResourceContext } from './context';
import { Awaitable } from 'sugax';
import { TSerializable } from 'proto.io';
import { isPromiseLike } from '../../utils';

export const useServerResource = <T extends NonNullable<TSerializable>>(
  key: string,
  callback: (request: Request) => Awaitable<T>,
): T | undefined => {
  const { request, resource } = React.useContext(ServerResourceContext);
  if (_.isNil(resource[key])) {
    const result = callback(request!);
    resource[key] = isPromiseLike(result) ? Promise.resolve(result) : result;
  }
  if (isPromiseLike(resource[key])) return;
  return resource[key];
}