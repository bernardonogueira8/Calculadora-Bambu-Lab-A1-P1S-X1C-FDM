export type ProductionMode = 'unit' | 'kit';

export interface ClientProjectData {
  clientName: string;
  projectName: string;
  dimensions: string;
  serviceDescription: string;
  referenceImage: string | null;
  quantity: number;
  leadTimeDays: number;
  color: string;
  notes: string;
  companyName: string;
  companyContact: string;
  materialType?: string;
}

export interface KitBatchData {
  itemsPerBatch: number; // Peças produzidas na fornada/mesa (ex: 20)
  clientQuantity: number; // Quantidade que o cliente solicitou (ex: 5)
}

export interface MaterialEquipData {
  filamentCostPerKg: number;
  partWeightG: number; // No modo unitário: peso de 1 peça. No modo kit: peso total da fornada
  printerValue: number;
  lifespanHours: number;
}

export interface TimeEnergyData {
  printTimeHours: number; // No modo unitário: tempo de 1 peça. No modo kit: tempo total da fornada
  printTimeMinutes: number;
  avgPowerWatts: number;
  energyCostKwh: number;
}

export interface WorkExtrasData {
  workHourlyRate: number;
  prepTimeMinutes: number; // No modo unitário: prep de 1 peça. No modo kit: prep da fornada toda
  packagingCost: number;
  extraHardwareCost: number; // Hardware unitário (ex: 1 argola de chaveiro por peça)
}

export interface MarketRisksData {
  profitMarginPercent: number;
  marketplaceFeePercent: number;
  marketplaceFixedFee: number;
  taxPercent: number;
  failureMarginPercent: number;
}

export interface CalculatorState {
  productionMode: ProductionMode; // 'unit' | 'kit'
  kitBatch: KitBatchData;
  clientProject: ClientProjectData;
  materialEquip: MaterialEquipData;
  timeEnergy: TimeEnergyData;
  workExtras: WorkExtrasData;
  marketRisks: MarketRisksData;
}

export interface CalculationResults {
  // Mode info
  isKitMode: boolean;
  itemsPerBatch: number;
  clientQuantity: number;
  effectiveUnitWeightG: number;
  effectiveUnitPrintTimeFormatted: string;

  // Unit values (1 piece)
  unitMaterialCost: number;
  unitEnergyCost: number;
  unitDepreciationCost: number;
  unitEnergyDepreciationCost: number;
  unitLaborCost: number;
  unitExtrasCost: number;
  unitFailureRiskCost: number;
  unitProductionCost: number;
  unitNetProfit: number;
  unitSellingPrice: number;
  unitMarketplaceFee: number;
  unitTaxAmount: number;

  // Client Order Totals (based on client requested quantity)
  quantity: number; // clientQuantity
  totalProductionCost: number;
  totalNetProfit: number;
  totalSellingPrice: number;
  totalPrintTimeHours: number;
  totalPrintTimeFormatted: string;

  // Full Batch Totals (for the entire fornada)
  batchTotalSellingPrice: number;
  batchTotalProductionCost: number;
  batchTotalNetProfit: number;
}

export interface PrinterPreset {
  id: string;
  name: string;
  price: number;
  lifespanHours: number;
  powerWatts: number;
}

export interface FilamentPreset {
  id: string;
  name: string;
  costPerKg: number;
}
