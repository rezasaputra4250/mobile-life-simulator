export const religions = [
  { value: 'islam', label: 'Islam' },
  { value: 'kristen', label: 'Kristen' },
  { value: 'katolik', label: 'Katolik' },
  { value: 'hindu', label: 'Hindu' },
  { value: 'buddha', label: 'Buddha' },
  { value: 'konghucu', label: 'Konghucu' },
  { value: 'lainnya', label: 'Lainnya' },
  { value: 'tidak_menjawab', label: 'Tidak ingin menjawab' },
] as const;

export type Religion = (typeof religions)[number]['value'];
