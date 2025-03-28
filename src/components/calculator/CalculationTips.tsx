export interface CalculationTipsProps {
  type: 'fertility' | 'gestational';
}

export function CalculationTips({ type }: CalculationTipsProps) {
  return (
    <div className="glass-panel p-4 rounded-lg mb-4">
      <h3 className="text-sm font-medium text-teal-300 mb-2">Dicas para Cálculo Preciso</h3>
      
      {type === 'fertility' ? (
        <div className="space-y-2 text-sm text-blue-200">
          <p>• Registre seus ciclos anteriores para cálculos personalizados</p>
          <p>• Observe mudanças no muco cervical para confirmar o período fértil</p>
          <p>• Monitore sua temperatura basal para identificar a ovulação</p>
          <p>• Ciclos menstruais podem variar naturalmente em até 7 dias</p>
        </div>
      ) : (
        <div className="space-y-2 text-sm text-blue-200">
          <p>• Use a data da última menstruação para cálculos iniciais</p>
          <p>• Atualize com dados de ultrassom para maior precisão</p>
          <p>• O padrão médico considera 40 semanas para uma gestação completa</p>
          <p>• A margem de erro do cálculo é de aproximadamente 5 dias</p>
        </div>
      )}
    </div>
  );
}

export default CalculationTips;