import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { ExpandableSection } from '@patternfly/react-core';

import MigrationCharts from './MigrationCharts/MigrationCharts';
import NetworkCharts from './NetworkCharts/NetworkCharts';
import StorageCharts from './StorageCharts/StorageCharts';
import TimeRange from './TimeRange/TimeRange';
import UtilizationCharts from './UtilizationCharts/UtilizationCharts';
import { MetricsTabExpendedSections } from './utils/utils';

import './virtual-machine-metrics-tab.scss';

type VirtualMachineMetricsTabProps = RouteComponentProps & {
  obj: V1VirtualMachine;
};

const VirtualMachineMetricsTab: React.FC<VirtualMachineMetricsTabProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();
  const { vmi, pods } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const [expended, setExpended] = useState<{ [key in MetricsTabExpendedSections]: boolean }>({
    [MetricsTabExpendedSections.utilization]: true,
    [MetricsTabExpendedSections.storage]: true,
    [MetricsTabExpendedSections.network]: true,
    [MetricsTabExpendedSections.migration]: true,
  });

  const onToggle = (value) => () =>
    setExpended((currentOpen) => ({ ...currentOpen, [value]: !currentOpen?.[value] }));

  return (
    <div className="virtual-machine-metrics-tab__main">
      <TimeRange />
      <Overview className="virtual-machine-metrics-tab__charts">
        <ExpandableSection
          toggleText={t('Utilization')}
          onToggle={onToggle(MetricsTabExpendedSections.utilization)}
          isExpanded={expended?.[MetricsTabExpendedSections.utilization]}
        >
          <UtilizationCharts vmi={vmi} pods={pods} />
        </ExpandableSection>

        <ExpandableSection
          toggleText={t('Storage')}
          onToggle={onToggle(MetricsTabExpendedSections.storage)}
          isExpanded={expended?.[MetricsTabExpendedSections.storage]}
        >
          <StorageCharts vmi={vmi} />
        </ExpandableSection>
        <ExpandableSection
          toggleText={t('Network')}
          onToggle={onToggle(MetricsTabExpendedSections.network)}
          isExpanded={expended?.[MetricsTabExpendedSections.network]}
        >
          <NetworkCharts vmi={vmi} />
        </ExpandableSection>
        <ExpandableSection
          toggleText={t('Migration')}
          onToggle={onToggle(MetricsTabExpendedSections.migration)}
          isExpanded={expended?.[MetricsTabExpendedSections.migration]}
        >
          <MigrationCharts />
        </ExpandableSection>
      </Overview>
    </div>
  );
};

export default VirtualMachineMetricsTab;
