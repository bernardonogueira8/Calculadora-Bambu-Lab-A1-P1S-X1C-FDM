import type { PrinterPreset, FilamentPreset } from '../types/calculator';

export const PRINTER_PRESETS: PrinterPreset[] = [
  {
    id: 'bambu-a1-mini',
    name: 'Bambu Lab A1 / A1 Mini',
    price: 3600,
    lifespanHours: 3000,
    powerWatts: 130,
  },
  {
    id: 'bambu-p1s',
    name: 'Bambu Lab P1S',
    price: 6500,
    lifespanHours: 4000,
    powerWatts: 160,
  },
  {
    id: 'bambu-x1c',
    name: 'Bambu Lab X1-Carbon',
    price: 9800,
    lifespanHours: 4500,
    powerWatts: 170,
  },
  {
    id: 'creality-ender-3',
    name: 'Creality Ender 3 (V2 / V3 SE)',
    price: 1600,
    lifespanHours: 2500,
    powerWatts: 120,
  },
  {
    id: 'creality-k1',
    name: 'Creality K1 / K1C / Max',
    price: 3800,
    lifespanHours: 3500,
    powerWatts: 200,
  },
  {
    id: 'elegoo-neptune-4',
    name: 'Elegoo Neptune 4 / Pro',
    price: 2200,
    lifespanHours: 3000,
    powerWatts: 150,
  },
  {
    id: 'prusa-mk4',
    name: 'Original Prusa MK4',
    price: 7500,
    lifespanHours: 5000,
    powerWatts: 120,
  },
  {
    id: 'resina-lcd',
    name: 'Impressora de Resina (LCD)',
    price: 2600,
    lifespanHours: 2000,
    powerWatts: 65,
  },
];

export const FILAMENT_PRESETS: FilamentPreset[] = [
  { id: 'petg-masterprint', name: 'PETG Masterprint', costPerKg: 72 },
  { id: 'petg-padrao', name: 'PETG Padrão', costPerKg: 120 },
  { id: 'pla-padrao', name: 'PLA Padrão', costPerKg: 110 },
  { id: 'pla-premium', name: 'PLA Silk / Premium', costPerKg: 140 },
  { id: 'abs-asa', name: 'ABS / ASA', costPerKg: 130 },
  { id: 'tpu-flex', name: 'TPU Flexível', costPerKg: 170 },
  { id: 'cf-nylon', name: 'Nylon c/ Fibra de Carbono', costPerKg: 290 },
  { id: 'resina-std', name: 'Resina Standard (405nm)', costPerKg: 160 },
];
