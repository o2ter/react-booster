//
//  index.js
//
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { View } from '@o2ter/react-ui';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout = ({
  children
}) => {
  return (
    <>
      <Header />
      <View style={{ marginBottom: 'auto' }}>{children}</View>
      <Footer />
    </>
  );
}

export default Layout;