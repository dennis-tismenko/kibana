/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */
import { SOURCE_COLUMN } from '@kbn/unified-data-table';
import { SERVICE_NAME_FIELD } from '../../../../../../common/data_types/logs/constants';
import { getTracesSummaryColumn } from '../../../../../components/data_types/traces/summary_column';
import type { DataSourceProfileProvider } from '../../../../profiles';
import { getServiceNameCell } from '../../../../../components/data_types/logs/service_name_cell';

export const getCellRenderers: DataSourceProfileProvider['profile']['getCellRenderers'] =
  (prev) => (params) => ({
    ...prev(params),
    [SOURCE_COLUMN]: getTracesSummaryColumn(params),
    [SERVICE_NAME_FIELD]: getServiceNameCell(SERVICE_NAME_FIELD, params),
  });
