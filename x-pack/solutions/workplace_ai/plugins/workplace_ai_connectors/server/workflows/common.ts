/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/**
 * Get the workflow name for a given connector type
 */
export function getWorkflowName(connectorType: string): string {
  switch (connectorType) {
    case 'brave_search':
      return 'Brave Search';
    case 'notion_search':
      return 'Notion Search';
    default:
      return `${connectorType} Workflow`;
  }
}

/**
 * Get the workflow description for a given connector type
 */
export function getWorkflowDescription(connectorType: string): string {
  switch (connectorType) {
    case 'brave_search':
      return 'Search using Brave Search API with automatic secret resolution';
    case 'notion_search':
      return 'Search using Notion API with OAuth 2.0';
    default:
      return `Workflow for ${connectorType}`;
  }
}
