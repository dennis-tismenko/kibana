/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { z } from '@kbn/zod';
import { SubActionConnectorType } from '@kbn/actions-plugin/server/sub_action_framework/types';
import { NotionConfigSchema, NotionSecretsSchema, NotionSearchActionParamsSchema } from './schema';

export type NotionConfig = z.infer<typeof NotionConfigSchema>;
export type NotionSecrets = z.infer<typeof NotionSecretsSchema>;

export type NotionConnectorType = SubActionConnectorType<NotionConfig, NotionSecrets>

export type NotionSearchActionParams = z.infer<typeof NotionSearchActionParamsSchema>;
