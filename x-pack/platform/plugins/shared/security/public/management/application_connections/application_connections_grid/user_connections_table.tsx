/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EuiBasicTableColumn } from '@elastic/eui';
import {
  EuiBasicTable,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
} from '@elastic/eui';
import React, { useMemo, useState } from 'react';

import { i18n } from '@kbn/i18n';

import { ConnectionStatusIndicator } from './connection_status';
import type { RevokeConnections } from './revoke_connection_provider';
import type { OAuthClientResponse, OAuthConnectionResponse } from '../types';
import { getConnectionStatus } from '../types';

interface UserConnectionRow {
  id: string;
  connectionId: string;
  clientId: string;
  clientName: string;
  revoked: boolean | undefined;
  connection: OAuthConnectionResponse;
}

interface Props {
  clients: OAuthClientResponse[];
  connections: OAuthConnectionResponse[];
  onRevoke: RevokeConnections;
  loading: boolean;
}

const buildUserRows = (
  clients: OAuthClientResponse[],
  connections: OAuthConnectionResponse[]
): UserConnectionRow[] => {
  const clientMap = new Map<string, OAuthClientResponse>();
  for (const client of clients) {
    clientMap.set(client.id, client);
  }

  return connections.map((conn) => {
    const client = clientMap.get(conn.client_id);
    return {
      id: conn.id,
      connectionId: conn.id,
      clientId: conn.client_id,
      clientName: client?.client_name ?? conn.client_id,
      revoked: conn.revoked,
      connection: conn,
    };
  });
};

export const UserConnectionsTable: React.FC<Props> = ({
  clients,
  connections,
  onRevoke,
  loading,
}) => {
  const [selectedItems, setSelectedItems] = useState<UserConnectionRow[]>([]);

  const rows = useMemo(() => buildUserRows(clients, connections), [clients, connections]);

  const columns: Array<EuiBasicTableColumn<UserConnectionRow>> = useMemo(
    () => [
      {
        field: 'clientName',
        name: i18n.translate(
          'xpack.security.management.applicationConnections.userTable.clientName',
          { defaultMessage: 'MCP client name' }
        ),
        sortable: true,
        render: (clientName: string) => <EuiLink>{clientName}</EuiLink>,
      },
      {
        field: 'revoked',
        name: i18n.translate('xpack.security.management.applicationConnections.userTable.status', {
          defaultMessage: 'Status',
        }),
        render: (_revoked: boolean | undefined, row: UserConnectionRow) => (
          <ConnectionStatusIndicator status={getConnectionStatus(row.connection)} />
        ),
      },
      {
        name: i18n.translate('xpack.security.management.applicationConnections.userTable.actions', {
          defaultMessage: 'Actions',
        }),
        actions: [
          {
            render: (row: UserConnectionRow) => (
              <EuiButtonEmpty
                size="s"
                color="danger"
                onClick={() => onRevoke([row.connection])}
                data-test-subj={`revokeConnectionButton-${row.id}`}
              >
                {i18n.translate(
                  'xpack.security.management.applicationConnections.userTable.revokeAction',
                  { defaultMessage: 'Revoke connection' }
                )}
              </EuiButtonEmpty>
            ),
          },
        ],
      },
    ],
    [onRevoke]
  );

  return (
    <>
      {selectedItems.length > 0 && (
        <>
          <EuiFlexGroup gutterSize="s" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                color="danger"
                iconType="trash"
                onClick={() =>
                  onRevoke(
                    selectedItems.map((item) => item.connection),
                    () => setSelectedItems([])
                  )
                }
                data-test-subj="bulkRevokeConnectionsButton"
              >
                {i18n.translate(
                  'xpack.security.management.applicationConnections.userTable.bulkRevoke',
                  {
                    defaultMessage:
                      'Revoke {count} {count, plural, one {connection} other {connections}}',
                    values: { count: selectedItems.length },
                  }
                )}
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="s" />
        </>
      )}
      <EuiBasicTable<UserConnectionRow>
        items={rows}
        itemId="id"
        columns={columns}
        loading={loading}
        selection={{
          onSelectionChange: setSelectedItems,
        }}
        tableCaption={i18n.translate(
          'xpack.security.management.applicationConnections.userTable.caption',
          { defaultMessage: 'Application connections list' }
        )}
      />
    </>
  );
};
