export type CapabilityStatus = 'ready' | 'permission-needed' | 'native-build-needed';

export const nativeCapabilities = {
  wakeWord: {
    label: 'Wake word engine',
    detail: 'Offline “Mitu” detection',
    status: 'native-build-needed' as CapabilityStatus,
  },
  accessibility: {
    label: 'Accessibility service',
    detail: 'System actions and messaging automation',
    status: 'permission-needed' as CapabilityStatus,
  },
  camera: {
    label: 'Hand tracking sensor',
    detail: 'MediaPipe landmarks and air gestures',
    status: 'native-build-needed' as CapabilityStatus,
  },
};

export function getCapabilityStatusLabel(status: CapabilityStatus): string {
  if (status === 'ready') return 'Ready';
  if (status === 'permission-needed') return 'Permission needed';
  return 'Native build needed';
}