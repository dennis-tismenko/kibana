/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { AxiosError } from 'axios';
import { ServiceParams, SubActionConnector } from '@kbn/actions-plugin/server';
import { NotionConfig, NotionConnectorType, NotionSecrets } from '@kbn/stack-connectors-plugin/common/notion/types';
import { ConnectorUsageCollector } from '@kbn/actions-plugin/server/usage';
import { NotionConfigSchema, NotionSecretsSchema } from '@kbn/stack-connectors-plugin/common/notion/schema';
import { RenderParameterTemplates } from '@kbn/actions-plugin/server/types';
import { ExecutorParams } from '@kbn/stack-connectors-plugin/common/xsoar/types';
import { renderMustacheString } from '@kbn/actions-plugin/server/lib/mustache_renderer';

export class NotionConnector extends SubActionConnector<NotionConfig, NotionSecrets> {

  constructor(params: ServiceParams<NotionConfig, NotionSecrets>) {
    super(params);

    this.registerSubActions();
  }

  private registerSubActions() {
    this.registerSubAction({
      name: 'search',
      method: 'searchPages',
      schema: {},
    })
  }

  public async searchPages(params: unknown, connectorUsageCollector: ConnectorUsageCollector) {}

  protected getResponseErrorMessage(error: AxiosError): string {
    return error.toString();
  }
}

export const renderParameterTemplates: RenderParameterTemplates<ExecutorParams> = (
  logger,
  params,
  variables
) => {
  return {
    ...params,
    subActionParams: {
      ...params.subActionParams,
      body: renderMustacheString(logger, params.subActionParams.body as string, variables, 'json'),
    },
  };
};

export function getConnectorType(): NotionConnectorType {
  return {
    id: ".notion",
    minimumLicenseRequired: "gold",
    name: "Notion",
    getService: (params) => new NotionConnector(params),
    supportedFeatureIds: [],
    schema: {
      config: NotionConfigSchema,
      secrets: NotionSecretsSchema,
    },
    renderParameterTemplates,
  };
}
