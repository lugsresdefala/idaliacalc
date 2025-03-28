export interface DataExplanationProps {
  type: 'fertility' | 'gestational';
}

export function DataExplanation({ type }: DataExplanationProps) {
  return (
    <div className="glass-panel p-4 rounded-lg animation-fade-in">
      <h3 className="text-sm font-medium text-teal-300 mb-2">
        Como Interpretar os Resultados
      </h3>
      
      {type === 'fertility' ? (
        <div className="text-sm text-blue-200 space-y-2">
          <p><span className="text-teal-300 font-medium">Janela Fértil:</span> Período de 6 dias com maior probabilidade de concepção, incluindo 5 dias antes da ovulação e o dia da ovulação.</p>
          <p><span className="text-teal-300 font-medium">Dia da Ovulação:</span> Momento em que o óvulo é liberado e está disponível para fertilização por aproximadamente 24 horas.</p>
          <p><span className="text-teal-300 font-medium">Muco Cervical:</span> Durante o período fértil, o muco se torna transparente e elástico (semelhante à clara de ovo) para facilitar o transporte de espermatozoides.</p>
          <p><span className="text-teal-300 font-medium">Temperatura Basal:</span> Aumenta ligeiramente (0.2°C a 0.5°C) após a ovulação e permanece elevada até o próximo ciclo.</p>
        </div>
      ) : (
        <div className="text-sm text-blue-200 space-y-2">
          <p><span className="text-teal-300 font-medium">Idade Gestacional:</span> Calculada a partir do primeiro dia da última menstruação, não do momento da concepção (que ocorre aproximadamente 2 semanas depois).</p>
          <p><span className="text-teal-300 font-medium">Trimestres:</span> A gestação é dividida em três períodos de aproximadamente 13 semanas cada, com características de desenvolvimento específicas.</p>
          <p><span className="text-teal-300 font-medium">Data Provável do Parto (DPP):</span> Estimativa baseada em um ciclo de 40 semanas (280 dias) a partir da última menstruação. Apenas 5% dos bebês nascem exatamente na data prevista.</p>
          <p><span className="text-teal-300 font-medium">Marcos de Desenvolvimento:</span> Momentos importantes do desenvolvimento fetal que ocorrem em semanas específicas da gestação.</p>
        </div>
      )}
    </div>
  );
}

export default DataExplanation;