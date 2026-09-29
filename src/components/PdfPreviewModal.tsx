import React, { useRef, useState } from 'react';
import type { CalculatorState, CalculationResults } from '../types/calculator';
import { PdfQuoteTemplate } from './PdfQuoteTemplate';
import { generatePdfFromElement } from '../utils/pdfGenerator';
import { Download, Printer, X, Check, Loader2, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: CalculatorState;
  results: CalculationResults;
  onUpdateClientProject: (data: Partial<CalculatorState['clientProject']>) => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  state,
  results,
  onUpdateClientProject,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [zoom, setZoom] = useState(0.72); // Default 72% fits modal column perfectly
  const cleanOffscreenRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    // Target the clean unscaled template element at (0,0) for exact 1:1 replica of the preview
    const targetElement = cleanOffscreenRef.current;
    if (!targetElement) return;

    try {
      setIsGenerating(true);
      const filename = `Orcamento_${state.clientProject.clientName || 'Cliente'}_${state.clientProject.projectName || 'Projeto'}.pdf`
        .replace(/[^a-zA-Z0-9_\-\.]/g, '_');

      // Use the actual template element (#pdf-quote-content)
      const elementToCapture = (targetElement.firstElementChild as HTMLElement) || targetElement;
      await generatePdfFromElement(elementToCapture, filename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Houve um erro ao gerar o arquivo PDF. Por favor, tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Top Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight">Pré-visualização do Orçamento (A4)</h3>
              <p className="text-xs text-slate-400">Verifique a proposta comercial e proporções antes de exportar o arquivo PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left customizer controls, Right PDF preview */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Customizer Sidebar */}
          <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 self-start">
            <h4 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center justify-between">
              <span>Personalizar Cabeçalho</span>
              <span className="text-[10px] text-emerald-600 font-semibold uppercase">Tempo Real</span>
            </h4>

            <div>
              <label className="text-xs font-semibold text-slate-600">Sua Marca / Empresa</label>
              <input
                type="text"
                value={state.clientProject.companyName}
                onFocus={(e) => e.target.select()}
                onChange={(e) => onUpdateClientProject({ companyName: e.target.value })}
                placeholder="Ex: Prime 3D Studio"
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Contato / WhatsApp / Redes</label>
              <input
                type="text"
                value={state.clientProject.companyContact}
                onFocus={(e) => e.target.select()}
                onChange={(e) => onUpdateClientProject({ companyContact: e.target.value })}
                placeholder="Ex: (11) 99999-9999 | @seu_studio"
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Prazo (Dias)</label>
                <input
                  type="number"
                  min="1"
                  value={state.clientProject.leadTimeDays || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateClientProject({ leadTimeDays: val === '' ? 0 : parseInt(val) || 0 });
                  }}
                  onBlur={() => {
                    if (!state.clientProject.leadTimeDays || state.clientProject.leadTimeDays < 1) {
                      onUpdateClientProject({ leadTimeDays: 1 });
                    }
                  }}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Cor / Acabamento</label>
                <input
                  type="text"
                  value={state.clientProject.color || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => onUpdateClientProject({ color: e.target.value })}
                  placeholder="Ex: Preto"
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Dimensões do Item</label>
              <input
                type="text"
                value={state.clientProject.dimensions || ''}
                onFocus={(e) => e.target.select()}
                onChange={(e) => onUpdateClientProject({ dimensions: e.target.value })}
                placeholder="Ex: 150 x 42 x 2.5 mm"
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Descrição do Serviço</label>
              <textarea
                rows={3}
                value={state.clientProject.serviceDescription}
                onFocus={(e) => e.target.select()}
                onChange={(e) => onUpdateClientProject({ serviceDescription: e.target.value })}
                placeholder="Descrição técnica detalhada..."
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Observações adicionais</label>
              <textarea
                rows={2}
                value={state.clientProject.notes}
                onFocus={(e) => e.target.select()}
                onChange={(e) => onUpdateClientProject({ notes: e.target.value })}
                placeholder="Ex: Peça para uso decorativo, não expor ao sol..."
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              💡 <em>O orçamento oculta seus custos internos (luz, filamento, taxa de falha) e exibe somente a proposta comercial formal ao cliente.</em>
            </div>
          </div>

          {/* PDF Paper Preview: Perfectly Scaled Sheet */}
          <div className="lg:col-span-8 flex flex-col items-center">
            {/* Zoom Controls Toolbar */}
            <div className="flex items-center justify-between w-full max-w-[580px] mb-3 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600">
              <span className="font-bold text-slate-700 text-[11px]">Visualização Folha A4</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.45, Math.round((z - 0.08) * 100) / 100))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-700"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-800 w-10 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.0, Math.round((z + 0.08) * 100) / 100))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-700"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(0.72)}
                  className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100"
                >
                  Ajustar
                </button>
              </div>
            </div>

            {/* Document Paper Container: Scaled cleanly without horizontal overflow */}
            <div
              className="shadow-2xl rounded-xl border border-slate-300 bg-white"
              style={{
                width: `${794 * zoom}px`,
                height: `${1123 * zoom}px`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  width: '794px',
                  height: '1123px',
                }}
              >
                <PdfQuoteTemplate state={state} results={results} />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Folha A4 proporcional (210 x 297 mm) • Sem margens cortadas</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              Voltar e Editar
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5 border border-slate-300 shadow-sm"
              title="Abre a janela de impressão nativa do navegador (Salvar como PDF com texto 100% vetorial e nítido)"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Imprimir / PDF Vetorial
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando PDF...
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  PDF Baixado!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Baixar Orçamento em PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Clean Render Target & Single Print Root:
          Positioned at (0,0) behind the modal backdrop (zIndex: -10)
          No CSS transforms, exact 794px x 1123px, in active viewport flow.
          Used for both single-page print and pixel-perfect toPng PDF export */}
      <div
        id="single-print-root"
        style={{
          position: 'fixed',
          left: '0px',
          top: '0px',
          width: '794px',
          minWidth: '794px',
          maxWidth: '794px',
          height: '1123px',
          minHeight: '1123px',
          maxHeight: '1123px',
          zIndex: -10,
          pointerEvents: 'none',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <div ref={cleanOffscreenRef}>
          <PdfQuoteTemplate state={state} results={results} />
        </div>
      </div>
    </div>
  );
};
