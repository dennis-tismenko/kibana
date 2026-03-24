/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EuiBasicTableColumn, EuiSelectableOption } from '@elastic/eui';
import {
  EuiBasicTable,
  EuiButton,
  EuiFieldSearch,
  EuiFilterButton,
  EuiFilterGroup,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiPopover,
  EuiSelectable,
  EuiSpacer,
} from '@elastic/eui';
import type { FunctionComponent } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';

import type { CoreStart } from '@kbn/core/public';
import { SectionLoading } from '@kbn/es-ui-shared-plugin/public';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import { KibanaPageTemplate } from '@kbn/shared-ux-page-kibana-template';

import {
  ApplicationConnectionsEmptyPrompt,
  ApplicationConnectionsEmptyTablePrompt,
} from './application_connections_empty_prompt';
import { CreatorConnectionsTable } from './creator_connections_table';
import { RevokeConnectionProvider } from './revoke_connection_provider';
import { UserConnectionsTable } from './user_connections_table';
import { OAuthConnectionsAPIClient } from '../oauth_connections_api_client';
import type { ConnectionStatus, OAuthClientResponse, OAuthConnectionResponse } from '../types';
import { getConnectionStatus } from '../types';

type ViewMode = 'creator' | 'user' | 'empty';

const STATUS_OPTIONS: ConnectionStatus[] = ['active', 'revoked'];

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  active: i18n.translate('xpack.security.management.applicationConnections.filter.active', {
    defaultMessage: 'Active',
  }),
  revoked: i18n.translate('xpack.security.management.applicationConnections.filter.revoked', {
    defaultMessage: 'Revoked',
  }),
};

interface EmptyTableRow {
  id: string;
}

const EMPTY_TABLE_COLUMNS: Array<EuiBasicTableColumn<EmptyTableRow>> = [
  {
    field: 'clientName',
    name: i18n.translate('xpack.security.management.applicationConnections.emptyTable.clientName', {
      defaultMessage: 'Client name',
    }),
    sortable: true,
  },
  {
    field: 'connectedBy',
    name: i18n.translate(
      'xpack.security.management.applicationConnections.emptyTable.connectedBy',
      { defaultMessage: 'Connected by' }
    ),
    sortable: true,
  },
  {
    field: 'status',
    name: i18n.translate('xpack.security.management.applicationConnections.emptyTable.status', {
      defaultMessage: 'Status',
    }),
    sortable: true,
  },
  {
    field: 'actions',
    name: i18n.translate('xpack.security.management.applicationConnections.emptyTable.actions', {
      defaultMessage: 'Actions',
    }),
  },
];

export const ApplicationConnectionsGridPage: FunctionComponent = () => {
  const { services } = useKibana<CoreStart>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConnectionStatus | undefined>();
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);

  const apiClient = useMemo(() => new OAuthConnectionsAPIClient(services.http), [services.http]);

  const [state, fetchData] = useAsyncFn(async () => {
    const [clientsResult, connectionsResult] = await Promise.allSettled([
      apiClient.listClients(),
      apiClient.listConnections(),
    ]);
    return {
      clients: clientsResult.status === 'fulfilled' ? clientsResult.value.clients : [],
      connections:
        connectionsResult.status === 'fulfilled' ? connectionsResult.value.connections : [],
    };
  }, [apiClient]);

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  if (!state.value) {
    if (state.loading) {
      return (
        <SectionLoading>
          <FormattedMessage
            id="xpack.security.management.applicationConnections.loadingDescription"
            defaultMessage="Loading application connections..."
          />
        </SectionLoading>
      );
    }

    return (
      <ApplicationConnectionsEmptyPrompt error={state.error}>
        <EuiButton iconType="refresh" onClick={refreshData}>
          <FormattedMessage
            id="xpack.security.management.applicationConnections.retryButton"
            defaultMessage="Try again"
          />
        </EuiButton>
      </ApplicationConnectionsEmptyPrompt>
    );
  }

  const { clients, connections } = state.value;

  const viewMode: ViewMode =
    clients.length > 0 ? 'creator' : connections.length > 0 ? 'user' : 'empty';

  const filteredConnections = filterConnections(connections, searchQuery, statusFilter, clients);
  const filteredClients = filterClients(clients, filteredConnections);

  const statusSelectableOptions: EuiSelectableOption[] = [
    {
      label: i18n.translate('xpack.security.management.applicationConnections.filter.allStatuses', {
        defaultMessage: 'All statuses',
      }),
      checked: statusFilter === undefined ? ('on' as const) : undefined,
    },
    ...STATUS_OPTIONS.map<EuiSelectableOption>((s) => ({
      label: STATUS_LABELS[s],
      checked: statusFilter === s ? ('on' as const) : undefined,
    })),
  ];

  const onStatusFilterChange = (options: EuiSelectableOption[]) => {
    const selected = options.find((opt) => opt.checked === 'on');
    if (!selected || selected.label === statusSelectableOptions[0].label) {
      setStatusFilter(undefined);
    } else {
      const match = STATUS_OPTIONS.find((s) => STATUS_LABELS[s] === selected.label);
      setStatusFilter(match);
    }
    setIsStatusPopoverOpen(false);
  };

  return (
    <>
      <KibanaPageTemplate.Header
        pageTitle={
          <FormattedMessage
            id="xpack.security.management.applicationConnections.title"
            defaultMessage="Application connections"
          />
        }
        description={
          <FormattedMessage
            id="xpack.security.management.applicationConnections.description"
            defaultMessage="Manage connections for OAuth-based applications. Currently, only MCP clients are supported. {manageClientsLink}"
            values={{
              manageClientsLink: (
                <EuiLink disabled>
                  <FormattedMessage
                    id="xpack.security.management.applicationConnections.manageClientsLink"
                    defaultMessage="Manage MCP clients"
                  />
                </EuiLink>
              ),
            }}
          />
        }
        paddingSize="none"
        bottomBorder
      />
      <EuiSpacer />
      <KibanaPageTemplate.Section paddingSize="none">
        <EuiFlexGroup gutterSize="m" alignItems="center">
          <EuiFlexItem>
            <EuiFieldSearch
              placeholder={i18n.translate(
                'xpack.security.management.applicationConnections.searchPlaceholder',
                { defaultMessage: 'Search' }
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              isClearable
              fullWidth
              data-test-subj="applicationConnectionsSearch"
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFilterGroup>
              <EuiPopover
                aria-label={i18n.translate(
                  'xpack.security.management.applicationConnections.filter.statusPopoverAriaLabel',
                  { defaultMessage: 'Filter by status' }
                )}
                button={
                  <EuiFilterButton
                    iconType="arrowDown"
                    onClick={() => setIsStatusPopoverOpen(!isStatusPopoverOpen)}
                    isSelected={isStatusPopoverOpen}
                    hasActiveFilters={statusFilter !== undefined}
                    data-test-subj="applicationConnectionsStatusFilter"
                  >
                    {i18n.translate(
                      'xpack.security.management.applicationConnections.filter.statusLabel',
                      { defaultMessage: 'Status' }
                    )}
                  </EuiFilterButton>
                }
                isOpen={isStatusPopoverOpen}
                closePopover={() => setIsStatusPopoverOpen(false)}
                panelPaddingSize="none"
              >
                <EuiSelectable
                  options={statusSelectableOptions}
                  singleSelection
                  onChange={onStatusFilterChange}
                >
                  {(list) => <div style={{ width: 200 }}>{list}</div>}
                </EuiSelectable>
              </EuiPopover>
            </EuiFilterGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
        {viewMode === 'empty' ? (
          <EuiBasicTable<EmptyTableRow>
            items={[]}
            itemId="id"
            columns={EMPTY_TABLE_COLUMNS}
            noItemsMessage={<ApplicationConnectionsEmptyTablePrompt />}
            tableCaption={i18n.translate(
              'xpack.security.management.applicationConnections.emptyTable.caption',
              { defaultMessage: 'Application connections list' }
            )}
          />
        ) : (
          <RevokeConnectionProvider notifications={services.notifications} apiClient={apiClient}>
            {(revokeConnections) =>
              viewMode === 'creator' ? (
                <CreatorConnectionsTable
                  clients={filteredClients}
                  connections={filteredConnections}
                  onRevoke={(conns, onSuccess) =>
                    revokeConnections(conns, () => {
                      onSuccess?.();
                      refreshData();
                    })
                  }
                  loading={state.loading}
                />
              ) : (
                <UserConnectionsTable
                  clients={filteredClients}
                  connections={filteredConnections}
                  onRevoke={(conns, onSuccess) =>
                    revokeConnections(conns, () => {
                      onSuccess?.();
                      refreshData();
                    })
                  }
                  loading={state.loading}
                />
              )
            }
          </RevokeConnectionProvider>
        )}
      </KibanaPageTemplate.Section>
    </>
  );
};

const filterConnections = (
  connections: OAuthConnectionResponse[],
  searchQuery: string,
  statusFilter: ConnectionStatus | undefined,
  clients: OAuthClientResponse[]
): OAuthConnectionResponse[] => {
  const clientNameMap = new Map<string, string>();
  for (const client of clients) {
    clientNameMap.set(client.id, client.client_name ?? client.id);
  }

  const query = searchQuery.toLowerCase().trim();

  return connections.filter((conn) => {
    if (statusFilter && getConnectionStatus(conn) !== statusFilter) {
      return false;
    }

    if (query) {
      const clientName = (clientNameMap.get(conn.client_id) ?? conn.client_id).toLowerCase();
      const connId = conn.id.toLowerCase();
      const resource = conn.resource.toLowerCase();
      if (!clientName.includes(query) && !connId.includes(query) && !resource.includes(query)) {
        return false;
      }
    }

    return true;
  });
};

const filterClients = (
  clients: OAuthClientResponse[],
  filteredConnections: OAuthConnectionResponse[]
): OAuthClientResponse[] => {
  const clientIdsWithConnections = new Set(filteredConnections.map((c) => c.client_id));
  return clients.filter(
    (client) => clientIdsWithConnections.has(client.id) || filteredConnections.length === 0
  );
};
