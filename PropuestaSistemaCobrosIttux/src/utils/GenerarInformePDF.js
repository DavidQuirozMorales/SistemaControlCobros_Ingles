import jsPDF from 'jspdf';
import 'jspdf-autotable';

const GenerarInformePDF = (reportData) => {
  const doc = new jsPDF();

  // Título del informe sin color de fondo, solo borde negro
  doc.autoTable({
    startY: 20,
    body: [
      [{ content: "INFORME DE GASTOS POR GRUPO Y MODULO", styles: { halign: 'center', fontSize: 16, lineColor: [0, 0, 0], lineWidth: 0.5 } }]
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
      ["Generado Por:", reportData.adminName],
      ["Modulos seleccionados:", reportData.modules.length]
    ]
  });

  // Espacio después del encabezado
  let y = doc.previousAutoTable.finalY + 10;

  // Detalles de módulos y grupos sin color de fondo, solo bordes negros
  reportData.modules.forEach((module) => {
    // Encabezado de cada módulo sin fondo, solo borde negro
    doc.autoTable({
      startY: y,
      body: [
        [{ content: ` ${module.modulo_nombre}`, styles: { halign: 'left', fontSize: 12, lineColor: [0, 0, 0], lineWidth: 0.5 } }]
      ],
      theme: 'plain'
    });

    const groupRows = (module.grupos || []).map((group) => [
      { content: ` ${group.grupo_nombre}`, styles: { halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 } },
      { content: `$${Number(group.monto_total_recaudado).toFixed(2)}`, styles: { halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 } },
      { content: group.estudiantes_activos, styles: { halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 } },
    ]);

    // Tabla de cada grupo con encabezados en color #003161
    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 5,
      head: [
        [
          { content: 'Grupo', styles: { fillColor: [0, 49, 97], textColor: [255, 255, 255] } },
          { content: 'Monto Recaudado', styles: { fillColor: [0, 49, 97], textColor: [255, 255, 255] } },
          { content: 'Estudiantes Activos', styles: { fillColor: [0, 49, 97], textColor: [255, 255, 255] } }
        ]
      ],
      body: groupRows,
      theme: 'grid',
      styles: { halign: 'center', fontSize: 10, lineColor: [0, 0, 0], lineWidth: 0.5 },
      headStyles: { lineColor: [0, 0, 0], lineWidth: 0.5 }
    });

    y = doc.previousAutoTable.finalY + 10; // Actualizar y para la siguiente tabla
  });

  // Sección de totales sin fondo, solo bordes negros
  doc.autoTable({
    startY: y,
    body: [
      [
        { content: 'Monto Total', styles: { fontStyle: 'bold', halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 } },
        { content: `Monto Total Final: $${Number(reportData.totalAmountFinal).toFixed(2)}`, colSpan: 2, styles: { halign: 'center', fontStyle: 'bold', lineColor: [0, 0, 0], lineWidth: 0.5 } }
      ],
    ],
    theme: 'grid',
    styles: { halign: 'center', fontSize: 10, lineColor: [0, 0, 0], lineWidth: 0.5 },
  });

  // Guardar el PDF
  doc.save(`${reportData.reportName}.pdf`);
};

export default GenerarInformePDF;
