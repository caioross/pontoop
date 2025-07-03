import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Github } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { TimesheetTable } from "@/components/TimesheetTable";
import { ExportButtons } from "@/components/ExportButtons";
import { SpotifyPlayer } from "@/components/SpotifyPlayer";
import { TimesheetChart } from "@/components/TimesheetChart";
import { ptBR } from "date-fns/locale";

export interface TimeEntry {
  id: string;
  date: string;
  entryTime: string;
  exitTime: string;
  totalHours: string;
}

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entryTime, setEntryTime] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('timesheet-data');
    if (saved) {
      setTimeEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('timesheet-data', JSON.stringify(timeEntries));
  }, [timeEntries]);

  const calculateTotalHours = (entry: string, exit: string) => {
    if (!entry || !exit) return "00:00";
    
    const [entryHour, entryMin] = entry.split(':').map(Number);
    const [exitHour, exitMin] = exit.split(':').map(Number);
    
    let totalMinutes = (exitHour * 60 + exitMin) - (entryHour * 60 + entryMin);
    
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // Handle overnight shifts
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleAddEntry = () => {
    if (!entryTime || !exitTime) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os horários de entrada e saída.",
        variant: "destructive"
      });
      return;
    }

    const totalHours = calculateTotalHours(entryTime, exitTime);
    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      date: format(selectedDate, "dd/MM/yyyy", { locale: ptBR }),
      entryTime,
      exitTime,
      totalHours
    };

    setTimeEntries(prev => [...prev, newEntry]);
    setEntryTime("");
    setExitTime("");
    
    toast({
      title: "Sucesso",
      description: "Registro adicionado com sucesso!",
    });
  };

  const handleDeleteEntry = (id: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
    toast({
      title: "Sucesso",
      description: "Registro removido com sucesso!",
    });
  };

  const handleImportData = (data: TimeEntry[]) => {
    setTimeEntries(data);
    toast({
      title: "Sucesso", 
      description: "Dados importados com sucesso!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 pb-32">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent">
            Cartão de Ponto
          </h1>
          <p className="text-gray-400">Sistema de controle de ponto moderno e eficiente</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lime-400 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Registrar Ponto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 hover:bg-gray-600",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="entry">Entrada</Label>
                <Input
                  id="entry"
                  type="time"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="bg-gray-700 border-gray-600 focus:border-lime-400"
                />
              </div>

              <div>
                <Label htmlFor="exit">Saída</Label>
                <Input
                  id="exit"
                  type="time"
                  value={exitTime}
                  onChange={(e) => setExitTime(e.target.value)}
                  className="bg-gray-700 border-gray-600 focus:border-lime-400"
                />
              </div>

              <Button 
                onClick={handleAddEntry}
                className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-semibold"
              >
                Adicionar Registro
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <ExportButtons 
              timeEntries={timeEntries}
              onImportData={handleImportData}
            />
          </div>
        </div>

        <div className="mb-8">
          <TimesheetChart timeEntries={timeEntries} />
        </div>

        <TimesheetTable 
          timeEntries={timeEntries}
          onDeleteEntry={handleDeleteEntry}
        />
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <span>Feito com ♥ por uma IA</span>
          </div>
          
          <SpotifyPlayer />
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('https://github.com', '_blank')}
              className="text-gray-400 hover:text-white"
            >
              <Github className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
