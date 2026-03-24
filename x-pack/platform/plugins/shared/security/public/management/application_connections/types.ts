/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export interface OAuthClientResponse {
  id: string;
  client_name?: string;
  resource: string;
  type?: string;
  creation?: string;
  revoked?: boolean;
  revocation?: string;
  revocation_reason?: string;
  client_metadata?: Record<string, string>;
  connections?: { active?: string[]; revoked?: string[] };
}

export interface OAuthConnectionResponse {
  id: string;
  client_id: string;
  resource: string;
  creation?: string;
  revoked?: boolean;
  revocation?: string;
  revocation_reason?: string;
  scopes?: string[];
}

export type ConnectionStatus = 'active' | 'revoked';

export const getConnectionStatus = (connection: OAuthConnectionResponse): ConnectionStatus => {
  if (connection.revoked) {
    return 'revoked';
  }
  return 'active';
};
