/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiHealth } from '@elastic/eui';
import React from 'react';

import { i18n } from '@kbn/i18n';

import type { ConnectionStatus } from '../types';

const STATUS_CONFIG: Record<ConnectionStatus, { color: string; label: string }> = {
  active: {
    color: 'success',
    label: i18n.translate('xpack.security.management.applicationConnections.status.active', {
      defaultMessage: 'Active',
    }),
  },
  revoked: {
    color: 'danger',
    label: i18n.translate('xpack.security.management.applicationConnections.status.revoked', {
      defaultMessage: 'Revoked',
    }),
  },
};

export const ConnectionStatusIndicator: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return <EuiHealth color={config.color}>{config.label}</EuiHealth>;
};
