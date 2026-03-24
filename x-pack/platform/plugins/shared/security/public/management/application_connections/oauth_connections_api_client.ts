/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { HttpStart } from '@kbn/core/public';

import type { OAuthClientResponse, OAuthConnectionResponse } from './types';

const oauthBaseUrl = '/internal/security/oauth';

export class OAuthConnectionsAPIClient {
  constructor(private readonly http: HttpStart) {}

  public async listClients(clientId?: string) {
    return await this.http.get<{ clients: OAuthClientResponse[] }>(`${oauthBaseUrl}/clients`, {
      query: clientId ? { client_id: clientId } : undefined,
    });
  }

  public async listConnections(clientId?: string, connectionId?: string) {
    const query: Record<string, string> = {};
    if (clientId) {
      query.client_id = clientId;
    }
    if (connectionId) {
      query.connection_id = connectionId;
    }

    return await this.http.get<{ connections: OAuthConnectionResponse[] }>(
      `${oauthBaseUrl}/connections`,
      {
        query: Object.keys(query).length > 0 ? query : undefined,
      }
    );
  }

  public async revokeConnection(clientId: string, connectionId: string, reason?: string) {
    return await this.http.post<OAuthConnectionResponse>(
      `${oauthBaseUrl}/clients/${encodeURIComponent(clientId)}/connections/${encodeURIComponent(
        connectionId
      )}/_revoke`,
      {
        body: JSON.stringify({ reason }),
      }
    );
  }
}
