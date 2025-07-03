
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, FileUp, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TimeEntry } from "@/pages/Index";
import { useRef } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

interface ExportButtonsProps {
  timeEntries: TimeEntry[];
  onImportData: (data: TimeEntry[]) => void;
}

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const ExportButtons = ({ timeEntries, onImportData }: ExportButtonsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToJSON = () => {
    const dataStr = JSON.stringify(timeEntries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cartao_ponto_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Sucesso",
      description: "Dados exportados para JSON!",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Cartão de Ponto', 20, 20);
    
    // Add generation date
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);
    
    // Prepare table data
    const tableData = timeEntries.map(entry => [
      entry.date,
      entry.entryTime,
      entry.exitTime,
      entry.totalHours
    ]);
    
    // Add table
    doc.autoTable({
      startY: 45,
      head: [['Data', 'Entrada', 'Saída', 'Total do Dia']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [132, 204, 22] }, // lime-500
      styles: { fontSize: 10 }
    });
    
    // Add summary
    const totalHours = calculateTotalHours();
    const finalY = (doc as any).lastAutoTable.finalY || 45;
    
    doc.setFontSize(12);
    doc.text(`Dias trabalhados: ${timeEntries.length}`, 20, finalY + 20);
    doc.text(`Total de horas: ${totalHours}`, 20, finalY + 35);
    
    doc.save(`cartao_ponto_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Sucesso",
      description: "PDF gerado com sucesso!",
    });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(timeEntries.map(entry => ({
      Data: entry.date,
      Entrada: entry.entryTime,
      'Saída': entry.exitTime,
      'Total do Dia': entry.totalHours
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cartão de Ponto");
    
    // Add summary sheet
    const summaryData = [
      { Métrica: 'Dias trabalhados', Valor: timeEntries.length },
      { Métrica: 'Total de horas', Valor: calculateTotalHours() },
      { Métrica: 'Média por dia', Valor: calculateAverageHours() }
    ];
    
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Resumo");
    
    XLSX.writeFile(wb, `cartao_ponto_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Sucesso",
      description: "Planilha Excel gerada com sucesso!",
    });
  };

  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data) && data.every(item => 
          typeof item === 'object' && 
          'id' in item && 
          'date' in item && 
          'entryTime' in item && 
          'exitTime' in item && 
          'totalHours' in item
        )) {
          onImportData(data);
        } else {
          throw new Error('Formato inválido');
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Arquivo JSON inválido!",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const calculateTotalHours = () => {
    let totalMinutes = 0;
    timeEntries.forEach(entry => {
      const [hours, minutes] = entry.totalHours.split(':').map(Number);
      totalMinutes += hours * 60 + minutes;
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const calculateAverageHours = () => {
    if (timeEntries.length === 0) return "00:00";
    let totalMinutes = 0;
    timeEntries.forEach(entry => {
      const [hours, minutes] = entry.totalHours.split(':').map(Number);
      totalMinutes += hours * 60 + minutes;
    });
    const avgMinutes = Math.floor(totalMinutes / timeEntries.length);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Button
        onClick={exportToJSON}
        className="bg-blue-600 hover:bg-blue-700 text-white"
        disabled={timeEntries.length === 0}
      >
        <FileDown className="w-4 h-4 mr-2" />
        JSON
      </Button>
      
      <Button
        onClick={exportToPDF}
        className="bg-red-600 hover:bg-red-700 text-white"
        disabled={timeEntries.length === 0}
      >
        <FileText className="w-4 h-4 mr-2" />
        PDF
      </Button>
      
      <Button
        onClick={exportToExcel}
        className="bg-green-600 hover:bg-green-700 text-white"
        disabled={timeEntries.length === 0}
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Excel
      </Button>
      
      <div>
        <Input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={importFromJSON}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          <FileUp className="w-4 h-4 mr-2" />
          Importar
        </Button>
      </div>
    </div>
  );
};
