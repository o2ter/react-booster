//
//  style.tsx
//
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { StyleProvider as _StyleProvider, useTheme, useMediaSelect } from '@o2ter/react-ui';

type Classes = React.ComponentProps<typeof _StyleProvider>['classes'];

const classes = (
  theme: ReturnType<typeof useTheme>,
  mediaSelect: ReturnType<typeof useMediaSelect>,
): Classes => ({
});

export const StyleProvider = ({
  children
}: React.PropsWithChildren<{}>) => (
  <_StyleProvider classes={classes(useTheme(), useMediaSelect())}>
    {children}
  </_StyleProvider>
);