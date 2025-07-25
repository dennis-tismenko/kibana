/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiButton,
  EuiConfirmModal,
  EuiCallOut,
  EuiSpacer,
  useGeneratedHtmlId,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { i18n } from '@kbn/i18n';
import { ActionTypeExecutorResult, isActionTypeExecutorResult } from '@kbn/actions-plugin/common';
import { Option, none, some } from 'fp-ts/Option';
import { ReadOnlyConnectorMessage } from './read_only';
import {
  ActionConnector,
  ActionTypeModel,
  ActionTypeRegistryContract,
  EditConnectorTabs,
  UserConfiguredActionConnector,
} from '../../../../types';
import { ConnectorForm, ConnectorFormState } from '../connector_form';
import type { ConnectorFormSchema } from '../types';
import { useUpdateConnector } from '../../../hooks/use_edit_connector';
import { useKibana } from '../../../../common/lib/kibana';
import { hasSaveActionsCapability } from '../../../lib/capabilities';
import { TestConnectorForm } from '../test_connector_form';
import { ConnectorRulesList } from '../connector_rules_list';
import { useExecuteConnector } from '../../../hooks/use_execute_connector';
import { FlyoutHeader } from './header';
import { FlyoutFooter } from './footer';

export interface EditConnectorFlyoutProps {
  actionTypeRegistry: ActionTypeRegistryContract;
  connector: ActionConnector;
  onClose: () => void;
  tab?: EditConnectorTabs;
  onConnectorUpdated?: (connector: ActionConnector) => void;
  isServerless?: boolean;
}

const getConnectorWithoutSecrets = (
  connector: UserConfiguredActionConnector<Record<string, unknown>, Record<string, unknown>>
) => ({
  ...connector,
  isMissingSecrets: connector.isMissingSecrets ?? false,
  secrets: {},
});

const EditConnectorFlyoutComponent: React.FC<EditConnectorFlyoutProps> = ({
  actionTypeRegistry,
  connector,
  onClose,
  tab = EditConnectorTabs.Configuration,
  onConnectorUpdated,
}) => {
  const confirmModalTitleId = useGeneratedHtmlId();

  const {
    docLinks,
    application: { capabilities },
  } = useKibana().services;

  const isMounted = useRef(false);
  const canSave = hasSaveActionsCapability(capabilities);
  const { isLoading: isUpdatingConnector, updateConnector } = useUpdateConnector();
  const { isLoading: isExecutingConnector, executeConnector } = useExecuteConnector();
  const [showFormErrors, setShowFormErrors] = useState<boolean>(false);

  const [preSubmitValidationErrorMessage, setPreSubmitValidationErrorMessage] =
    useState<ReactNode>(null);

  const [formState, setFormState] = useState<ConnectorFormState>({
    isSubmitted: false,
    isSubmitting: false,
    isValid: undefined,
    submit: async () => ({ isValid: false, data: {} as ConnectorFormSchema }),
    preSubmitValidator: null,
  });

  const [selectedTab, setTab] = useState<EditConnectorTabs>(tab);
  /**
   * Test connector
   */

  const [testExecutionActionParams, setTestExecutionActionParams] = useState<
    Record<string, unknown>
  >({});
  const [testExecutionResult, setTestExecutionResult] =
    useState<Option<ActionTypeExecutorResult<unknown> | undefined>>(none);

  const handleSetTab = useCallback(
    (nextPage: EditConnectorTabs) => {
      if (nextPage === EditConnectorTabs.Configuration && testExecutionResult !== none) {
        setTestExecutionResult(none);
      }
      setShowFormErrors(false);
      setTab(nextPage);
    },
    [testExecutionResult, setTestExecutionResult]
  );

  const [isFormModified, setIsFormModified] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const { preSubmitValidator, submit, isValid: isFormValid, isSubmitting } = formState;
  const hasErrors = isFormValid === false;
  const isSaving = isUpdatingConnector || isSubmitting || isExecutingConnector;
  const actionTypeModel: ActionTypeModel | null = actionTypeRegistry.get(connector.actionTypeId);
  const showButtons = canSave && actionTypeModel && !connector.isPreconfigured;

  const onExecutionAction = useCallback(async () => {
    try {
      const res = await executeConnector({
        connectorId: connector.id,
        params: testExecutionActionParams,
      });

      setTestExecutionResult(some(res));
    } catch (error) {
      const result: ActionTypeExecutorResult<unknown> = isActionTypeExecutorResult(error)
        ? error
        : {
            actionId: connector.id,
            status: 'error',
            message: error.message,
          };
      setTestExecutionResult(some(result));
    }
  }, [connector.id, executeConnector, testExecutionActionParams]);

  const onFormModifiedChange = useCallback(
    (formModified: boolean) => {
      if (formModified) {
        setIsSaved(false);
      }
      setIsFormModified(formModified);
      setTestExecutionResult(none);
    },
    [setIsFormModified]
  );

  const closeFlyout = useCallback(() => {
    if (isFormModified) {
      setShowConfirmModal(true);
      return;
    }
    onClose();
  }, [onClose, isFormModified, setShowConfirmModal]);

  const onClickSave = useCallback(async () => {
    setPreSubmitValidationErrorMessage(null);
    setShowFormErrors(false);

    const { isValid, data } = await submit();
    if (!isMounted.current) {
      // User has closed the flyout meanwhile submitting the form
      return;
    }

    if (isValid) {
      if (preSubmitValidator) {
        const validatorRes = await preSubmitValidator();

        if (validatorRes) {
          setPreSubmitValidationErrorMessage(validatorRes.message);
          return;
        }
      }

      /**
       * At this point the form is valid
       * and there are no pre submit error messages.
       */
      const { name, config, secrets } = data;
      const validConnector = {
        id: connector.id,
        name: name ?? '',
        config: config ?? {},
        secrets: secrets ?? {},
      };

      const updatedConnector = await updateConnector(validConnector);

      if (updatedConnector) {
        /**
         * ConnectorFormSchema has been saved.
         * Set the from to clean state.
         */
        onFormModifiedChange(false);

        if (onConnectorUpdated) {
          onConnectorUpdated(updatedConnector);
        }
        setIsSaved(true);
        setIsEdit(false);
        setIsEdit(true);
      }

      return updatedConnector;
    } else {
      setShowFormErrors(true);
    }
  }, [
    onConnectorUpdated,
    submit,
    preSubmitValidator,
    connector.id,
    updateConnector,
    onFormModifiedChange,
  ]);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const renderConfigurationTab = useCallback(() => {
    if (!connector.isPreconfigured && !connector.isSystemAction) {
      return (
        <>
          {isEdit && (
            <>
              {showFormErrors && (
                <>
                  <EuiCallOut
                    size="s"
                    color="danger"
                    iconType="warning"
                    data-test-subj="connector-form-header-error-label"
                    title={i18n.translate(
                      'xpack.triggersActionsUI.sections.editConnectorForm.headerFormLabel',
                      {
                        defaultMessage: 'There are errors in the form',
                      }
                    )}
                  />
                  <EuiSpacer size="m" />
                </>
              )}
              <ConnectorForm
                actionTypeModel={actionTypeModel}
                connector={getConnectorWithoutSecrets(connector)}
                isEdit={isEdit}
                onChange={setFormState}
                onFormModifiedChange={onFormModifiedChange}
              />
              {!!preSubmitValidationErrorMessage && <p>{preSubmitValidationErrorMessage}</p>}
              {showButtons && (
                <EuiButton
                  fill
                  iconType={isSaved ? 'check' : undefined}
                  color="primary"
                  data-test-subj="edit-connector-flyout-save-btn"
                  isLoading={isSaving}
                  onClick={onClickSave}
                  disabled={!isFormModified || hasErrors || isSaving}
                >
                  {isSaved ? (
                    <FormattedMessage
                      id="xpack.triggersActionsUI.sections.editConnectorForm.saveButtonSavedLabel"
                      defaultMessage="Changes Saved"
                    />
                  ) : (
                    <FormattedMessage
                      id="xpack.triggersActionsUI.sections.editConnectorForm.saveButtonLabel"
                      defaultMessage="Save"
                    />
                  )}
                </EuiButton>
              )}
            </>
          )}
        </>
      );
    }

    return (
      <ReadOnlyConnectorMessage
        href={docLinks.links.alerting.preconfiguredConnectors}
        extraComponent={actionTypeModel?.actionReadOnlyExtraComponent}
        connectorId={connector.id}
        connectorName={connector.name}
      />
    );
  }, [
    connector,
    docLinks.links.alerting.preconfiguredConnectors,
    actionTypeModel,
    isEdit,
    showFormErrors,
    onFormModifiedChange,
    preSubmitValidationErrorMessage,
    showButtons,
    isSaved,
    isSaving,
    onClickSave,
    isFormModified,
    hasErrors,
  ]);

  const renderTestTab = useCallback(() => {
    return (
      <TestConnectorForm
        connector={connector}
        executeEnabled={!isFormModified}
        actionParams={testExecutionActionParams}
        setActionParams={setTestExecutionActionParams}
        onExecutionAction={onExecutionAction}
        isExecutingAction={isExecutingConnector}
        executionResult={testExecutionResult}
        actionTypeRegistry={actionTypeRegistry}
      />
    );
  }, [
    connector,
    actionTypeRegistry,
    isExecutingConnector,
    isFormModified,
    testExecutionActionParams,
    testExecutionResult,
    onExecutionAction,
  ]);

  const renderConnectorRulesList = useCallback(() => {
    return <ConnectorRulesList connector={connector} />;
  }, [connector]);

  return (
    <>
      <EuiFlyout
        onClose={closeFlyout}
        aria-labelledby="flyoutActionEditTitle"
        size="m"
        data-test-subj="edit-connector-flyout"
      >
        <FlyoutHeader
          isPreconfigured={connector.isPreconfigured}
          connectorName={connector.name}
          connectorTypeDesc={
            actionTypeModel?.selectMessagePreconfigured || actionTypeModel?.selectMessage
          }
          setTab={handleSetTab}
          selectedTab={selectedTab}
          icon={actionTypeModel?.iconClass}
          isExperimental={actionTypeModel?.isExperimental}
          subFeature={actionTypeModel?.subFeature}
        />
        <EuiFlyoutBody>
          {selectedTab === EditConnectorTabs.Configuration && renderConfigurationTab()}
          {selectedTab === EditConnectorTabs.Test && renderTestTab()}
          {selectedTab === EditConnectorTabs.Rules && renderConnectorRulesList()}
        </EuiFlyoutBody>
        <FlyoutFooter onClose={closeFlyout} />
      </EuiFlyout>
      {showConfirmModal && (
        <EuiConfirmModal
          aria-labelledby={confirmModalTitleId}
          titleProps={{ id: confirmModalTitleId }}
          buttonColor="danger"
          data-test-subj="closeConnectorEditConfirm"
          title={i18n.translate(
            'xpack.triggersActionsUI.sections.confirmConnectorEditClose.title',
            {
              defaultMessage: 'Discard unsaved changes to connector?',
            }
          )}
          onCancel={() => {
            setShowConfirmModal(false);
          }}
          onConfirm={onClose}
          cancelButtonText={i18n.translate(
            'xpack.triggersActionsUI.sections.confirmConnectorEditClose.cancelButtonLabel',
            {
              defaultMessage: 'Cancel',
            }
          )}
          confirmButtonText={i18n.translate(
            'xpack.triggersActionsUI.sections.confirmConnectorEditClose.discardButtonLabel',
            {
              defaultMessage: 'Discard Changes',
            }
          )}
        >
          <FormattedMessage
            id="xpack.triggersActionsUI.sections.confirmConnectorEditClose.confirmConnectorCloseMessage"
            defaultMessage="You can't recover unsaved changes."
          />
        </EuiConfirmModal>
      )}
    </>
  );
};

export const EditConnectorFlyout = memo(EditConnectorFlyoutComponent);

// eslint-disable-next-line import/no-default-export
export { EditConnectorFlyout as default };
