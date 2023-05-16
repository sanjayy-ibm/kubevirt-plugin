import produce from 'immer';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { encodeSecretKey } from '@kubevirt-utils/resources/secret/utils';
import { buildOwnerReference, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  k8sCreate,
  k8sPatch,
  K8sResourceCommon,
  k8sUpdate,
} from '@openshift-console/dynamic-plugin-sdk';

const validateSecretNameLength = (secretName: string): boolean => secretName.length <= 51;

const validateSecretNameUnique = (secretName: string, secrets: IoK8sApiCoreV1Secret[]): boolean =>
  isEmpty(secrets?.find((secret) => getName(secret) === secretName));

export const getSecretNameErrorMessage = (
  secretName: string,
  secrets: IoK8sApiCoreV1Secret[],
): string => {
  if (!validateSecretNameUnique(secretName, secrets))
    return t('Secret name must be unique in this namespace.');

  if (!validateSecretNameLength(secretName))
    return t('Secret name too long, maximum of 51 characters.');

  return null;
};

export const createVmSSHSecret = (vm: V1VirtualMachine, sshKey: string, secretName?: string) =>
  k8sCreate<K8sResourceCommon & { data?: { [key: string]: string } }>({
    model: SecretModel,
    data: {
      kind: SecretModel.kind,
      apiVersion: SecretModel.apiVersion,
      metadata: {
        name: secretName || `${getName(vm)}-ssh-key`,
        namespace: getNamespace(vm),
        ownerReferences: [buildOwnerReference(vm, { blockOwnerDeletion: false })],
      },
      data: { key: encodeSecretKey(sshKey) },
    },
  });

export const removeSecretToVM = (vm: V1VirtualMachine) =>
  produce(vm, (vmDraft) => {
    delete vmDraft.spec.template.spec.accessCredentials;
  });

export const detachVMSecret = async (vm: V1VirtualMachine, vmSecret: IoK8sApiCoreV1Secret) => {
  await k8sPatch({
    model: VirtualMachineModel,
    resource: vm,
    data: [
      {
        op: 'remove',
        path: '/spec/template/spec/accessCredentials',
      },
    ],
  });

  const updatedSecret = produce(vmSecret, (draftSecret) => {
    if (draftSecret.metadata.ownerReferences)
      draftSecret.metadata.ownerReferences = draftSecret.metadata.ownerReferences.filter(
        (ref) => ref?.uid !== vm?.metadata?.uid,
      );
  });

  await k8sUpdate({
    model: SecretModel,
    data: updatedSecret,
  });
};

export const addSecretToVM = (vm: V1VirtualMachine, secretName?: string) =>
  produce(vm, (vmDraft) => {
    const cloudInitNoCloudVolume = getVolumes(vm)?.find((v) => v.cloudInitNoCloud);
    if (cloudInitNoCloudVolume) {
      vmDraft.spec.template.spec.volumes = [
        ...getVolumes(vm).filter((v) => !v.cloudInitNoCloud),
        {
          name: cloudInitNoCloudVolume.name,
          cloudInitConfigDrive: { ...cloudInitNoCloudVolume.cloudInitNoCloud },
        },
      ];
    }
    vmDraft.spec.template.spec.accessCredentials = [
      {
        sshPublicKey: {
          source: {
            secret: {
              secretName: secretName || `${getName(vm)}-ssh-key`,
            },
          },
          propagationMethod: {
            configDrive: {},
          },
        },
      },
    ];
  });
