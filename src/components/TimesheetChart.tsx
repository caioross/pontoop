
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TimeEntry } from "@/pages/Index";
import { BarChart3 } from "lucide-react";

interface TimesheetChartProps {
  timeEntries: TimeEntry[];
}

export const TimesheetChart = ({ timeEntries }: TimesheetChartProps) => {
  const chartData = timeEntries.map(entry => {
    const [hours, minutes] = entry.totalHours.split(':').map(Number);
    const totalHours = hours + minutes / 60;
    
    return {
      date: entry.date,
      hours: parseFloat(totalHours.toFixed(2)),
      displayHours: entry.totalHours
    };
  }).slice(-10); // Show only last 10 entries

  const chartConfig = {
    hours: {
      label: "Horas",
      color: "hsl(var(--chart-1))",
    },
  };

  if (timeEntries.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lime-400 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Gráfico de Horas Trabalhadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado para exibir</p>
            <p className="text-sm">Adicione registros de ponto para ver o gráfico</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lime-400 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Gráfico de Horas Trabalhadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                label={{ value: 'Horas', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
              />
              <ChartTooltip
                content={<ChartTooltipContent 
                  formatter={(value, name) => [
                    typeof value === 'number' ? `${value.toFixed(2)}h` : value,
                    'Horas trabalhadas'
                  ]}
                  labelFormatter={(label) => `Data: ${label}`}
                />}
              />
              <Bar 
                dataKey="hours" 
                fill="#84cc16"
                radius={[4, 4, 0, 0]}
                name="Horas"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
