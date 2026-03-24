/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiConfirmModal, useGeneratedHtmlId } from '@elastic/eui';
import React, { Fragment, useRef, useState } from 'react';

import type { NotificationsStart } from '@kbn/core/public';
import { i18n } from '@kbn/i18n';

import type { OAuthConnectionsAPIClient } from '../oauth_connections_api_client';
import type { OAuthConnectionResponse } from '../types';

export type RevokeConnections = (
  connections: OAuthConnectionResponse[],
  onSuccess?: () => void
) => void;

interface Props {
  children: (revokeConnections: RevokeConnections) => React.ReactElement;
  notifications: NotificationsStart;
  apiClient: OAuthConnectionsAPIClient;
}

export const RevokeConnectionProvider: React.FunctionComponent<Props> = ({
  children,
  notifications,
  apiClient,
}) => {
  const [connections, setConnections] = useState<OAuthConnectionResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const onSuccessCallback = useRef<(() => void) | null>(null);
  const modalTitleId = useGeneratedHtmlId();

  const revokeConnectionPrompt: RevokeConnections = (conns, onSuccess) => {
    if (!conns || conns.length === 0) {
      return;
    }
    setIsModalOpen(true);
    setConnections(conns);
    onSuccessCallback.current = onSuccess ?? null;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setConnections([]);
  };

  const revokeSelectedConnections = async () => {
    const errors: Array<{ id: string; error: Error }> = [];
    const successes: string[] = [];

    await Promise.all(
      connections.map(async (conn) => {
        try {
          await apiClient.revokeConnection(conn.client_id, conn.id);
          successes.push(conn.id);
        } catch (e) {
          errors.push({ id: conn.id, error: e });
        }
      })
    );

    closeModal();

    if (successes.length > 0) {
      const successMessage =
        successes.length === 1
          ? i18n.translate(
              'xpack.security.management.applicationConnections.revokeConnection.successSingle',
              {
                defaultMessage: 'Revoked 1 connection',
              }
            )
          : i18n.translate(
              'xpack.security.management.applicationConnections.revokeConnection.successMultiple',
              {
                defaultMessage: 'Revoked {count} connections',
                values: { count: successes.length },
              }
            );
      notifications.toasts.addSuccess(successMessage);
      onSuccessCallback.current?.();
    }

    if (errors.length > 0) {
      const errorMessage =
        errors.length === 1
          ? i18n.translate(
              'xpack.security.management.applicationConnections.revokeConnection.errorSingle',
              {
                defaultMessage: 'Error revoking connection',
              }
            )
          : i18n.translate(
              'xpack.security.management.applicationConnections.revokeConnection.errorMultiple',
              {
                defaultMessage: 'Error revoking {count} connections',
                values: { count: errors.length },
              }
            );
      notifications.toasts.addDanger(errorMessage);
    }
  };

  const renderModal = () => {
    if (!isModalOpen) {
      return null;
    }

    const isSingle = connections.length === 1;

    return (
      <EuiConfirmModal
        role="dialog"
        aria-labelledby={modalTitleId}
        title={
          isSingle
            ? i18n.translate(
                'xpack.security.management.applicationConnections.revokeConnection.confirmSingleTitle',
                {
                  defaultMessage: 'Revoke connection?',
                }
              )
            : i18n.translate(
                'xpack.security.management.applicationConnections.revokeConnection.confirmMultipleTitle',
                {
                  defaultMessage: 'Revoke {count} connections?',
                  values: { count: connections.length },
                }
              )
        }
        titleProps={{ id: modalTitleId }}
        onCancel={closeModal}
        onConfirm={revokeSelectedConnections}
        cancelButtonText={i18n.translate(
          'xpack.security.management.applicationConnections.revokeConnection.cancelButton',
          { defaultMessage: 'Cancel' }
        )}
        confirmButtonText={i18n.translate(
          'xpack.security.management.applicationConnections.revokeConnection.confirmButton',
          {
            defaultMessage: 'Revoke {count, plural, one {connection} other {connections}}',
            values: { count: connections.length },
          }
        )}
        buttonColor="danger"
        data-test-subj="revokeConnectionConfirmationModal"
      >
        {!isSingle && (
          <>
            <p>
              {i18n.translate(
                'xpack.security.management.applicationConnections.revokeConnection.confirmMultipleDescription',
                {
                  defaultMessage: 'You are about to revoke these connections:',
                }
              )}
            </p>
            <ul>
              {connections.map((conn) => (
                <li key={conn.id}>{conn.id}</li>
              ))}
            </ul>
          </>
        )}
      </EuiConfirmModal>
    );
  };

  return (
    <Fragment>
      {children(revokeConnectionPrompt)}
      {renderModal()}
    </Fragment>
  );
};
