/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SECURITY_FEATURE_ID } from '@kbn/security-solution-plugin/common/constants';
import { Role } from './types';

export const noKibanaPrivileges: Role = {
  name: 'no_kibana_privileges',
  privileges: {
    elasticsearch: {
      indices: [],
    },
    kibana: [
      {
        feature: {
          siem: ['none'],
        },
        spaces: ['*'],
      },
    ],
  },
};

export const globalRead: Role = {
  name: 'global_read',
  privileges: {
    elasticsearch: {
      indices: [],
    },
    kibana: [
      {
        base: ['read'],
        spaces: ['*'],
      },
    ],
  },
};

export const securitySolutionOnlyAll: Role = {
  name: 'sec_only_all_spaces_space1',
  privileges: {
    elasticsearch: {
      indices: [],
    },
    kibana: [
      {
        feature: {
          [SECURITY_FEATURE_ID]: ['all'],
          securitySolutionAssistant: ['all'],
          securitySolutionAttackDiscovery: ['all'],
          aiAssistantManagementSelection: ['all'],
        },
        spaces: ['space1'],
      },
    ],
  },
};

export const securitySolutionOnlyAllSpace2: Role = {
  name: 'sec_only_all_spaces_space2',
  privileges: {
    elasticsearch: {
      indices: [],
    },
    kibana: [
      {
        feature: {
          [SECURITY_FEATURE_ID]: ['all'],
          securitySolutionAssistant: ['all'],
          securitySolutionAttackDiscovery: ['all'],
          aiAssistantManagementSelection: ['all'],
        },
        spaces: ['space2'],
      },
    ],
  },
};

export const securitySolutionOnlyRead: Role = {
  name: 'sec_only_read_spaces_space1',
  privileges: {
    elasticsearch: {
      indices: [],
    },
    kibana: [
      {
        feature: {
          [SECURITY_FEATURE_ID]: ['read'],
          securitySolutionAssistant: ['all'],
          securitySolutionAttackDiscovery: ['all'],
          aiAssistantManagementSelection: ['all'],
        },
        spaces: ['space1'],
      },
    ],
  },
};

export const securitySolutionOnlyReadSpace2: Role = {
  name: 'sec_only_read_spaces_space2',
  privileges: {
    elasticsearch: {
      indices: [],
    },
    kibana: [
      {
        feature: {
          [SECURITY_FEATURE_ID]: ['read'],
          securitySolutionAssistant: ['all'],
          securitySolutionAttackDiscovery: ['all'],
          aiAssistantManagementSelection: ['all'],
        },
        spaces: ['space2'],
      },
    ],
  },
};

/**
 * These roles have access to all spaces.
 */
export const securitySolutionOnlyAllSpacesAll: Role = {
  name: 'sec_only_all_spaces_all',
  privileges: {
    elasticsearch: {
      indices: [],
    },
    kibana: [
      {
        feature: {
          [SECURITY_FEATURE_ID]: ['all'],
          securitySolutionAssistant: ['all'],
          securitySolutionAttackDiscovery: ['all'],
          aiAssistantManagementSelection: ['all'],
        },
        spaces: ['*'],
      },
    ],
  },
};

export const securitySolutionOnlyAllSpacesAllWithReadESIndices: Role = {
  name: 'sec_only_all_spaces_all_with_read_es_indices',
  privileges: {
    elasticsearch: {
      indices: [
        {
          names: ['*'],
          privileges: ['all'],
        },
      ],
    },
    kibana: [
      {
        feature: {
          [SECURITY_FEATURE_ID]: ['all'],
          securitySolutionAssistant: ['all'],
          securitySolutionAttackDiscovery: ['all'],
          aiAssistantManagementSelection: ['all'],
        },
        spaces: ['*'],
      },
    ],
  },
};

export const securitySolutionOnlyReadSpacesAll: Role = {
  name: 'sec_only_read_spaces_all',
  privileges: {
    elasticsearch: {
      indices: [],
    },
    kibana: [
      {
        feature: {
          [SECURITY_FEATURE_ID]: ['read'],
          securitySolutionAssistant: ['all'],
          securitySolutionAttackDiscovery: ['all'],
          aiAssistantManagementSelection: ['all'],
        },
        spaces: ['*'],
      },
    ],
  },
};

export const securitySolutionOnlyAllSpacesAllAssistantMinimalAll: Role = {
  name: 'sec_only_all_spaces_all_assistant_minimal_all',
  privileges: {
    elasticsearch: {
      indices: [],
    },
    kibana: [
      {
        feature: {
          [SECURITY_FEATURE_ID]: ['all'],
          securitySolutionAssistant: ['minimal_all'],
          securitySolutionAttackDiscovery: ['all'],
          aiAssistantManagementSelection: ['all'],
        },
        spaces: ['*'],
      },
    ],
  },
};

export const roles = [
  noKibanaPrivileges,
  globalRead,
  securitySolutionOnlyAll,
  securitySolutionOnlyRead,
];

export const allRoles = [
  noKibanaPrivileges,
  globalRead,
  securitySolutionOnlyAll,
  securitySolutionOnlyRead,
  securitySolutionOnlyAllSpacesAll,
  securitySolutionOnlyAllSpacesAllWithReadESIndices,
  securitySolutionOnlyAllSpacesAllAssistantMinimalAll,
  securitySolutionOnlyReadSpacesAll,
  securitySolutionOnlyAllSpace2,
  securitySolutionOnlyReadSpace2,
];
