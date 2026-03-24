/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Criteria, EuiBasicTableColumn } from '@elastic/eui';
import {
  EuiAvatar,
  EuiBadge,
  EuiBasicTable,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
} from '@elastic/eui';
import React, { useCallback, useMemo, useState } from 'react';

import { i18n } from '@kbn/i18n';

import { ConnectionStatusIndicator } from './connection_status';
import type { RevokeConnections } from './revoke_connection_provider';
import type { OAuthClientResponse, OAuthConnectionResponse } from '../types';
import { getConnectionStatus } from '../types';

interface ClientRow {
  id: string;
  client_name: string;
  connections: OAuthConnectionResponse[];
}

interface Props {
  clients: OAuthClientResponse[];
  connections: OAuthConnectionResponse[];
  onRevoke: RevokeConnections;
  loading: boolean;
}

const buildClientRows = (
  clients: OAuthClientResponse[],
  connections: OAuthConnectionResponse[]
): ClientRow[] => {
  const connectionsByClient = new Map<string, OAuthConnectionResponse[]>();
  for (const conn of connections) {
    const existing = connectionsByClient.get(conn.client_id) ?? [];
    existing.push(conn);
    connectionsByClient.set(conn.client_id, existing);
  }

  return clients.map((client) => ({
    id: client.id,
    client_name: client.client_name ?? client.id,
    connections: connectionsByClient.get(client.id) ?? [],
  }));
};

export const CreatorConnectionsTable: React.FC<Props> = ({
  clients,
  connections,
  onRevoke,
  loading,
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedConnections, setSelectedConnections] = useState<OAuthConnectionResponse[]>([]);

  const clientRows = useMemo(() => buildClientRows(clients, connections), [clients, connections]);

  const toggleExpand = useCallback((clientId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  }, []);

  const connectionColumns: Array<EuiBasicTableColumn<OAuthConnectionResponse>> = useMemo(
    () => [
      {
        field: 'id',
        name: i18n.translate(
          'xpack.security.management.applicationConnections.creatorTable.connectionName',
          { defaultMessage: 'Connection name' }
        ),
        sortable: true,
      },
      {
        field: 'resource',
        name: i18n.translate(
          'xpack.security.management.applicationConnections.creatorTable.connectedBy',
          { defaultMessage: 'Connected by' }
        ),
        sortable: true,
        render: (resource: string) => (
          <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
            <EuiFlexItem grow={false}>
              <EuiAvatar name={resource} size="s" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>{resource}</EuiFlexItem>
          </EuiFlexGroup>
        ),
      },
      {
        field: 'revoked',
        name: i18n.translate(
          'xpack.security.management.applicationConnections.creatorTable.status',
          { defaultMessage: 'Status' }
        ),
        render: (_revoked: boolean | undefined, conn: OAuthConnectionResponse) => (
          <ConnectionStatusIndicator status={getConnectionStatus(conn)} />
        ),
      },
      {
        name: i18n.translate(
          'xpack.security.management.applicationConnections.creatorTable.actions',
          { defaultMessage: 'Actions' }
        ),
        actions: [
          {
            render: (conn: OAuthConnectionResponse) => (
              <EuiButtonEmpty
                size="s"
                color="danger"
                onClick={() => onRevoke([conn])}
                data-test-subj={`revokeConnectionButton-${conn.id}`}
              >
                {i18n.translate(
                  'xpack.security.management.applicationConnections.creatorTable.revokeAction',
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

  const itemIdToExpandedRowMap = useMemo(() => {
    const map: Record<string, React.ReactNode> = {};
    for (const row of clientRows) {
      if (expandedRows[row.id]) {
        map[row.id] = (
          <EuiBasicTable<OAuthConnectionResponse>
            items={row.connections}
            itemId="id"
            columns={connectionColumns}
            selection={{
              onSelectionChange: setSelectedConnections,
            }}
            tableCaption={i18n.translate(
              'xpack.security.management.applicationConnections.creatorTable.connectionsCaption',
              {
                defaultMessage: 'Connections for {clientName}',
                values: { clientName: row.client_name },
              }
            )}
          />
        );
      }
    }
    return map;
  }, [clientRows, expandedRows, connectionColumns]);

  const clientColumns: Array<EuiBasicTableColumn<ClientRow>> = useMemo(
    () => [
      {
        field: 'id',
        width: '40px',
        name: '',
        render: (_id: string, row: ClientRow) => (
          <EuiButtonIcon
            onClick={() => toggleExpand(row.id)}
            aria-label={expandedRows[row.id] ? 'Collapse' : 'Expand'}
            iconType={expandedRows[row.id] ? 'arrowDown' : 'arrowRight'}
          />
        ),
      },
      {
        field: 'client_name',
        name: i18n.translate(
          'xpack.security.management.applicationConnections.creatorTable.clientName',
          { defaultMessage: 'MCP client name' }
        ),
        sortable: true,
        render: (clientName: string) => <EuiLink>{clientName}</EuiLink>,
      },
      {
        field: 'connections',
        name: i18n.translate(
          'xpack.security.management.applicationConnections.creatorTable.connections',
          { defaultMessage: 'Connections' }
        ),
        render: (conns: OAuthConnectionResponse[]) => <EuiBadge>{conns.length}</EuiBadge>,
      },
    ],
    [expandedRows, toggleExpand]
  );

  const onTableChange = ({ sort }: Criteria<ClientRow>) => {
    // Sorting is handled in-memory for now
  };

  return (
    <>
      {selectedConnections.length > 0 && (
        <>
          <EuiFlexGroup gutterSize="s" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                color="danger"
                iconType="trash"
                onClick={() => onRevoke(selectedConnections, () => setSelectedConnections([]))}
                data-test-subj="bulkRevokeConnectionsButton"
              >
                {i18n.translate(
                  'xpack.security.management.applicationConnections.creatorTable.bulkRevoke',
                  {
                    defaultMessage:
                      'Revoke {count} {count, plural, one {connection} other {connections}}',
                    values: { count: selectedConnections.length },
                  }
                )}
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="s" />
        </>
      )}
      <EuiBasicTable<ClientRow>
        items={clientRows}
        itemId="id"
        columns={clientColumns}
        loading={loading}
        itemIdToExpandedRowMap={itemIdToExpandedRowMap}
        onChange={onTableChange}
        tableCaption={i18n.translate(
          'xpack.security.management.applicationConnections.creatorTable.caption',
          { defaultMessage: 'Application connections list' }
        )}
      />
    </>
  );
};
