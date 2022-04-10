import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DetailItem, DetailsBody } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import { useKubevirtCSVDetails } from './hooks/useKubevirtCSVDetails';
import SourceMissingStatus from './SourceMissingStatus/SourceMissingStatus';
import SubscriptionStatus from './SourceMissingStatus/SubscriptionStatus';

const DetailsCard: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const kvCsvDetails = useKubevirtCSVDetails();
  const {
    name,
    provider,
    version,
    updateChannel,
    kubevirtSub,
    catalogSourceMissing,
    loaded,
    loadError,
  } = kvCsvDetails;
  const isLoading = !loaded && !loadError && !kubevirtSub;

  return (
    <Card data-test-id="kubevirt-overview-dashboard--details-card">
      <CardHeader>
        <CardTitle>{t('Details')}</CardTitle>
      </CardHeader>
      <CardBody>
        <DetailsBody>
          <DetailItem isLoading={isLoading} title={t('Service name')}>
            {name}
          </DetailItem>
          <DetailItem isLoading={isLoading} title={t('Provider')}>
            {provider}
          </DetailItem>
          <DetailItem isLoading={isLoading} title={t('OpenShift Virtualization version')}>
            {version}
            <div>
              {catalogSourceMissing ? (
                <SourceMissingStatus />
              ) : (
                <SubscriptionStatus subscription={kubevirtSub} />
              )}
            </div>
          </DetailItem>
          <DetailItem isLoading={isLoading} title={t('Update Channel')}>
            {updateChannel}
          </DetailItem>
        </DetailsBody>
      </CardBody>
    </Card>
  );
};

export default DetailsCard;