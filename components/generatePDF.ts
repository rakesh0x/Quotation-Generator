import jsPDF from "jspdf";
import "jspdf-autotable";
import { applyPlugin } from "jspdf-autotable";
applyPlugin(jsPDF);

export type QuotationData = {
  client_name: string;
  invoice_id: string;
  item_cost_inr: number;
  sales_markup_percentage: number;
  selling_price_inr: number;
  gross_profit_inr: number;
};

export function generatePDF(data: QuotationData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const L = 20;        // left margin x
  const R = pageWidth - 20; // right margin x

  // ── Colour tokens ─────────────────────────────────────────────────────────
  const ink: [number, number, number] = [17, 17, 17];
  const sub: [number, number, number] = [120, 120, 120];
  const border: [number, number, number] = [220, 220, 220];

  const fmt = (n: number) =>
    "₹ " +
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ─────────────────────────────────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────────────────────────────────
  let y = 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...ink);
  doc.text("KFM Enterprises", L, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...sub);
  doc.text("Proforma Invoice", R, y, { align: "right" });

  y += 5;
  doc.setDrawColor(...border);
  doc.setLineWidth(0.3);
  doc.line(L, y, R, y);

  // ─────────────────────────────────────────────────────────────────────────
  // META
  // ─────────────────────────────────────────────────────────────────────────
  y += 10;

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...sub);
  doc.text("Invoice number", L, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...ink);
  doc.text(data.invoice_id, L, y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...sub);
  doc.text("Date of issue", R, y, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...ink);
  doc.text(dateStr, R, y + 5.5, { align: "right" });

  // ─────────────────────────────────────────────────────────────────────────
  // BILL TO
  // ─────────────────────────────────────────────────────────────────────────
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...sub);
  doc.text("Bill to", L, y);

  y += 5.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...ink);
  doc.text(data.client_name, L, y);

  // ─────────────────────────────────────────────────────────────────────────
  // LINE ITEMS TABLE
  // ─────────────────────────────────────────────────────────────────────────
  y += 14;

  const markup = data.selling_price_inr - data.item_cost_inr;

  (doc as any).autoTable({
    startY: y,
    margin: { left: L, right: 20 },
    head: [["Description", "Amount"]],
    body: [
      ["Item cost", fmt(data.item_cost_inr)],
      [`Markup (${data.sales_markup_percentage}%)`, fmt(markup)],
    ],
    theme: "plain",
    headStyles: {
      fillColor: false,
      textColor: sub,
      fontStyle: "normal",
      fontSize: 7.5,
      cellPadding: { top: 0, bottom: 4, left: 0, right: 0 },
    },
    bodyStyles: {
      fontSize: 10,
      textColor: ink,
      fontStyle: "normal",
      cellPadding: { top: 5, bottom: 5, left: 0, right: 0 },
      lineColor: border,
      lineWidth: { bottom: 0.3 },
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 50, halign: "right" },
    },
    didParseCell: (hookData: any) => {
      if (hookData.section === "head") {
        hookData.cell.styles.lineWidth = { bottom: 0.3 };
        hookData.cell.styles.lineColor = border;
      }
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TOTALS
  // ─────────────────────────────────────────────────────────────────────────
  let ty = (doc as any).lastAutoTable.finalY + 8;

  const labelX = R - 50;
  const valueX = R;
  const rowGap = 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...sub);
  doc.text("Subtotal", labelX, ty);
  doc.setTextColor(...ink);
  doc.text(fmt(data.item_cost_inr), valueX, ty, { align: "right" });

  ty += rowGap;
  doc.setTextColor(...sub);
  doc.text(`Markup (${data.sales_markup_percentage}%)`, labelX, ty);
  doc.setTextColor(...ink);
  doc.text(fmt(markup), valueX, ty, { align: "right" });

  ty += 4;
  doc.setDrawColor(...border);
  doc.setLineWidth(0.3);
  doc.line(labelX, ty, R, ty);

  ty += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text("Total", labelX, ty);
  doc.text(fmt(data.selling_price_inr), valueX, ty, { align: "right" });

  // ─────────────────────────────────────────────────────────────────────────
  // GROSS PROFIT
  // ─────────────────────────────────────────────────────────────────────────
  ty += 14;
  doc.setDrawColor(...border);
  doc.setLineWidth(0.3);
  doc.line(L, ty - 4, R, ty - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...sub);
  doc.text("Gross profit", L, ty);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...ink);
  doc.text(fmt(data.gross_profit_inr), R, ty, { align: "right" });

  const marginPct = ((data.gross_profit_inr / data.selling_price_inr) * 100).toFixed(1);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...sub);
  doc.text(`${marginPct}% margin`, L, ty + 5);

  // ─────────────────────────────────────────────────────────────────────────
  // FOOTER
  // ─────────────────────────────────────────────────────────────────────────
  const footerY = pageHeight - 16;
  doc.setDrawColor(...border);
  doc.setLineWidth(0.3);
  doc.line(L, footerY, R, footerY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...sub);
  doc.text("KFM Enterprises", L, footerY + 6);
  doc.text(
    "Computer-generated document. No signature required.",
    R,
    footerY + 6,
    { align: "right" }
  );

  doc.save(`${data.invoice_id}.pdf`);
}