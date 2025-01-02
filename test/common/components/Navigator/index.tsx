//
//  index.tsx
//
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { ErrorBoundary, Navigator as _Navigator, Route } from '@o2ter/react-ui';
import NotFound from './pages/NotFound';
import ErrorPage from './pages/ErrorPage';
import { useStableCallback } from 'sugax';

type NavigatorProps = {
  pages?: React.ComponentPropsWithoutRef<typeof Route>[];
  onError?: (error: Error, info: React.ErrorInfo) => void;
};

const withError = (
  Component: any,
  onError?: (error: Error, info: React.ErrorInfo) => void,
) => () => (
  <ErrorBoundary onError={onError} fallback={(error) => <ErrorPage />}>
    <Component />
  </ErrorBoundary>
);

export const Navigator: React.FC<NavigatorProps> = ({
  pages,
  onError,
}) => {
  const id = React.useId();
  const _onError = useStableCallback(onError ?? (() => { }));
  const mapping = React.useMemo(() => new WeakMap<any, () => React.JSX.Element>(), []);
  const _withError = (component: any) => {
    if (!mapping.has(component)) mapping.set(component, withError(component, _onError));
    return mapping.get(component)!;
  }
  return (
    <_Navigator>
      {pages?.map(({ path, component, ...props }) => (
        <Route key={`${id}-${path}`} path={path} component={_withError(component)} {...props} />
      ))}
      {!_.some(pages, p => p.path === '*') && (
        <Route path='*' title='404 Not Found' statusCode={404} component={NotFound} />
      )}
    </_Navigator>
  );
};

Navigator.displayName = 'Navigator';
