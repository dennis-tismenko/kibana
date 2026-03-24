/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { History } from 'history';
import type { FC, PropsWithChildren } from 'react';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import type { CoreStart, StartServicesAccessor } from '@kbn/core/public';
import { i18n } from '@kbn/i18n';
import { KibanaContextProvider } from '@kbn/kibana-react-plugin/public';
import type { RegisterManagementAppArgs } from '@kbn/management-plugin/public';
import type { AuthenticationServiceSetup } from '@kbn/security-plugin-types-public';
import { Router } from '@kbn/shared-ux-router';

import type { BreadcrumbsChangeHandler } from '../../components/breadcrumb';
import {
  Breadcrumb,
  BreadcrumbsProvider,
  createBreadcrumbsChangeHandler,
} from '../../components/breadcrumb';
import { AuthenticationProvider } from '../../components/use_current_user';
import type { PluginStartDependencies } from '../../plugin';
import { ReadonlyBadge } from '../badges/readonly_badge';

interface CreateParams {
  authc: AuthenticationServiceSetup;
  getStartServices: StartServicesAccessor<PluginStartDependencies>;
}

export const applicationConnectionsManagementApp = Object.freeze({
  id: 'application_connections',
  create({ authc, getStartServices }: CreateParams) {
    return {
      id: this.id,
      order: 35,
      title: i18n.translate('xpack.security.management.applicationConnectionsTitle', {
        defaultMessage: 'Application connections',
      }),
      async mount({ element, setBreadcrumbs, history }) {
        const [[coreStart], { ApplicationConnectionsGridPage }] = await Promise.all([
          getStartServices(),
          import('./application_connections_grid/application_connections_grid_page'),
        ]);

        render(
          coreStart.rendering.addContext(
            <Providers
              services={coreStart}
              history={history}
              authc={authc}
              onChange={createBreadcrumbsChangeHandler(coreStart.chrome, setBreadcrumbs)}
            >
              <Breadcrumb
                text={i18n.translate('xpack.security.management.applicationConnectionsTitle', {
                  defaultMessage: 'Application connections',
                })}
                href="/"
              >
                <ApplicationConnectionsGridPage />
              </Breadcrumb>
            </Providers>
          ),
          element
        );

        return () => {
          unmountComponentAtNode(element);
        };
      },
    } as RegisterManagementAppArgs;
  },
});

export interface ProvidersProps {
  services: CoreStart;
  history: History;
  authc: AuthenticationServiceSetup;
  onChange?: BreadcrumbsChangeHandler;
}

export const Providers: FC<PropsWithChildren<ProvidersProps>> = ({
  services,
  history,
  authc,
  onChange,
  children,
}) => (
  <KibanaContextProvider services={services}>
    <AuthenticationProvider authc={authc}>
      <Router history={history}>
        <ReadonlyBadge
          featureId="application_connections"
          tooltip={i18n.translate(
            'xpack.security.management.applicationConnections.readonlyTooltip',
            {
              defaultMessage: 'Unable to manage application connections',
            }
          )}
        />
        <BreadcrumbsProvider onChange={onChange}>{children}</BreadcrumbsProvider>
      </Router>
    </AuthenticationProvider>
  </KibanaContextProvider>
);
