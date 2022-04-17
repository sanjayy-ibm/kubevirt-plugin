import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { CardTitle, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';

import { pauseVM, startVM, stopVM, unpauseVM } from '../../../../../../actions/actions';

type VirtualMachinesOverviewTabDetailsTitleProps = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabDetailsTitle: React.FC<
  VirtualMachinesOverviewTabDetailsTitleProps
> = ({ vm }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();

  const isMachinePaused = vm?.status?.printableStatus === 'Paused';
  const isMachineStopped = vm?.status?.printableStatus === 'Stopped';

  return (
    <CardTitle className="text-muted card-title">
      {t('Details')}
      <Dropdown
        onSelect={() => setIsDropdownOpen(false)}
        toggle={<KebabToggle onToggle={setIsDropdownOpen} id="toggle-id-disk" />}
        isOpen={isDropdownOpen}
        isPlain
        dropdownItems={[
          <DropdownItem onClick={() => null} key="copy">
            {t('Copy SSH Command')}
          </DropdownItem>,
          <DropdownItem onClick={() => (isMachineStopped ? startVM(vm) : stopVM(vm))} key="stop">
            {isMachineStopped ? t('Resume Virtual machine') : t('Stop Virtual machine')}
          </DropdownItem>,
          <DropdownItem onClick={() => (isMachinePaused ? unpauseVM(vm) : pauseVM(vm))} key="pause">
            {isMachinePaused ? t('Unpause Virtual machine') : t('Pause Virtual machine')}
          </DropdownItem>,
          <DropdownItem
            onClick={() =>
              createModal((props) => (
                <CPUMemoryModal
                  vm={vm}
                  {...props}
                  onSubmit={(updatedVM) =>
                    k8sUpdate({
                      model: VirtualMachineModel,
                      data: updatedVM,
                      ns: updatedVM?.metadata?.namespace,
                      name: updatedVM?.metadata?.name,
                    })
                  }
                />
              ))
            }
            key="disk-edit"
          >
            {t('Edit CPU | Memory')}
          </DropdownItem>,
        ]}
      />
    </CardTitle>
  );
};

export default VirtualMachinesOverviewTabDetailsTitle;