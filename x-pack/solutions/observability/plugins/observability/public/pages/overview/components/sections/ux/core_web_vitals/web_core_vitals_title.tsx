/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState } from 'react';
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiLoadingSpinner,
  EuiPopover,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { i18n } from '@kbn/i18n';

const CORE_WEB_VITALS = i18n.translate('xpack.observability.ux.coreWebVitals', {
  defaultMessage: 'Core web vitals',
});

const BROWSER_CORE_WEB_VITALS = i18n.translate(
  'xpack.observability.ux.coreWebVitals.browser.support',
  {
    defaultMessage: 'browser support for core web vitals',
  }
);

const CORE_VITALS_URL = 'https://ela.st/vtls';
const CORE_VITALS_BROWSER_URL = 'https://ela.st/ch-vtls';

export function WebCoreVitalsTitle({
  loading,
  coreVitalPages,
  totalPageViews = 0,
  displayTrafficMetric,
}: {
  loading: boolean;
  coreVitalPages?: number;
  totalPageViews?: number;
  displayTrafficMetric: boolean;
}) {
  const [isBrowserPopoverOpen, setIsBrowserPopoverOpen] = useState(false);

  const closeBrowserPopover = () => setIsBrowserPopoverOpen(false);

  const helpAriaLabel = i18n.translate(
    'xpack.observability.ux.dashboard.webCoreVitals.helpAriaLabel',
    { defaultMessage: 'help' }
  );

  return (
    <EuiFlexGroup gutterSize="none">
      <EuiFlexGroup gutterSize="s" direction="row" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiTitle size="xs">
            <h3>{CORE_WEB_VITALS}</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            <EuiLink
              data-test-subj="o11yWebCoreVitalsTitleLink"
              href={CORE_VITALS_URL}
              external
              target="_blank"
            >
              {i18n.translate('xpack.observability.ux.dashboard.webCoreVitals.help', {
                defaultMessage: 'Learn more',
              })}
            </EuiLink>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      {displayTrafficMetric && totalPageViews > 0 && (
        <EuiFlexItem grow={false}>
          {loading ? (
            <EuiLoadingSpinner />
          ) : (
            <EuiText size="s">
              <FormattedMessage
                id="xpack.observability.ux.dashboard.webCoreVitals.traffic"
                defaultMessage="{trafficPerc} of the traffic represented"
                values={{
                  trafficPerc: (
                    <strong> {(((coreVitalPages || 0) / totalPageViews) * 100).toFixed(0)}%</strong>
                  ),
                }}
              />

              <EuiPopover
                isOpen={isBrowserPopoverOpen}
                button={
                  <EuiButtonIcon
                    data-test-subj="o11yWebCoreVitalsTitleButton"
                    aria-label={helpAriaLabel}
                    onClick={() => setIsBrowserPopoverOpen(true)}
                    color={'text'}
                    iconType={'question'}
                  />
                }
                closePopover={closeBrowserPopover}
              >
                <div>
                  <EuiText>
                    <FormattedMessage
                      id="xpack.observability.ux.dashboard.webCoreVitals.browser.help"
                      defaultMessage="Learn more about"
                    />{' '}
                    <EuiLink
                      data-test-subj="o11yWebCoreVitalsTitleLink"
                      href={CORE_VITALS_BROWSER_URL}
                      external
                      target="_blank"
                    >
                      {BROWSER_CORE_WEB_VITALS}
                    </EuiLink>
                  </EuiText>
                </div>
              </EuiPopover>
            </EuiText>
          )}
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
}
