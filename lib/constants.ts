export const MAX_FILE_SIZE_BYTES = 26214400;
export const ALLOWED_MODEL_EXTENSIONS = [".stl", ".3mf"];
export const PAGE_SIZE = 24;

export const FILAMENT_TYPES = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'Resin', 'Other'] as const;

export const PREDEFINED_TAGS = [
  { id: 'tag-001', name: 'functional' },
  { id: 'tag-002', name: 'decorative' },
  { id: 'tag-003', name: 'workshop' },
  { id: 'tag-004', name: 'tools' },
  { id: 'tag-005', name: 'miniature' },
  { id: 'tag-006', name: 'home' },
  { id: 'tag-007', name: 'garden' },
  { id: 'tag-008', name: 'gaming' },
  { id: 'tag-009', name: 'jewelry' },
  { id: 'tag-010', name: 'educational' },
  { id: 'tag-011', name: 'organizer' },
  { id: 'tag-012', name: 'holder' },
  { id: 'tag-013', name: 'mount' },
  { id: 'tag-014', name: 'enclosure' },
  { id: 'tag-015', name: 'no-supports' },
] as const;
