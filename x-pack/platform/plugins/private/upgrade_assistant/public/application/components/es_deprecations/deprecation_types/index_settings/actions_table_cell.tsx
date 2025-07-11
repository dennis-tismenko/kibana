/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { EuiFlexItem, EuiText, EuiFlexGroup, EuiIcon, EuiToolTip, EuiLink } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

const i18nTexts = {
  resolutionText: i18n.translate(
    'xpack.upgradeAssistant.esDeprecations.indexSettings.resolutionText',
    {
      defaultMessage: 'Remove settings',
    }
  ),
  resolutionTooltipLabel: i18n.translate(
    'xpack.upgradeAssistant.esDeprecations.indexSettings.resolutionTooltipLabel',
    {
      defaultMessage:
        'Resolve this issue by removing settings from this index. This issue can be resolved automatically.',
    }
  ),
};

interface Props {
  openFlyout: () => void;
}

export const IndexSettingsActionsCell: React.FunctionComponent<Props> = ({ openFlyout }) => {
  return (
    <EuiToolTip position="top" content={i18nTexts.resolutionTooltipLabel}>
      <EuiLink onClick={openFlyout} data-test-subj={'deprecation-indexSetting'}>
        <EuiFlexGroup gutterSize="s" alignItems="center" data-test-subj="indexSettingsActionsCell">
          <EuiFlexItem grow={false}>
            <EuiIcon type="indexSettings" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="s">{i18nTexts.resolutionText}</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiLink>
    </EuiToolTip>
  );
};
