import * as React from 'react';

import { VirtualMachineSnapshotModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1alpha1VirtualMachineRestore,
  V1alpha1VirtualMachineSnapshot,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import Timestamp from '../../../list/components/Timestamp/Timestamp';

import IndicationLabelList from './components/IndicationLabel/IndicationLabelList';

const SnapshotRow: React.FC<
  RowProps<V1alpha1VirtualMachineSnapshot, { restores: Map<string, V1alpha1VirtualMachineRestore> }>
> = ({ obj: snapshot, activeColumnIDs, rowData: { restores } }) => {
  const relevantRestore = restores?.[snapshot?.metadata?.name];
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={VirtualMachineSnapshotModelGroupVersionKind}
          name={snapshot?.metadata?.name}
          namespace={snapshot?.metadata?.namespace}
        />
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={snapshot?.metadata?.creationTimestamp} />
      </TableData>
      <TableData id="status" activeColumnIDs={activeColumnIDs}>
        {snapshot?.status?.phase}
      </TableData>
      <TableData id="last-restored" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={relevantRestore?.status?.restoreTime} />
      </TableData>
      <TableData id="indications" activeColumnIDs={activeColumnIDs}>
        <IndicationLabelList snapshot={snapshot} />
      </TableData>
      <TableData
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        {/* TODO */}
      </TableData>
    </>
  );
};

export default SnapshotRow;