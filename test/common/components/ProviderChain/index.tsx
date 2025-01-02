//
//  index.tsx
//
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';

type ProviderChainProps = React.PropsWithChildren<{
  providers?: React.ComponentType<React.PropsWithChildren>[];
}>;

export const ProviderChain: React.FC<ProviderChainProps> = ({
  providers = [],
  children,
}) => _.reduceRight(providers, (children, Provider) => <Provider>{children}</Provider>, children);