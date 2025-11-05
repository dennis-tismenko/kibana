/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { z } from '@kbn/zod';
import { NotionConfigSchema, NotionSecretsSchema } from '@kbn/stack-connectors-plugin/common/notion/schema';
import { SubActionConnectorType } from '@kbn/actions-plugin/server/sub_action_framework/types';

export type NotionConfig = z.infer<typeof NotionConfigSchema>;
export type NotionSecrets = z.infer<typeof NotionSecretsSchema>;

export type NotionConnectorType = SubActionConnectorType<NotionConfig, NotionSecrets>
