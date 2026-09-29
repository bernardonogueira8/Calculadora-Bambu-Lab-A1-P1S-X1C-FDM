import React, { useState, useEffect, useRef } from 'react';
import type { CalculatorState, CalculationResults, ProductionMode } from '../types/calculator';
import { PRINTER_PRESETS, FILAMENT_PRESETS } from '../utils/presets';
import { calculatePricing, formatBRL } from '../utils/calculations';
import { InputField } from './InputField';
import { PdfQuoteTemplate } from './PdfQuoteTemplate';
import { PdfPreviewModal } from './PdfPreviewModal';
import { generatePdfFromElement } from '../utils/pdfGenerator';
import {
  Printer,
  Zap,
  Clock,
  TrendingUp,
  FileText,
  PlusCircle,
  FolderOpen,
  Save,
  Upload,
  Trash2,
  Share2,
  Check,
  Eye,
  Layers,
  Sparkles,
  Info,
  Package,
  Boxes,
} from 'lucide-react';

const INITIAL_STATE: CalculatorState = {
  productionMode: 'unit',
  kitBatch: {
    itemsPerBatch: 20,
    clientQuantity: 1,
  },
  clientProject: {
    clientName: 'Cliente Exemplo',
    projectName: 'Chaveiro com NFC',
    dimensions: '150 x 42 x 2.5 mm',
    serviceDescription: 'Serviço de impressão 3D em alta resolução FDM com acabamento profissional e remoção limpa de suportes.',
    referenceImage: null,
    quantity: 1,
    leadTimeDays: 3,
    color: 'Preto',
    notes: 'Manter a peça ao abrigo de temperaturas superiores a 60°C.',
    companyName: 'Bambu Lab 3D Studio',
    companyContact: 'WhatsApp: (11) 98765-4321 | contato@3dstudio.com.br',
  },
  materialEquip: {
    filamentCostPerKg: 120,
    partWeightG: 50,
    printerValue: 3600,
    lifespanHours: 3000,
  },
  timeEnergy: {
    printTimeHours: 2,
    printTimeMinutes: 30,
    avgPowerWatts: 130,
    energyCostKwh: 0.95,
  },
  workExtras: {
    workHourlyRate: 30,
    prepTimeMinutes: 10,
    packagingCost: 2,
    extraHardwareCost: 0,
  },
  marketRisks: {
    profitMarginPercent: 50,
    marketplaceFeePercent: 14,
    marketplaceFixedFee: 0,
    taxPercent: 0,
    failureMarginPercent: 5,
  },
};
const HeaderQuantityInput: React.FC<{
  value: number;
  onChange: (val: number) => void;
}> = ({ value, onChange }) => {
  const [local, setLocal] = useState<string>(String(value || 1));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocal(String(value || 1));
    }
  }, [value, isFocused]);

  return (
    <input
      type="number"
      min={1}
      value={local}
      onFocus={(e) => {
        setIsFocused(true);
        e.target.select();
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setLocal(raw);
        if (raw !== '') {
          const num = parseInt(raw);
          if (!isNaN(num) && num > 0) onChange(num);
        }
      }}
      onBlur={() => {
        setIsFocused(false);
        if (local === '' || isNaN(parseInt(local)) || parseInt(local) < 1) {
          setLocal('1');
          onChange(1);
        } else {
          const num = Math.max(1, parseInt(local));
          setLocal(String(num));
          onChange(num);
        }
      }}
      className="text-base font-extrabold text-slate-800 bg-transparent border-none p-0 focus:outline-none w-16"
    />
  );
};

export const Calculator: React.FC = () => {
  const [state, setState] = useState<CalculatorState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calc3d_state_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...INITIAL_STATE,
            ...parsed,
            kitBatch: {
              ...INITIAL_STATE.kitBatch,
              ...(parsed.kitBatch || {}),
            },
          };
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_STATE;
  });

  const [results, setResults] = useState<CalculationResults>(() => calculatePricing(state));
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExportingDirectPdf, setIsExportingDirectPdf] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);
  const hiddenPdfRef = useRef<HTMLDivElement>(null);

  const isKitMode = state.productionMode === 'kit';

  // Recalculate results in real time whenever state changes
  useEffect(() => {
    const res = calculatePricing(state);
    setResults(res);
  }, [state]);

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('calc3d_state_v2', JSON.stringify(state));
      } catch (err) {
        console.warn('LocalStorage limit exceeded:', err);
      }
    }
  }, [state]);

  const setProductionMode = (mode: ProductionMode) => {
    setState((prev) => ({
      ...prev,
      productionMode: mode,
    }));
  };

  const updateKitBatch = (patch: Partial<CalculatorState['kitBatch']>) => {
    setState((prev) => ({
      ...prev,
      kitBatch: { ...prev.kitBatch, ...patch },
    }));
  };

  const updateClientProject = (patch: Partial<CalculatorState['clientProject']>) => {
    setState((prev) => ({
      ...prev,
      clientProject: { ...prev.clientProject, ...patch },
    }));
  };

  const updateMaterialEquip = (patch: Partial<CalculatorState['materialEquip']>) => {
    setState((prev) => ({
      ...prev,
      materialEquip: { ...prev.materialEquip, ...patch },
    }));
  };

  const updateTimeEnergy = (patch: Partial<CalculatorState['timeEnergy']>) => {
    setState((prev) => ({
      ...prev,
      timeEnergy: { ...prev.timeEnergy, ...patch },
    }));
  };

  const updateWorkExtras = (patch: Partial<CalculatorState['workExtras']>) => {
    setState((prev) => ({
      ...prev,
      workExtras: { ...prev.workExtras, ...patch },
    }));
  };

  const updateMarketRisks = (patch: Partial<CalculatorState['marketRisks']>) => {
    setState((prev) => ({
      ...prev,
      marketRisks: { ...prev.marketRisks, ...patch },
    }));
  };

  // Image Upload handler with compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          updateClientProject({ referenceImage: dataUrl });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Preset Selectors
  const handleSelectPrinterPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = PRINTER_PRESETS.find((p) => p.id === e.target.value);
    if (preset) {
      updateMaterialEquip({
        printerValue: preset.price,
        lifespanHours: preset.lifespanHours,
      });
      updateTimeEnergy({
        avgPowerWatts: preset.powerWatts,
      });
    }
  };

  const handleSelectFilamentPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = FILAMENT_PRESETS.find((f) => f.id === e.target.value);
    if (preset) {
      updateMaterialEquip({
        filamentCostPerKg: preset.costPerKg,
      });
    }
  };

  // Direct PDF Export
  const handleDirectPdfExport = async () => {
    const targetElement = hiddenPdfRef.current;
    if (!targetElement) return;
    try {
      setIsExportingDirectPdf(true);
      const filename = `Orcamento_${state.clientProject.clientName || 'Cliente'}_${state.clientProject.projectName || 'Projeto'}.pdf`
        .replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      const elementToCapture = (targetElement.firstElementChild as HTMLElement) || targetElement;
      await generatePdfFromElement(elementToCapture, filename);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF. Experimente clicar em "Visualizar e Baixar PDF" para checar os detalhes.');
    } finally {
      setIsExportingDirectPdf(false);
    }
  };

  // New Project Reset
  const handleNewProject = () => {
    if (confirm('Deseja iniciar um novo projeto? Os dados atuais serão redefinidos para os valores padrão.')) {
      setState(INITIAL_STATE);
      setSaveNotification('Novo projeto iniciado!');
      setTimeout(() => setSaveNotification(null), 3000);
    }
  };

  // Save Project as JSON file
  const handleSaveJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Projeto_3D_${state.clientProject.projectName || 'Novo'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSaveNotification('Projeto salvo com sucesso!');
    setTimeout(() => setSaveNotification(null), 3000);
  };

  // Open / Import JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.materialEquip && json.timeEnergy) {
          setState({
            ...INITIAL_STATE,
            ...json,
            kitBatch: {
              ...INITIAL_STATE.kitBatch,
              ...(json.kitBatch || {}),
            },
          });
          setSaveNotification('Projeto importado com sucesso!');
          setTimeout(() => setSaveNotification(null), 3000);
        } else {
          alert('Arquivo JSON inválido para esta calculadora.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Copy WhatsApp summary message
  const handleCopyWhatsApp = () => {
    const text = `*Orçamento de Impressão 3D* 🖨️✨\n` +
      `*Cliente:* ${state.clientProject.clientName || 'Cliente'}\n` +
      `*Projeto:* ${state.clientProject.projectName || 'Peça Personalizada'}\n` +
      (state.clientProject.dimensions ? `*Dimensões:* ${state.clientProject.dimensions}\n` : '') +
      `*Quantidade Solicitada:* ${results.quantity} unidade(s)${isKitMode ? ' (Produção em Fornada / Kit)' : ''}\n` +
      `*Prazo de Produção:* ${state.clientProject.leadTimeDays || 3} dias úteis\n\n` +
      `*Valor Unitário:* ${formatBRL(results.unitSellingPrice)}\n` +
      (results.quantity > 1 ? `*Valor Total (${results.quantity} un):* ${formatBRL(results.totalSellingPrice)}\n` : '') +
      `\n*Condições:* PIX ou Cartão. Proposta válida por 15 dias.\n` +
      `_Dúvidas estamos à disposição!_`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 antialiased pb-16">
      {/* Top Application Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900">
                  Calculadora Bambu Lab
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                  A1 / P1S / X1C / FDM
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Precificação precisa para sua A1/A1 Mini e gerador de orçamentos em PDF
              </p>
            </div>
          </div>

          {/* Action Toolbar & Quick Inputs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Action Buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={handleNewProject}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                title="Iniciar Novo Projeto"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>NOVO</span>
              </button>

              <button
                onClick={() => jsonImportRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                title="Abrir Projeto Salvo (JSON)"
              >
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span>ABRIR</span>
              </button>
              <input
                type="file"
                ref={jsonImportRef}
                onChange={handleImportJson}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={handleSaveJson}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                title="Salvar Projeto em Arquivo"
              >
                <Save className="w-4 h-4 text-blue-500" />
                <span>SALVAR</span>
              </button>
            </div>

            {/* Quick Header Widget: Quantidade / Itens */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 flex flex-col justify-center min-w-[110px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isKitMode ? 'PEDIDO CLIENTE' : 'ITENS NO KIT'}
              </span>
              <HeaderQuantityInput
                value={isKitMode ? state.kitBatch.clientQuantity : state.clientProject.quantity}
                onChange={(val) => {
                  if (isKitMode) {
                    updateKitBatch({ clientQuantity: val });
                  } else {
                    updateClientProject({ quantity: val });
                  }
                }}
              />
            </div>

            {/* Quick Header Widget: Nome do Projeto */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 flex flex-col justify-center min-w-[150px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                PROJETO
              </span>
              <input
                type="text"
                value={state.clientProject.projectName}
                onFocus={(e) => e.target.select()}
                onChange={(e) => updateClientProject({ projectName: e.target.value })}
                placeholder="Nome do Projeto"
                className="text-sm font-bold text-slate-800 bg-transparent border-none p-0 focus:outline-none w-36 truncate"
              />
            </div>

            {/* Main Highlight: Gerar Orçamento PDF */}
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
            >
              <FileText className="w-4 h-4" />
              <span>GERAR ORÇAMENTO EM PDF</span>
            </button>
          </div>
        </div>

        {/* Floating Notification */}
        {saveNotification && (
          <div className="bg-emerald-600 text-white text-xs font-semibold py-1 px-4 text-center animate-in slide-in-from-top duration-200">
            {saveNotification}
          </div>
        )}
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {/* Production Mode Switcher */}
        <div className="mb-6 bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-slate-100 rounded-xl text-slate-700">
              <Boxes className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">Modo de Produção e Precificação</span>
              <p className="text-[11px] text-slate-500">
                Escolha se você está calculando uma peça única ou uma fornada/lote impresso junto na mesa.
              </p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setProductionMode('unit')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                !isKitMode
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4 text-slate-600" />
              <span>Peça Individual (Unitário)</span>
            </button>

            <button
              type="button"
              onClick={() => setProductionMode('kit')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                isKitMode
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Fornada / Kit de Peças</span>
            </button>
          </div>
        </div>

        {/* Informative Banner when in Fornada/Kit mode */}
        {isKitMode && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 shadow-sm flex items-start gap-3">
            <div className="p-1.5 bg-emerald-600 text-white rounded-lg mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900 text-sm">
                Modo Fornada / Kit Ativado 🧺
              </p>
              <p className="mt-0.5">
                Informe abaixo o <strong>peso total</strong> e o <strong>tempo total</strong> de impressão da <strong>mesa inteira</strong> (como informado no fatiador Bambu Studio / Cura). A calculadora rateará os custos entre as peças da fornada e calculará o valor exato a cobrar com base na <strong>quantidade solicitada pelo cliente</strong>, sem multiplicar indevidamente o tempo ou custo da máquina!
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT & CENTER: Input Cards (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Card 0: Dados do Cliente e Projeto */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    Dados do Cliente e Projeto
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">Informações para o Orçamento</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={state.clientProject.clientName}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateClientProject({ clientName: e.target.value })}
                    placeholder="Ex: João da Silva"
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Nome do Projeto / Peça
                  </label>
                  <input
                    type="text"
                    value={state.clientProject.projectName}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateClientProject({ projectName: e.target.value })}
                    placeholder="Ex: Chaveiro com NFC"
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Dimensões do Item
                  </label>
                  <input
                    type="text"
                    value={state.clientProject.dimensions}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateClientProject({ dimensions: e.target.value })}
                    placeholder="Ex: 150 x 42 x 2.5 mm"
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Special Kit / Fornada Control inputs inside Project Card */}
              {isKitMode && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-emerald-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                  <InputField
                    label="Peças na Fornada / Mesa (Lote)"
                    value={state.kitBatch.itemsPerBatch}
                    onChange={(v) => updateKitBatch({ itemsPerBatch: Math.max(1, parseInt(v) || 1) })}
                    suffix="peças"
                    min={1}
                  />

                  <InputField
                    label="Qtd. Solicitada pelo Cliente"
                    value={state.kitBatch.clientQuantity}
                    onChange={(v) => updateKitBatch({ clientQuantity: Math.max(1, parseInt(v) || 1) })}
                    suffix="unidades"
                    min={1}
                  />
                </div>
              )}

              {/* Image Upload Dropzone */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                {state.clientProject.referenceImage ? (
                  <div className="relative group w-24 h-24 rounded-xl border-2 border-emerald-500/50 overflow-hidden bg-slate-50 flex items-center justify-center shadow-sm">
                    <img
                      src={state.clientProject.referenceImage}
                      alt="Referência da peça 3D"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => updateClientProject({ referenceImage: null })}
                      className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      title="Remover foto"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-5 py-3 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl bg-slate-50/50 hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-2.5 text-xs font-bold text-slate-600 hover:text-emerald-700"
                  >
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Upload Foto da Peça 3D (Opcional p/ o Orçamento)</span>
                  </button>
                )}

                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={state.clientProject.serviceDescription}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateClientProject({ serviceDescription: e.target.value })}
                    placeholder="Descrição do serviço para o cliente no PDF (ex: Impressão 3D de alta qualidade com acabamento)..."
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Grid for Cards 1 & 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Material e Equipamento */}
              <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <Printer className="w-5 h-5" />
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        Material e Equipamento
                      </h2>
                    </div>
                  </div>

                  {/* Preset helpers */}
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Preset Impressora
                      </label>
                      <select
                        onChange={handleSelectPrinterPreset}
                        className="w-full mt-0.5 px-2 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-500"
                        defaultValue="bambu-a1-mini"
                      >
                        {PRINTER_PRESETS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Preset Filamento
                      </label>
                      <select
                        onChange={handleSelectFilamentPreset}
                        className="w-full mt-0.5 px-2 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-500"
                        defaultValue=""
                      >
                        <option value="" disabled>Selecionar Tipo...</option>
                        {FILAMENT_PRESETS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} (R$ {f.costPerKg}/kg)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 4 Inputs */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <InputField
                      label="Custo Filamento"
                      value={state.materialEquip.filamentCostPerKg}
                      onChange={(v) => updateMaterialEquip({ filamentCostPerKg: v })}
                      suffix="R$/kg"
                    />

                    <InputField
                      label={isKitMode ? 'Peso Total da Fornada' : 'Peso (Unitário)'}
                      value={state.materialEquip.partWeightG}
                      onChange={(v) => updateMaterialEquip({ partWeightG: v })}
                      suffix="g"
                    />

                    <InputField
                      label="Valor da Impressora"
                      value={state.materialEquip.printerValue}
                      onChange={(v) => updateMaterialEquip({ printerValue: v })}
                      suffix="R$"
                    />

                    <InputField
                      label="Vida Útil Est."
                      value={state.materialEquip.lifespanHours}
                      onChange={(v) => updateMaterialEquip({ lifespanHours: v })}
                      suffix="horas"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {isKitMode ? `Custo Mat. p/ peça (~${results.effectiveUnitWeightG.toFixed(1)}g):` : 'Custo Material:'}
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatBRL(results.unitMaterialCost)}
                  </span>
                </div>
              </section>

              {/* Card 2: Tempo e Energia */}
              <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <Zap className="w-5 h-5" />
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        Tempo e Energia
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <InputField
                      label={isKitMode ? 'Tempo Fornada (H)' : 'Tempo (Unitário) H'}
                      value={state.timeEnergy.printTimeHours}
                      onChange={(v) => updateTimeEnergy({ printTimeHours: v })}
                      suffix="h"
                      min={0}
                    />

                    <InputField
                      label={isKitMode ? 'Tempo Fornada (Min)' : 'Tempo (Unitário) Min'}
                      value={state.timeEnergy.printTimeMinutes}
                      onChange={(v) => updateTimeEnergy({ printTimeMinutes: v })}
                      suffix="min"
                      min={0}
                      max={59}
                    />

                    <InputField
                      label="Consumo Médio"
                      value={state.timeEnergy.avgPowerWatts}
                      onChange={(v) => updateTimeEnergy({ avgPowerWatts: v })}
                      suffix="W"
                    />

                    <InputField
                      label="Custo Energia"
                      value={state.timeEnergy.energyCostKwh}
                      onChange={(v) => updateTimeEnergy({ energyCostKwh: v })}
                      suffix="R$/kWh"
                      step={0.01}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {isKitMode ? `Energia/Deprec. p/ peça (~${results.effectiveUnitPrintTimeFormatted}):` : 'Energia + Depreciação:'}
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatBRL(results.unitEnergyDepreciationCost)}
                  </span>
                </div>
              </section>
            </div>

            {/* Grid for Cards 3 & 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 3: Trabalho e Extras */}
              <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <Clock className="w-5 h-5" />
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        Trabalho e Extras
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <InputField
                      label="Sua Hora de Trabalho"
                      value={state.workExtras.workHourlyRate}
                      onChange={(v) => updateWorkExtras({ workHourlyRate: v })}
                      suffix="R$"
                    />

                    <InputField
                      label={isKitMode ? 'Prep. Mesa / Fornada' : 'Tempo Prep. (Unitário)'}
                      value={state.workExtras.prepTimeMinutes}
                      onChange={(v) => updateWorkExtras({ prepTimeMinutes: v })}
                      suffix="min"
                    />

                    <InputField
                      label="Emb. (Total do Pedido)"
                      value={state.workExtras.packagingCost}
                      onChange={(v) => updateWorkExtras({ packagingCost: v })}
                      suffix="R$"
                    />

                    <InputField
                      label="Hardw. (por Peça)"
                      value={state.workExtras.extraHardwareCost}
                      onChange={(v) => updateWorkExtras({ extraHardwareCost: v })}
                      suffix="R$"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Mão de Obra + Extras (p/ peça):</span>
                  <span className="font-bold text-slate-800">
                    {formatBRL(results.unitLaborCost + results.unitExtrasCost)}
                  </span>
                </div>
              </section>

              {/* Card 4: Mercado e Riscos */}
              <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <TrendingUp className="w-5 h-5" />
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        Mercado e Riscos
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <InputField
                      label="Margem de Lucro"
                      value={state.marketRisks.profitMarginPercent}
                      onChange={(v) => updateMarketRisks({ profitMarginPercent: v })}
                      suffix="%"
                    />

                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField
                        label="Taxa Marketplace %"
                        value={state.marketRisks.marketplaceFeePercent}
                        onChange={(v) => updateMarketRisks({ marketplaceFeePercent: v })}
                        suffix="%"
                      />

                      <InputField
                        label="Taxa Fixa (ex: R$5)"
                        value={state.marketRisks.marketplaceFixedFee}
                        onChange={(v) => updateMarketRisks({ marketplaceFixedFee: v })}
                        suffix="R$"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField
                        label="Impostos (MEI)"
                        value={state.marketRisks.taxPercent}
                        onChange={(v) => updateMarketRisks({ taxPercent: v })}
                        suffix="%"
                      />

                      <InputField
                        label="Margem de Falha"
                        value={state.marketRisks.failureMarginPercent}
                        onChange={(v) => updateMarketRisks({ failureMarginPercent: v })}
                        suffix="%"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Risco de Falha p/ peça:</span>
                  <span className="font-bold text-amber-600">
                    {formatBRL(results.unitFailureRiskCost)}
                  </span>
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT COLUMN: Results Dashboard (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            {/* Card: PREÇO DE VENDA SUGERIDO */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden transition-all hover:shadow-md">
              <div className="h-1.5 bg-emerald-500 w-full"></div>

              <div className="p-6">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {isKitMode && results.quantity > 1
                    ? `VALOR A COBRAR DO CLIENTE (${results.quantity} UN)`
                    : 'PREÇO DE VENDA SUGERIDO'}
                </span>

                {/* Big Price */}
                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-xl font-bold text-slate-900">R$</span>
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    {(isKitMode && results.quantity > 1 ? results.totalSellingPrice : results.unitSellingPrice).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  {(!isKitMode && results.quantity > 1) && (
                    <span className="text-xs text-slate-500 font-semibold ml-1">/ un</span>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                    {state.marketRisks.profitMarginPercent}% Lucro
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                    Taxas Inclusas
                  </span>
                  {isKitMode && (
                    <span className="px-2.5 py-1 text-xs font-bold bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                      Fornada ({results.itemsPerBatch} un)
                    </span>
                  )}
                </div>

                {/* Lucro Líquido & Custo Produção do Pedido */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {results.quantity > 1 ? 'LUCRO DO PEDIDO' : 'LUCRO LÍQUIDO'}
                    </span>
                    <span className="text-lg font-black text-emerald-600">
                      {formatBRL(results.totalNetProfit)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {results.quantity > 1 ? 'CUSTO DO PEDIDO' : 'CUSTO PRODUÇÃO'}
                    </span>
                    <span className="text-lg font-black text-slate-800">
                      {formatBRL(results.totalProductionCost)}
                    </span>
                  </div>
                </div>

                {/* Breakdown details for Kit/Batch mode */}
                {isKitMode && (
                  <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-4 px-6 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Valor Unitário da Peça:</span>
                      <span className="font-bold text-slate-900">{formatBRL(results.unitSellingPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Valor da Fornada Inteira ({results.itemsPerBatch} un):</span>
                      <span className="font-semibold text-slate-700">{formatBRL(results.batchTotalSellingPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Tempo de impressão da fornada:</span>
                      <span className="font-medium text-slate-700">{state.timeEnergy.printTimeHours}h {state.timeEnergy.printTimeMinutes}m</span>
                    </div>
                  </div>
                )}

                {/* Unit mode with quantity > 1 */}
                {!isKitMode && results.quantity > 1 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-4 px-6">
                    <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
                      <span>Total do Pedido ({results.quantity} peças):</span>
                      <span className="text-base font-black text-emerald-600">
                        {formatBRL(results.totalSellingPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Lucro Líquido Total:</span>
                      <span className="font-bold text-emerald-700">
                        {formatBRL(results.totalNetProfit)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card: Detalhamento */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-slate-400">⚙️</span>
                <h3 className="text-sm font-bold text-slate-900">
                  Detalhamento Unitário (por peça)
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Material Total</span>
                  <span className="font-bold text-slate-900">
                    {formatBRL(results.unitMaterialCost)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1">
                    Energia + Depreciação
                    <span
                      title={`Energia: ${formatBRL(results.unitEnergyCost)} | Depreciação: ${formatBRL(results.unitDepreciationCost)}`}
                      className="cursor-help text-slate-400"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </span>
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatBRL(results.unitEnergyDepreciationCost)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Mão de Obra Total</span>
                  <span className="font-bold text-slate-900">
                    {formatBRL(results.unitLaborCost)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Embalagem + HW</span>
                  <span className="font-bold text-slate-900">
                    {formatBRL(results.unitExtrasCost)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Risco Falha ({state.marketRisks.failureMarginPercent}%)</span>
                  <span className="font-bold text-amber-600">
                    {formatBRL(results.unitFailureRiskCost)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100"></div>

                <div className="flex justify-between items-center text-slate-600">
                  <div>
                    <span>Taxas Marketplace</span>
                    <p className="text-[10px] text-slate-400">
                      {state.marketRisks.marketplaceFeePercent}% + {formatBRL(state.marketRisks.marketplaceFixedFee)}
                    </p>
                  </div>
                  <span className="font-bold text-red-500">
                    -{formatBRL(results.unitMarketplaceFee)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Impostos</span>
                  <span className="font-bold text-red-500">
                    -{formatBRL(results.unitTaxAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group"
              >
                <Eye className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Visualizar e Baixar PDF</span>
              </button>

              <button
                onClick={handleDirectPdfExport}
                disabled={isExportingDirectPdf}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>{isExportingDirectPdf ? 'Gerando arquivo PDF...' : 'Baixar PDF Direto'}</span>
              </button>

              <button
                onClick={handleCopyWhatsApp}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
              >
                {copiedWhatsApp ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Copiado para o WhatsApp!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    <span>Copiar Orçamento para WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Modal for Quote Preview and PDF Download */}
      <PdfPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        state={state}
        results={results}
        onUpdateClientProject={updateClientProject}
      />

      {/* Isolated clean offscreen template for 1-click direct download */}
      <div
        id="calculator-direct-download-target"
        style={{
          position: 'fixed',
          left: '0px',
          top: '0px',
          width: '794px',
          height: '1123px',
          zIndex: -20,
          pointerEvents: 'none',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <div ref={hiddenPdfRef}>
          <PdfQuoteTemplate state={state} results={results} />
        </div>
      </div>
    </div>
  );
};
