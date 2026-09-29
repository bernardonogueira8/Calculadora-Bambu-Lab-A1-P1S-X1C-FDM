import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generatePdfFromElement(
  element: HTMLElement,
  filename: string = 'Orcamento_Impressao_3D.pdf'
): Promise<void> {
  try {
    // 1. Ensure all web fonts (especially 'Inter') are fully loaded and decoded
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await document.fonts.ready;
    }

    // 2. Allow any pending layout or image paint to finish
    await new Promise((resolve) => setTimeout(resolve, 100));

    let imgData: string;

    try {
      // Primary: html-to-image uses the browser's native C++ layout engine (SVG foreignObject)
      // This produces a 100% pixel-perfect replica of the screen preview with zero crooked components
      imgData = await toPng(element, {
        width: 794,
        height: 1123,
        pixelRatio: 2.5, // 240+ DPI crystal clear quality
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
    } catch (toImageErr) {
      console.warn('html-to-image notice, trying fallback canvas:', toImageErr);
      // Fallback: html2canvas
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
      });
      imgData = canvas.toDataURL('image/png');
    }

    // 3. Create standard A4 PDF (210 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm

    // 4. Add lossless image covering exact 210 x 297 mm A4
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

    // 5. Direct browser download
    pdf.save(filename);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}


