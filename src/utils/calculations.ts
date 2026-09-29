import type { CalculatorState, CalculationResults } from '../types/calculator';

export function calculatePricing(state: CalculatorState): CalculationResults {
  const {
    productionMode = 'unit',
    kitBatch = { itemsPerBatch: 20, clientQuantity: 1 },
    materialEquip,
    timeEnergy,
    workExtras,
    marketRisks,
    clientProject,
  } = state;

  const isKitMode = productionMode === 'kit';
  const itemsPerBatch = Math.max(1, Math.round(kitBatch?.itemsPerBatch || 1));
  const clientQuantity = Math.max(
    1,
    Math.round(isKitMode ? kitBatch?.clientQuantity || 1 : clientProject?.quantity || 1)
  );

  // Time calculations
  const rawPrintHours = Math.max(0, Number(timeEnergy.printTimeHours) || 0);
  const rawPrintMinutes = Math.max(0, Number(timeEnergy.printTimeMinutes) || 0);
  const totalEnteredHours = rawPrintHours + (rawPrintMinutes / 60);

  // If in kit/batch mode, the entered print time is for the whole batch
  const unitPrintHoursTotal = isKitMode
    ? totalEnteredHours / itemsPerBatch
    : totalEnteredHours;

  // Weight calculations
  const rawWeight = Math.max(0, Number(materialEquip.partWeightG) || 0);
  const effectiveUnitWeightG = isKitMode ? rawWeight / itemsPerBatch : rawWeight;

  // 1. Material Cost (unit)
  const filamentCost = Math.max(0, Number(materialEquip.filamentCostPerKg) || 0);
  const unitMaterialCost = (effectiveUnitWeightG / 1000) * filamentCost;

  // 2. Energy & Depreciation (unit)
  const powerWatts = Math.max(0, Number(timeEnergy.avgPowerWatts) || 0);
  const energyKwhPrice = Math.max(0, Number(timeEnergy.energyCostKwh) || 0);
  const unitEnergyCost = (powerWatts / 1000) * unitPrintHoursTotal * energyKwhPrice;

  const printerVal = Math.max(0, Number(materialEquip.printerValue) || 0);
  const lifespanH = Math.max(1, Number(materialEquip.lifespanHours) || 1);
  const hourlyDepreciation = printerVal / lifespanH;
  const unitDepreciationCost = hourlyDepreciation * unitPrintHoursTotal;
  const unitEnergyDepreciationCost = unitEnergyCost + unitDepreciationCost;

  // 3. Labor Cost (unit)
  const rawPrepMinutes = Math.max(0, Number(workExtras.prepTimeMinutes) || 0);
  const unitPrepMinutes = isKitMode ? rawPrepMinutes / itemsPerBatch : rawPrepMinutes;
  const laborHourlyRate = Math.max(0, Number(workExtras.workHourlyRate) || 0);
  const unitLaborCost = (unitPrepMinutes / 60) * laborHourlyRate;

  // 4. Extras
  // Packaging is typically per client order/batch
  const packagingTotal = Math.max(0, Number(workExtras.packagingCost) || 0);
  const unitPackaging = clientQuantity > 0 ? (packagingTotal / clientQuantity) : packagingTotal;
  // Hardware is per unit piece (e.g., 1 keychain ring per keychain)
  const unitHardware = Math.max(0, Number(workExtras.extraHardwareCost) || 0);
  const unitExtrasCost = unitPackaging + unitHardware;

  // 5. Base Production Cost (before failure risk)
  const unitBaseCost = unitMaterialCost + unitEnergyCost + unitDepreciationCost + unitLaborCost + unitExtrasCost;

  // 6. Failure / Risk Margin
  const failurePercent = Math.max(0, Number(marketRisks.failureMarginPercent) || 0);
  const unitFailureRiskCost = unitBaseCost * (failurePercent / 100);

  // 7. Total Production Cost (unit)
  const unitProductionCost = unitBaseCost + unitFailureRiskCost;

  // 8. Net Profit
  const profitMarginPercent = Math.max(0, Number(marketRisks.profitMarginPercent) || 0);
  const unitNetProfit = unitProductionCost * (profitMarginPercent / 100);

  // 9. Marketplace & Taxes
  const marketplacePercent = Math.max(0, Number(marketRisks.marketplaceFeePercent) || 0);
  const fixedFee = Math.max(0, Number(marketRisks.marketplaceFixedFee) || 0);
  const unitFixedFee = clientQuantity > 0 ? (fixedFee / clientQuantity) : fixedFee;
  const taxPercent = Math.max(0, Number(marketRisks.taxPercent) || 0);

  const deductionsRate = (marketplacePercent + taxPercent) / 100;
  const targetBaseWithProfit = unitProductionCost + unitNetProfit + unitFixedFee;

  let unitSellingPrice = 0;
  if (deductionsRate >= 0.99) {
    unitSellingPrice = targetBaseWithProfit * 2;
  } else {
    unitSellingPrice = targetBaseWithProfit / (1 - deductionsRate);
  }

  const unitMarketplaceFee = (unitSellingPrice * (marketplacePercent / 100)) + unitFixedFee;
  const unitTaxAmount = unitSellingPrice * (taxPercent / 100);

  // Totals for client requested quantity
  const totalProductionCost = unitProductionCost * clientQuantity;
  const totalNetProfit = unitNetProfit * clientQuantity;
  const totalSellingPrice = unitSellingPrice * clientQuantity;
  const totalPrintTimeHours = unitPrintHoursTotal * clientQuantity;

  const totalFullHours = Math.floor(totalPrintTimeHours);
  const totalRemainingMinutes = Math.round((totalPrintTimeHours - totalFullHours) * 60);
  const totalPrintTimeFormatted = `${totalFullHours}h ${totalRemainingMinutes.toString().padStart(2, '0')}m`;

  // Effective unit print time formatted
  const unitFullHours = Math.floor(unitPrintHoursTotal);
  const unitRemainingMinutes = Math.round((unitPrintHoursTotal - unitFullHours) * 60);
  const effectiveUnitPrintTimeFormatted = unitFullHours > 0
    ? `${unitFullHours}h ${unitRemainingMinutes.toString().padStart(2, '0')}m`
    : `${unitRemainingMinutes} min`;

  // Batch totals (for the whole fornada)
  const batchTotalSellingPrice = unitSellingPrice * itemsPerBatch;
  const batchTotalProductionCost = unitProductionCost * itemsPerBatch;
  const batchTotalNetProfit = unitNetProfit * itemsPerBatch;

  return {
    isKitMode,
    itemsPerBatch,
    clientQuantity,
    effectiveUnitWeightG,
    effectiveUnitPrintTimeFormatted,

    unitMaterialCost,
    unitEnergyCost,
    unitDepreciationCost,
    unitEnergyDepreciationCost,
    unitLaborCost,
    unitExtrasCost,
    unitFailureRiskCost,
    unitProductionCost,
    unitNetProfit,
    unitSellingPrice,
    unitMarketplaceFee,
    unitTaxAmount,

    quantity: clientQuantity,
    totalProductionCost,
    totalNetProfit,
    totalSellingPrice,
    totalPrintTimeHours,
    totalPrintTimeFormatted,

    batchTotalSellingPrice,
    batchTotalProductionCost,
    batchTotalNetProfit,
  };
}

export function formatBRL(value: number): string {
  if (isNaN(value) || !isFinite(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumberBR(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0,00';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
