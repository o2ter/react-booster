//
//  index.tsx
//
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { Text, View } from '@o2ter/react-ui';

import Localization from '../../i18n/ErrorPage';

export default function ErrorPage() {

  const { string: t } = Localization.useLocalize();

  return (
    <View classes='align-items-center justify-content-center' style={{ flex: 1 }}>
      <Text classes='fs-3 fw-bold'>{t('ErrorMessage')}</Text>
    </View>
  );
}
