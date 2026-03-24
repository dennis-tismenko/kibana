/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiButton, EuiLink, EuiSpacer } from '@elastic/eui';
import type { FC, PropsWithChildren } from 'react';
import React from 'react';

import { FormattedMessage } from '@kbn/i18n-react';
import { KibanaPageTemplate } from '@kbn/shared-ux-page-kibana-template';

export interface ApplicationConnectionsEmptyPromptProps {
  error?: Error;
}

export const ApplicationConnectionsEmptyPrompt: FC<
  PropsWithChildren<ApplicationConnectionsEmptyPromptProps>
> = ({ error, children }) => {
  if (error) {
    return (
      <KibanaPageTemplate.EmptyPrompt
        iconType="warning"
        body={
          <p>
            <FormattedMessage
              id="xpack.security.management.applicationConnections.emptyPrompt.errorMessage"
              defaultMessage="Could not load application connections."
            />
          </p>
        }
        actions={children}
      />
    );
  }

  return (
    <KibanaPageTemplate.EmptyPrompt
      iconType="logoElastic"
      title={
        <h1>
          <FormattedMessage
            id="xpack.security.management.applicationConnections.emptyPrompt.title"
            defaultMessage="No MCP client (OAuth)"
          />
        </h1>
      }
      body={
        <p>
          <FormattedMessage
            id="xpack.security.management.applicationConnections.emptyPrompt.description"
            defaultMessage="Get started with MCP clients (OAuth)."
          />
        </p>
      }
      actions={
        <>
          <EuiButton fill data-test-subj="addMcpClientButton">
            <FormattedMessage
              id="xpack.security.management.applicationConnections.emptyPrompt.addButton"
              defaultMessage="Add MCP client (OAuth)"
            />
          </EuiButton>
          <EuiSpacer size="s" />
          <EuiLink external>
            <FormattedMessage
              id="xpack.security.management.applicationConnections.emptyPrompt.learnMore"
              defaultMessage="Learn more"
            />
          </EuiLink>
        </>
      }
    />
  );
};

export const ApplicationConnectionsEmptyTablePrompt: FC = () => (
  <div>
    <EuiSpacer size="xxl" />
    <KibanaPageTemplate.EmptyPrompt
      iconType="logoElastic"
      title={
        <h2>
          <FormattedMessage
            id="xpack.security.management.applicationConnections.emptyTablePrompt.title"
            defaultMessage="No MCP client (OAuth)"
          />
        </h2>
      }
      body={
        <p>
          <FormattedMessage
            id="xpack.security.management.applicationConnections.emptyTablePrompt.description"
            defaultMessage="Get started with MCP clients (OAuth)."
          />
        </p>
      }
      actions={
        <>
          <EuiButton fill data-test-subj="addMcpClientButton">
            <FormattedMessage
              id="xpack.security.management.applicationConnections.emptyTablePrompt.addButton"
              defaultMessage="Add MCP client (OAuth)"
            />
          </EuiButton>
          <EuiSpacer size="s" />
          <EuiLink external>
            <FormattedMessage
              id="xpack.security.management.applicationConnections.emptyTablePrompt.learnMore"
              defaultMessage="Learn more"
            />
          </EuiLink>
        </>
      }
    />
    <EuiSpacer size="xxl" />
  </div>
);
