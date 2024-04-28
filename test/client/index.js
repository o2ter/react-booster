//
//  index.js
//
//  Copyright (c) 2021 - 2024 O2ter Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { ProviderChain } from '~/common/components/ProviderChain';
import { StyleProvider } from './style';
import { Navigator } from '~/common/components/Navigator';
import { Layout } from './layout';
import { useRoutes } from './routes';
import './css/main.scss';

const App = () => (
  <Layout>
    <Navigator pages={useRoutes()} />
  </Layout>
);

const appProviders = [
  StyleProvider,
];

export default () => <ProviderChain providers={appProviders}><App /></ProviderChain>;