//
//  index.js
//
//  Copyright (c) 2021 - 2024 O2ter Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { Route } from '@o2ter/react-ui';
import { useLocalize } from '@o2ter/i18n';

import Home from './pages/Home';

type Routes = React.ComponentPropsWithoutRef<typeof Route>[];

export const useRoutes = (): Routes => {
  const t = useLocalize();
  return [
    {
      path: '/',
      title: t({
        'en': 'Home',
      }),
      component: Home,
    },
  ];
}