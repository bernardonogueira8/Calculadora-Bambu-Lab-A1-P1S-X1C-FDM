import React from 'react';
import type { CalculatorState, CalculationResults } from '../types/calculator';
import { formatBRL } from '../utils/calculations';

interface PdfQuoteTemplateProps {
  state: CalculatorState;
  results: CalculationResults;
  quoteNumber?: string;
  quoteDate?: string;
}

export const PdfQuoteTemplate: React.FC<PdfQuoteTemplateProps> = ({
  state,
  results,
  quoteNumber = `ORC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`,
  quoteDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
}) => {
  const { clientProject } = state;
  const validUntilDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      id="pdf-quote-content"
      className="bg-white text-slate-800 w-[794px] min-w-[794px] max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-8 sm:p-9 flex flex-col justify-between box-border overflow-hidden relative"
      style={{
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      {/* Explicit font style embed for html2canvas and printing */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        #pdf-quote-content, #pdf-quote-content * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
      `}</style>

      {/* ===================== SECTION 1: HEADER & TITLE ===================== */}
      <div>
        {/* Top Emerald Accent Bar */}
        <div className="w-full h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 rounded-full mb-3.5"></div>

        {/* Company Header */}
        <div className="flex justify-between items-start pb-3.5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              3D
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                {clientProject.companyName || 'Estúdio de Impressão 3D'}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {clientProject.companyContact || 'Prototipagem Rápida & Manufatura Aditiva'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200 uppercase tracking-wider mb-1">
              Proposta Comercial
            </span>
            <div className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">{quoteNumber}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Emissão: <span className="text-slate-700 font-semibold">{quoteDate}</span> | Validade:{' '}
              <span className="text-slate-700 font-semibold">{validUntilDate}</span>
            </p>
          </div>
        </div>

        {/* Proposal Title */}
        <div className="my-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Orçamento de Impressão 3D
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Apresentação comercial e técnica dos serviços de manufatura aditiva solicitados.
            </p>
          </div>
        </div>

        {/* ===================== SECTION 2: CLIENT & TECHNICAL SPECS ===================== */}
        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
          {/* Client Info Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Dados do Cliente
              </h3>
              <p className="text-base font-bold text-slate-900 leading-tight">
                {clientProject.clientName || 'Cliente Não Informado'}
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/80">
              <span className="text-[11px] text-slate-500">Projeto / Peça Solicitada:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {clientProject.projectName || 'Peça Personalizada'}
              </p>
            </div>
          </div>

          {/* Technical Specs Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Especificações Técnicas
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500 font-medium shrink-0">Dimensões:</span>
                <span className="font-bold text-slate-900 text-right break-words max-w-[210px]">
                  {clientProject.dimensions || 'Sob medida'}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500 font-medium shrink-0">Cor / Acabamento:</span>
                <span className="font-semibold text-slate-800 text-right">{clientProject.color || 'Padrão'}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500 font-medium shrink-0">Prazo de Produção:</span>
                <span className="font-semibold text-slate-800 text-right">{clientProject.leadTimeDays || 3} dias úteis</span>
              </div>
              <div className="flex justify-between items-baseline gap-2 pt-1 border-t border-slate-200/80">
                <span className="text-slate-500 font-medium shrink-0">Quantidade Solicitada:</span>
                <span className="font-extrabold text-emerald-700 text-sm text-right">
                  {results.quantity} unidade(s)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== SECTION 3: IMAGE & SERVICE DESCRIPTION ===================== */}
        <div className={`grid ${clientProject.referenceImage ? 'grid-cols-12' : 'grid-cols-1'} gap-3.5 mb-3.5`}>
          {clientProject.referenceImage && (
            <div className="col-span-5 p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between h-[175px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                Modelo de Referência
              </span>
              <div className="w-full flex-1 rounded-lg overflow-hidden bg-white border border-slate-200/80 flex items-center justify-center p-2 shadow-inner">
                {/* Fixed aspect ratio styling: prevents html2canvas from stretching images */}
                <img
                  src={clientProject.referenceImage}
                  alt="Referência do Projeto"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '135px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                  }}
                  className="rounded"
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          )}

          <div
            className={`${
              clientProject.referenceImage ? 'col-span-7' : 'col-span-1'
            } p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between ${
              clientProject.referenceImage ? 'h-[175px]' : ''
            }`}
          >
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Descrição do Serviço
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {clientProject.serviceDescription ||
                  'Serviço de impressão 3D em alta resolução FDM com acabamento profissional e remoção limpa de suportes.'}
              </p>
            </div>

            {clientProject.notes && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-700">Observações:</span> {clientProject.notes}
              </div>
            )}
          </div>
        </div>

        {/* ===================== SECTION 4: FINANCIAL TABLE ===================== */}
        <div className="mb-3.5 overflow-hidden rounded-xl border border-slate-200/90">
          <table className="w-full table-fixed text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-xs">
                <th className="py-2.5 px-3.5 w-[8%] text-slate-500">Item</th>
                <th className="py-2.5 px-3.5 w-[50%]">Descrição do Serviço / Produto</th>
                <th className="py-2.5 px-3.5 text-center w-[12%]">Qtd</th>
                <th className="py-2.5 px-3.5 text-right w-[15%]">Valor Unit.</th>
                <th className="py-2.5 px-3.5 text-right w-[15%]">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-white">
                <td className="py-3 px-3.5 font-bold text-slate-400">01</td>
                <td className="py-3 px-3.5 font-medium text-slate-800">
                  <span className="font-bold text-slate-900 text-sm">
                    {clientProject.projectName || 'Peça Personalizada'}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {clientProject.dimensions ? `Dimensões: ${clientProject.dimensions} • ` : ''}
                    Cor: {clientProject.color || 'Padrão'} • Embalagem segura inclusa
                  </p>
                </td>
                <td className="py-3 px-3.5 text-center font-bold text-slate-800 text-sm">
                  {results.quantity} un
                </td>
                <td className="py-3 px-3.5 text-right font-semibold text-slate-700">
                  {formatBRL(results.unitSellingPrice)}
                </td>
                <td className="py-3 px-3.5 text-right font-extrabold text-slate-900 text-sm">
                  {formatBRL(results.totalSellingPrice)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===================== SECTION 5: PAYMENT INFO & TOTALS (BALANCED 2 COLUMNS) ===================== */}
        <div className="grid grid-cols-12 gap-3.5 mb-3.5">
          {/* Payment Terms & Instructions Card (Left Column) */}
          <div className="col-span-7 rounded-xl bg-slate-50 border border-slate-200/90 p-3 flex flex-col justify-between text-xs">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Condições de Pagamento & Faturamento
              </h4>
              <div className="space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <p>
                  • <strong>Condição:</strong> 50% de entrada na confirmação e 50% na conclusão/entrega.
                </p>
                <p>
                  • <strong>Métodos Aceitos:</strong> PIX, Transferência Bancária ou Cartão.
                </p>
                <p>
                  • <strong>Chave PIX / Contato:</strong>{' '}
                  <span className="font-semibold text-slate-800">{clientProject.companyContact || 'Consultar atendimento'}</span>
                </p>
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-200/80 text-[11px] text-slate-500">
              Frete e envio: calculado separadamente ou com retirada presencial sob agendamento.
            </div>
          </div>

          {/* Totals Summary Card (Right Column) */}
          <div className="col-span-5 rounded-xl bg-slate-50 border border-slate-200/90 p-3.5 flex flex-col justify-between">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">{formatBRL(results.totalSellingPrice)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span>Frete / Envio:</span>
                <span className="font-semibold text-slate-800">A combinar / Retirada</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-900 uppercase">VALOR TOTAL:</span>
                <span className="text-xl font-black text-emerald-600 tracking-tight">
                  {formatBRL(results.totalSellingPrice)}
                </span>
              </div>
              {results.quantity > 1 && (
                <p className="text-[11px] text-right text-slate-500 mt-0.5">
                  ({formatBRL(results.unitSellingPrice)} / unidade)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== SECTION 6: TERMS & SIGNATURE FOOTER ===================== */}
      <div>
        {/* Terms & Conditions Card */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600 space-y-1 mb-3.5">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
            Termos, Prazos e Garantia Comercial
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <p>• <strong>Prazo de Produção:</strong> {clientProject.leadTimeDays || 3} dias úteis após confirmação.</p>
            <p>• <strong>Validade da Proposta:</strong> 15 dias corridos ({validUntilDate}).</p>
            <p>• <strong>Garantia Técnica:</strong> Contra defeitos de fabricação e descolamento de camadas.</p>
            <p>• <strong>Cuidados:</strong> Evitar expor a peça a altas temperaturas acima de 60°C.</p>
          </div>
        </div>

        {/* Signatures / Formal Approval Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-800 text-xs">{clientProject.companyName || 'Estúdio de Impressão 3D'}</p>
            <p className="text-[11px] text-slate-500">{clientProject.companyContact || 'Atendimento e Suporte Técnico'}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Documento gerado para fins de proposta comercial</p>
          </div>
          <div className="text-center">
            <div className="w-52 border-b border-slate-400 mb-1.5"></div>
            <p className="text-[11px] text-slate-600 font-semibold">De acordo do Cliente</p>
            <p className="text-[10px] text-slate-400">Assinatura / Aprovação Formal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

