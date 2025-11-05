/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { z } from '@kbn/zod';

// Connector schema
export const NotionConfigSchema = z.object({ url: z.string() }).strict();
export const NotionSecretsSchema = z.object({ email: z.string(), token: z.string() }).strict();

// Search action schema
export const NotionSearchActionParamsSchema = z.object({});
export const NotionSearchActionResponseSchema = z.object({});
