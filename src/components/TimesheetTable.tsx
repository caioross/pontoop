
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeEntry } from "@/pages/Index";

interface TimesheetTableProps {
  timeEntries: TimeEntry[];
  onDeleteEntry: (id: string) => void;
}

export const TimesheetTable = ({ timeEntries, onDeleteEntry }: TimesheetTableProps) => {
  const getTotalHours = () => {
    let totalMinutes = 0;
    
    timeEntries.forEach(entry => {
      const [hours, minutes] = entry.totalHours.split(':').map(Number);
      totalMinutes += hours * 60 + minutes;
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getWorkedDays = () => {
    return timeEntries.length;
  };

  const getAverageHours = () => {
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-lime-500/20 to-green-500/20 border-lime-500/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-lime-400">{getWorkedDays()}</div>
              <div className="text-sm text-gray-400">Dias trabalhados</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{getTotalHours()}</div>
              <div className="text-sm text-gray-400">Horas totais</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{getAverageHours()}</div>
              <div className="text-sm text-gray-400">Média por dia</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lime-400">Registros de Ponto</CardTitle>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro encontrado</p>
              <p className="text-sm">Adicione seu primeiro registro de ponto acima</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-lime-400">Data</TableHead>
                    <TableHead className="text-lime-400">Entrada</TableHead>
                    <TableHead className="text-lime-400">Saída</TableHead>
                    <TableHead className="text-lime-400">Total do Dia</TableHead>
                    <TableHead className="text-lime-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id} className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="font-medium">{entry.date}</TableCell>
                      <TableCell className="text-green-400">{entry.entryTime}</TableCell>
                      <TableCell className="text-red-400">{entry.exitTime}</TableCell>
                      <TableCell className="font-semibold text-lime-400">{entry.totalHours}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteEntry(entry.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
