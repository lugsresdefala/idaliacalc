import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type CalculationRecord = {
  id: string;
  type: 'fertility' | 'gestational';
  calculatedAt: Date;
  result: any;
}

interface RecentCalculationsHistoryProps {
  calculations: CalculationRecord[];
  onSelect: (calculation: CalculationRecord) => void;
}

export function RecentCalculationsHistory({ 
  calculations, 
  onSelect 
}: RecentCalculationsHistoryProps) {
  if (calculations.length === 0) {
    return (
      <div className="glass-panel p-4 rounded-lg mb-4 text-blue-200">
        <p className="text-center text-sm">Nenhum cálculo recente encontrado.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-lg overflow-hidden mb-4">
      <div className="p-3 bg-blue-900/30 border-b border-blue-900/30">
        <h3 className="text-sm font-medium text-blue-200">Cálculos Recentes</h3>
      </div>
      <div className="divide-y divide-blue-900/20 max-h-[300px] overflow-auto">
        {calculations.map((calc) => (
          <div 
            key={calc.id} 
            className="p-3 hover:bg-blue-900/20 transition-colors cursor-pointer"
            onClick={() => onSelect(calc)}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs 
                  ${calc.type === 'fertility' ? 'bg-teal-800/40 text-teal-200' : 'bg-blue-800/40 text-blue-200'}`}
                >
                  {calc.type === 'fertility' ? 'Período Fértil' : 'Idade Gestacional'}
                </span>
                <p className="text-sm text-blue-300 mt-1 font-roboto-mono">
                  {calc.type === 'fertility' 
                    ? `Ovulação: ${format(calc.result.ovulationDay, "dd/MM", { locale: ptBR })}` 
                    : `${calc.result.weeks}sem ${calc.result.days}d`}
                </p>
              </div>
              <span className="text-xs text-blue-400">
                {format(calc.calculatedAt, "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentCalculationsHistory;