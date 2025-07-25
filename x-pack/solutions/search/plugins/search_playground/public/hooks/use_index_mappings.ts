/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useQuery } from '@tanstack/react-query';
import type { HttpSetup } from '@kbn/core-http-browser';
import { IndicesGetMappingResponse } from '@elastic/elasticsearch/lib/api/types';
import { useFormContext } from 'react-hook-form';

import { SearchPlaygroundQueryKeys } from '../../common';
import { APIRoutes, PlaygroundForm, PlaygroundFormFields } from '../types';
import { useKibana } from './use_kibana';

export interface FetchIndexMappingsArgs {
  indices: PlaygroundForm[PlaygroundFormFields.indices];
  http: HttpSetup;
}

export const fetchIndexMappings = async ({ indices, http }: FetchIndexMappingsArgs) => {
  const mappings = await http.post<{
    mappings: IndicesGetMappingResponse;
  }>(APIRoutes.GET_INDEX_MAPPINGS, {
    body: JSON.stringify({
      indices,
    }),
  });
  return mappings;
};
export const useIndexMappings = () => {
  const {
    services: { http },
  } = useKibana();
  const { getValues } = useFormContext();
  const indices = getValues(PlaygroundFormFields.indices);
  const { data } = useQuery({
    queryKey: [SearchPlaygroundQueryKeys.IndexMappings, indices],
    queryFn: () => fetchIndexMappings({ indices, http }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  return { data: data?.mappings };
};
