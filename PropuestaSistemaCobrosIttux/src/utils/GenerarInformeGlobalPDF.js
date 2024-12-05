import jsPDF from 'jspdf';
import 'jspdf-autotable';

const GenerarInformeGlobalPDF = (reportData) => {
  const doc = new jsPDF();

  // Título del informe sin color de fondo, solo borde negro
  doc.autoTable({
    startY: 20,
    body: [
      [{ content: "INFORME GLOBAL DE PAGOS", styles: { halign: 'center', fontSize: 16, lineColor: [0, 0, 0], lineWidth: 0.5 } }]
    ],
    theme: 'plain'
  });

  // Encabezado del informe sin color de fondo, solo bordes negros
  doc.autoTable({
    startY: doc.previousAutoTable.finalY + 5,
    theme: 'grid',
    styles: { fontSize: 10, halign: 'center', valign: 'middle', lineColor: [0, 0, 0], lineWidth: 0.5, fillColor: [255, 255, 255] },
    columnStyles: {
      0: { fillColor: [255, 255, 255] }, // Fondo blanco para etiquetas
      1: { fillColor: [255, 255, 255] }, // Fondo blanco para datos
      2: { fillColor: [255, 255, 255], cellPadding: 5 }  // Fondo blanco para comentarios
    },
    body: [
      [
        { content: reportData.reportName, colSpan: 2, styles: { fontSize: 12, textColor: [0, 0, 0] } },
        { content: "COMENTARIOS", styles: { textColor: [0, 0, 0] } }
      ],
      [
        "Fecha:", 
        reportData.date, 
        { content: reportData.comment || "SIN COMENTARIOS", rowSpan: 3, styles: { halign: 'left', valign: 'top' } }
      ],
      ["Generado Por:", reportData.adminName || "Admin desconocido"],
      ["Número de Reporte:", reportData.reportNumber]
    ]
  });

  // Espacio después del encabezado
  let y = doc.previousAutoTable.finalY + 10;

  // Agregar la tabla con los detalles del reporte global
  doc.autoTable({
    startY: y,
    head: [
      [
        { content: 'Índice', styles: { fillColor: [0, 49, 97], textColor: [255, 255, 255] } },
        { content: 'Fecha', styles: { fillColor: [0, 49, 97], textColor: [255, 255, 255] } },
        { content: 'Número de Control', styles: { fillColor: [0, 49, 97], textColor: [255, 255, 255] } },
        { content: 'Estudiante', styles: { fillColor: [0, 49, 97], textColor: [255, 255, 255] } },
        { content: 'Módulo Pagado', styles: { fillColor: [0, 49, 97], textColor: [255, 255, 255] } },
        { content: 'Mes', styles: { fillColor: [0, 49, 97], textColor: [255, 255, 255] } },
        { content: 'Método de Pago', styles: { fillColor: [0, 49, 97], textColor: [255, 255, 255] } },
        { content: 'Pago', styles: { fillColor: [0, 49, 97], textColor: [255, 255, 255] } },
      ]
    ],
    body: reportData.rows.map(row => [
      { content: row.index, styles: { halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 } },
      { content: row.date, styles: { halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 } },
      { content: row.control, styles: { halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 } },
      { content: row.student, styles: { halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 } },
      { content: row.module, styles: { halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 } },
      { content: row.month, styles: { halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 } },
      { content: row.method, styles: { halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 } },
      { content: `$${row.payment}`, styles: { halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 } },
    ]),
    theme: 'grid',
    styles: { halign: 'center', fontSize: 10, lineColor: [0, 0, 0], lineWidth: 0.5 },
    headStyles: { lineColor: [0, 0, 0], lineWidth: 0.5 }
  });

  // Sección de totales sin fondo, solo bordes negros
  doc.autoTable({
    startY: doc.previousAutoTable.finalY + 10,
    body: [
      [
        { content: 'Monto Total', styles: { fontStyle: 'bold', halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 } },
        { content: `Monto Total Final: $${Number(reportData.totalAmountFinal).toFixed(2)}`, colSpan: 7, styles: { halign: 'center', fontStyle: 'bold', lineColor: [0, 0, 0], lineWidth: 0.5 } }
      ],
    ],
    theme: 'grid',
    styles: { halign: 'center', fontSize: 10, lineColor: [0, 0, 0], lineWidth: 0.5 },
  });

  // Guardar el PDF
  doc.save(`${reportData.reportName}.pdf`);
};

export default GenerarInformeGlobalPDF;
