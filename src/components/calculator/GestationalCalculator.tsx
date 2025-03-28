import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  calculateGestationalAgeFromLMP,
  calculateGestationalAgeFromUltrasound,
  calculateGestationalAgeFromTransfer,
  estimateFoetalHeadCircumference,
  estimateFoetalLength,
  estimateFoetalWeight
} from "@/lib/calculationUtils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { saveCalculation } from "@/lib/calculationHistoryStorage";
import { motion } from "framer-motion";

interface GestationalCalculatorProps {
  onCalculate?: () => void;
}

type GestationalPhase = {
  title: string;
  description: string;
  embryoDevelopment: string;
  gestationalChanges: string;
  keyMilestones: string[];
  recommendations: string[];
  risksToMonitor: string[];
  fetalMeasurements?: {
    headCircumference?: number;
    length?: number;
    weight?: number;
  };
};

const GestationalCalculator = ({ onCalculate }: GestationalCalculatorProps) => {
  const [method, setMethod] = useState<"lmp" | "usg" | "transfer">("lmp");
  const [lmpDate, setLmpDate] = useState<Date | undefined>(undefined);
  const [usgDate, setUsgDate] = useState<Date | undefined>(undefined);
  const [usgWeeks, setUsgWeeks] = useState<number>(0);
  const [usgDays, setUsgDays] = useState<number>(0);
  const [transferDate, setTransferDate] = useState<Date | undefined>(undefined);
  const [embryoDays, setEmbryoDays] = useState<number>(5);
  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);
  const [currentGestationalPhase, setCurrentGestationalPhase] = useState<GestationalPhase | null>(null);

  // Resetar o status de salvamento quando os resultados mudarem
  useEffect(() => {
    if (results) {
      setHistorySaved(false);
      updateGestationalPhaseInfo(results.weeks);
    }
  }, [results]);

  const saveToHistory = () => {
    if (!results || historySaved) return;
    
    saveCalculation('gestational', results);
    setHistorySaved(true);
    
    if (onCalculate) {
      onCalculate();
    }
  };

  // Função para obter informações detalhadas sobre a fase gestacional atual
  const updateGestationalPhaseInfo = (weeks: number) => {
    let phase: GestationalPhase;
    
    // Calcular medidas fetais estimadas (quando aplicável)
    const fetalMeasurements = {
      headCircumference: estimateFoetalHeadCircumference(weeks),
      length: estimateFoetalLength(weeks),
      weight: estimateFoetalWeight(weeks)
    };

    // Período embrionário (primeiras 10 semanas)
    if (weeks < 4) {
      phase = {
        title: "Período Pré-Embrionário (Semanas 1-3)",
        description: "Fase inicial de implantação e formação do blastocisto. O trofoblasto inicia o desenvolvimento que dará origem à placenta primitiva.",
        embryoDevelopment: "Ocorre a fecundação e formação do zigoto unicelular que se divide rapidamente (clivagem). Forma-se a mórula e depois o blastocisto que implanta no endométrio aproximadamente no 7º dia após a fecundação. No final da 3ª semana, inicia-se a gastrulação com formação do disco embrionário trilaminar (ectoderma, mesoderma, endoderma).",
        gestationalChanges: "Níveis elevados de progesterona e primeiros sintomas sutis como sensibilidade mamária e fadiga. Possibilidade de spotting de implantação. Desenvolvimento do córion (vilosidades coriônicas) que formará posteriormente a placenta.",
        keyMilestones: [
          "Implantação do blastocisto no endométrio (6-12 dias após fertilização)",
          "Formação da linha primitiva e início da gastrulação (dia 15)",
          "Diferenciação das três camadas germinativas primárias (dia 18-21)",
          "Início da formação do tubo neural (neurulação, dia 21)"
        ],
        recommendations: [
          "Iniciar ou continuar suplementação de ácido fólico (400mcg/dia)",
          "Evitar álcool, tabaco e medicamentos sem orientação médica",
          "Manter alimentação equilibrada rica em vitaminas e minerais"
        ],
        risksToMonitor: [
          "Gravidez ectópica (implantação fora do útero)",
          "Abortamento espontâneo precoce",
          "Exposição a teratógenos no período crítico de organogênese"
        ]
      };
    } 
    else if (weeks >= 4 && weeks < 10) {
      phase = {
        title: "Período Embrionário Inicial (Semanas 4-9)",
        description: "Fase crítica de organogênese. Todos os principais sistemas e órgãos começam a se formar neste período.",
        embryoDevelopment: "Formação do tubo neural, desenvolvimento do sistema cardiovascular com início dos batimentos cardíacos (semana 5-6). Surgimento dos primórdios dos membros, desenvolvimento da face, olhos, ouvidos e órgãos internos. Ao final desta fase, o embrião mede aproximadamente 22-30mm (CCN) e pesa cerca de 8g.",
        gestationalChanges: "Aumento dos níveis de hCG, causando náuseas e vômitos matinais. Aumento do fluxo sanguíneo e volume plasmático. Frequência urinária aumentada. Possível hipersensibilidade olfativa. Desenvolvimento da placenta primitiva com vilosidades coriônicas em pleno desenvolvimento funcional.",
        keyMilestones: [
          "Início dos batimentos cardíacos (semana 5-6)",
          "Formação do tubo digestivo primitivo (semana 4)",
          "Desenvolvimento dos arcos branquiais (semana 4-5)",
          "Início da formação dos membros (semana 5)",
          "Formação da placenta primitiva em desenvolvimento (vilosidades coriônicas funcionais)"
        ],
        recommendations: [
          "Primeira consulta pré-natal e exames iniciais",
          "Evitar contato com gatos e carnes cruas (toxoplasmose)",
          "Evitar exercícios de alto impacto e situações de estresse",
          "Manter hidratação adequada"
        ],
        risksToMonitor: [
          "Defeitos do tubo neural",
          "Anomalias cromossômicas",
          "Descolamento coriônico",
          "Hiperêmese gravídica"
        ],
        fetalMeasurements
      };
    } 
    // Transição embrio-fetal (10-13 semanas)
    else if (weeks >= 10 && weeks < 14) {
      phase = {
        title: "Transição Embrio-Fetal (Semanas 10-13)",
        description: "Fim do período embrionário e início do período fetal. Estruturas principais já estão formadas e iniciam o processo de crescimento e maturação funcional.",
        embryoDevelopment: "Ao final da semana 10, o embrião passa a ser chamado feto. Desenvolvimento da estrutura facial, dedos das mãos e pés. Mineralização óssea iniciando. Genitália externa começa a se diferenciar. Movimento fetal presente mas ainda não perceptível para a gestante. CCN de aproximadamente 5-8cm.",
        gestationalChanges: "Redução gradual dos sintomas de náusea com queda dos níveis de hCG. Início do aumento mais significativo do útero. Possível início do aumento da pigmentação cutânea (melasma). Formação da placenta definitiva por volta da semana 12, com completa estruturação das vilosidades coriônicas e espaço interviloso.",
        keyMilestones: [
          "Diferenciação da genitália externa (semana 11-12)",
          "Início da produção de urina pelo feto (semana 10)",
          "Formação completa das estruturas cerebrais primitivas",
          "Início da função hepática fetal",
          "Deglutição de líquido amniótico pelo feto",
          "Placenta definitiva completamente formada (semana 12)"
        ],
        recommendations: [
          "Exames de rastreamento do 1º trimestre (translucência nucal)",
          "Ajuste de atividades físicas conforme tolerância",
          "Manutenção de dieta rica em proteínas, cálcio e ferro"
        ],
        risksToMonitor: [
          "Sangramento vaginal (ameaça de abortamento)",
          "Incompetência istmo-cervical",
          "Marcadores de cromossomopatias em ultrassom"
        ],
        fetalMeasurements
      };
    } 
    // Segundo trimestre (14-27 semanas)
    else if (weeks >= 14 && weeks < 28) {
      phase = {
        title: "Segundo Trimestre (Semanas 14-27)",
        description: "Período de crescimento fetal acelerado e maturação de órgãos. Movimentos fetais tornam-se perceptíveis e características individuais desenvolvem-se.",
        embryoDevelopment: "Crescimento acelerado com ganho de peso fetal exponencial. Desenvolvimento do sistema nervoso, mielinização inicial dos neurônios. Formação das impressões digitais. Depósito de vernix caseosa e lanugem. Produção do mecônio no intestino. Desenvolvimento das glândulas sudoríparas, sebáceas e mamárias.",
        gestationalChanges: "Aumento significativo do volume uterino. Percepção dos movimentos fetais (quickening) entre semanas 18-22. Produção de colostro pode iniciar. Aumento da circulação periférica e possível aparecimento de estrias, varicosidades e edema. Placenta em pleno funcionamento com transporte ativo de nutrientes, anticorpos e gases.",
        keyMilestones: [
          "Percepção dos movimentos fetais (semana 18-22)",
          "Maturação pulmonar inicial (semana 16-25)",
          "Início da formação de gordura subcutânea (semana 14-15)",
          "Audição fetal desenvolvida - responde a sons externos (semana 18-20)",
          "Ciclo de sono-vigília estabelecido (semana 23-26)"
        ],
        recommendations: [
          "Ultrassom morfológico do 2º trimestre (semana 20-24)",
          "Teste de tolerância à glicose para rastreamento de diabetes gestacional",
          "Avaliação do comprimento cervical se houver fatores de risco",
          "Posicionamento lateral durante o descanso para melhorar fluxo placentário"
        ],
        risksToMonitor: [
          "Insuficiência istmo-cervical",
          "Diabetes gestacional",
          "Pré-eclâmpsia precoce",
          "Restrição de crescimento intrauterino"
        ],
        fetalMeasurements
      };
    } 
    // Terceiro trimestre inicial (28-34 semanas)
    else if (weeks >= 28 && weeks < 34) {
      phase = {
        title: "Terceiro Trimestre Inicial (Semanas 28-34)",
        description: "Período de ganho de peso significativo do feto e amadurecimento pulmonar. Cérebro inicia desenvolvimento acelerado.",
        embryoDevelopment: "Rápido ganho de peso. Maturação pulmonar progressiva com produção de surfactante (30-34 semanas). Desenvolvimento do sistema nervoso central com formação intensa de conexões sinápticas. Córtex cerebral começa a mostrar circunvoluções. Movimentos respiratórios fetais tornam-se regulares. Ciclos de atividade-repouso bem estabelecidos.",
        gestationalChanges: "Aumento significativo do volume abdominal e deslocamento do centro de gravidade. Posicionamento do feto (apresentação) começa a se definir. Compressão gástrica causando pirose e dispneia. Aumento da frequência urinária por compressão vesical. Possível início de contrações de Braxton-Hicks. Placenta atinge sua eficiência máxima, mas começa a mostrar sinais de maturação (calcificações).",
        keyMilestones: [
          "Início da produção de surfactante pulmonar (semana 28-30)",
          "Maturação do sistema respiratório para função extrauterina (semana 28-34)",
          "Ganho acelerado de peso fetal (aproximadamente 200g/semana)",
          "Resposta a estímulos luminosos externos",
          "Melhora da coordenação sucção-deglutição (semana 32-34)"
        ],
        recommendations: [
          "Monitoramento mais frequente da pressão arterial e proteinúria",
          "Avaliação do crescimento fetal por ultrassom",
          "Posicionamento adequado para dormir (decúbito lateral esquerdo)",
          "Preparação para o parto e amamentação"
        ],
        risksToMonitor: [
          "Pré-eclâmpsia e síndrome HELLP",
          "Parto prematuro",
          "Restrição de crescimento intrauterino",
          "Placenta prévia e acretismo placentário"
        ],
        fetalMeasurements
      };
    } 
    // Terceiro trimestre final (35-40+ semanas)
    else {
      phase = {
        title: "Terceiro Trimestre Final (Semanas 35-42)",
        description: "Fase final de preparação para o nascimento. Feto adquire gordura subcutânea e maturidade pulmonar completa.",
        embryoDevelopment: "Ganho de peso desacelera no final da gestação. Acúmulo significativo de gordura subcutânea para termorregulação pós-natal. Maturidade pulmonar completa após 37 semanas. Posicionamento cefálico na maioria dos casos. Encaixamento no estreito superior da pelve (primíparas). Ao termo, peso médio de 3200-3400g e comprimento aproximado de 50cm.",
        gestationalChanges: "Queda do fundo uterino (lightening) nas primíparas. Aumento das contrações de Braxton-Hicks preparando para o trabalho de parto. Possível ruptura de membranas amnióticas. Dilatação cervical e apagamento nos casos de trabalho de parto iminente. Placenta em grau avançado de maturação (calcificações e alterações fibróticas), mas mantendo função suficiente até o parto.",
        keyMilestones: [
          "Maturidade pulmonar completa (semana 37)",
          "Posicionamento cefálico definitivo (semana 36-38 em primíparas)",
          "Transferência máxima de anticorpos maternos (IgG)",
          "Preenchimento da cisterna magna e folheto parietal das meninges (semana 37-38)"
        ],
        recommendations: [
          "Reconhecimento dos sinais de trabalho de parto verdadeiro",
          "Monitoramento dos movimentos fetais diários",
          "Avaliação da apresentação fetal para planejamento do parto",
          "Discussão sobre opções de analgesia e plano de parto"
        ],
        risksToMonitor: [
          "Oligodrâmnio ou polidrâmnio",
          "Sofrimento fetal agudo",
          "Placenta grau III de maturação",
          "Macrossomia fetal em casos de diabetes gestacional",
          "Pós-datismo (gestação > 40 semanas)"
        ],
        fetalMeasurements
      };
    }

    setCurrentGestationalPhase(phase);
  };

  const calculateAge = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      try {
        let calculationResult;
        
        if (method === "lmp" && lmpDate) {
          calculationResult = calculateGestationalAgeFromLMP(lmpDate);
        } else if (method === "usg" && usgDate) {
          calculationResult = calculateGestationalAgeFromUltrasound(usgDate, usgWeeks, usgDays);
        } else if (method === "transfer" && transferDate) {
          calculationResult = calculateGestationalAgeFromTransfer(transferDate, embryoDays);
        } else {
          setIsCalculating(false);
          return;
        }
        
        // Calculate days remaining
        const daysTotal = 280; // 40 weeks
        const daysPassed = (calculationResult.weeks * 7) + calculationResult.days;
        const daysRemaining = daysTotal - daysPassed;
        
        // Generate pie chart data
        const pieData = [
          { name: 'Concluído', value: daysPassed, color: '#4ade80' },
          { name: 'Restante', value: daysRemaining, color: '#60a5fa' }
        ];
        
        // Generate trimester information
        const trimesterInfo = [
          { name: "Primeiro Trimestre", weeks: "0-13", description: "Desenvolvimento de órgãos principais", complete: calculationResult.weeks >= 13 },
          { name: "Segundo Trimestre", weeks: "14-26", description: "Crescimento e movimentos fetais", complete: calculationResult.weeks >= 26 },
          { name: "Terceiro Trimestre", weeks: "27-40", description: "Maturação dos sistemas e preparação para o parto", complete: calculationResult.weeks >= 27 }
        ];
        
        // Calculate estimated fetal measurements
        const foetalMeasurements = {
          headCircumference: estimateFoetalHeadCircumference(calculationResult.weeks),
          length: estimateFoetalLength(calculationResult.weeks),
          weight: estimateFoetalWeight(calculationResult.weeks)
        };
        
        const enhancedResults = {
          ...calculationResult,
          daysTotal,
          daysPassed,
          daysRemaining,
          percentComplete: Math.round((daysPassed / daysTotal) * 100),
          pieData,
          trimesterInfo,
          foetalMeasurements
        };
        
        setResults(enhancedResults);
        setIsCalculating(false);
        
        // Salvar no histórico
        setTimeout(() => {
          saveToHistory();
        }, 500);
        
      } catch (error) {
        console.error("Erro ao calcular idade gestacional:", error);
        setIsCalculating(false);
      }
    }, 600);
  };

  const calculateTrimester = () => {
    if (!results) return "Não calculado";

    const today = new Date();
    if (today < results.firstTrimesterEnd) {
      return "Primeiro Trimestre";
    } else if (today < results.secondTrimesterEnd) {
      return "Segundo Trimestre";
    } else {
      return "Terceiro Trimestre";
    }
  };

  // Function to calculate milestones for development
  const getDevelopmentMilestones = (weeks: number) => {
    const milestones = [
      { week: 4, description: "Início da formação do tubo neural e primórdios cardíacos" },
      { week: 6, description: "Batimentos cardíacos detectáveis, início da formação dos membros" },
      { week: 8, description: "Início da ossificação, todos os sistemas orgânicos formados" },
      { week: 10, description: "Diferenciação das estruturas cerebrais, movimentos fetais iniciais" },
      { week: 12, description: "Unhas e genitália externa em desenvolvimento, deglutição de líquido amniótico, placenta definitiva formada" },
      { week: 16, description: "Movimentos oculares ativos, início da formação das papilas gustativas" },
      { week: 20, description: "Lanugo cobrindo o corpo, vernix caseosa aparece, mielinização dos nervos inicia" },
      { week: 24, description: "Alvéolos pulmonares desenvolvem-se, resposta a estímulos sonoros externos" },
      { week: 28, description: "Produção de surfactante pulmonar, ciclos de sono-vigília regulares" },
      { week: 32, description: "Coordenação entre sucção e deglutição, deposição acelerada de gordura" },
      { week: 36, description: "Pulmões quase maduros, reflexos de preensão e Moro completos" },
      { week: 38, description: "Todos os sistemas orgânicos maduros para vida extrauterina" },
      { week: 40, description: "Termo completo - preparação fisiológica para o parto" }
    ];
    
    // Get next milestone
    const nextMilestone = milestones.find(m => m.week > weeks);
    // Get current/latest milestone
    const currentMilestone = [...milestones].reverse().find(m => m.week <= weeks);
    
    return { nextMilestone, currentMilestone };
  };

  return (
    <div className="p-4 text-blue-50 animation-fade-in">
      <motion.div 
        className="flex mb-4 space-x-2 border-b border-blue-900/30 pb-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button 
          onClick={() => setMethod("lmp")} 
          className={`glass-button px-3 py-1 transition-all ${method === "lmp" ? "bg-blue-900/40 transform scale-105" : ""}`}
        >
          Última Menstruação
        </button>
        <button 
          onClick={() => setMethod("usg")} 
          className={`glass-button px-3 py-1 transition-all ${method === "usg" ? "bg-blue-900/40 transform scale-105" : ""}`}
        >
          Ultrassom
        </button>
        <button 
          onClick={() => setMethod("transfer")} 
          className={`glass-button px-3 py-1 transition-all ${method === "transfer" ? "bg-blue-900/40 transform scale-105" : ""}`}
        >
          Transferência
        </button>
      </motion.div>

      {/* Informações detalhadas sobre a fase gestacional atual */}
      {currentGestationalPhase && (
        <motion.div 
          className="mb-6 glass-panel p-4 border-l-4 border-teal-500"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-start flex-wrap">
            <div>
              <h4 className="text-md font-bold text-teal-300 mb-1">
                {currentGestationalPhase.title}
              </h4>
              <p className="text-sm font-medium text-blue-100 mb-2">
                {currentGestationalPhase.description}
              </p>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-teal-300 mb-1">Desenvolvimento Embrio-Fetal:</p>
                <p className="text-xs text-blue-100">{currentGestationalPhase.embryoDevelopment}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-teal-300 mb-1">Alterações Gestacionais:</p>
                <p className="text-xs text-blue-100">{currentGestationalPhase.gestationalChanges}</p>
              </div>
              
              {currentGestationalPhase.fetalMeasurements && currentGestationalPhase.fetalMeasurements.weight && currentGestationalPhase.fetalMeasurements.weight > 0 && (
                <div className="glass-panel p-3 mt-2">
                  <p className="text-xs font-medium text-teal-300 mb-1">Medidas Fetais Estimadas:</p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    {currentGestationalPhase.fetalMeasurements.headCircumference && currentGestationalPhase.fetalMeasurements.headCircumference > 0 && (
                      <div>
                        <p className="text-blue-200">Perímetro Cefálico</p>
                        <p className="text-white font-bold mt-1">{currentGestationalPhase.fetalMeasurements.headCircumference} cm</p>
                      </div>
                    )}
                    <div>
                      <p className="text-blue-200">Comprimento</p>
                      <p className="text-white font-bold mt-1">{currentGestationalPhase.fetalMeasurements.length} cm</p>
                    </div>
                    <div>
                      <p className="text-blue-200">Peso</p>
                      <p className="text-white font-bold mt-1">{currentGestationalPhase.fetalMeasurements.weight} g</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-teal-300 mb-1">Marcos de Desenvolvimento:</p>
                <ul className="text-xs text-blue-100 list-disc pl-4 space-y-1">
                  {currentGestationalPhase.keyMilestones.map((milestone, index) => (
                    <li key={index}>{milestone}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="text-xs font-medium text-teal-300 mb-1">Recomendações Clínicas:</p>
                <ul className="text-xs text-blue-100 list-disc pl-4 space-y-1">
                  {currentGestationalPhase.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium text-yellow-300 mb-1">Riscos a Monitorar:</p>
                <ul className="text-xs text-blue-100 list-disc pl-4 space-y-1">
                  {currentGestationalPhase.risksToMonitor.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div 
        className="calculator-form-container mb-6 parallax-card" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {method === "lmp" && (
          <>
            <h3 className="calculator-section-title text-lg mb-4">Data da Última Menstruação</h3>
            <div className="mb-4">
              <Label className="calculator-label block mb-2">Data da última menstruação</Label>
              <Calendar
                mode="single"
                selected={lmpDate}
                onSelect={setLmpDate}
                locale={ptBR}
                className="calculator-calendar border border-blue-900/30"
              />
            </div>
          </>
        )}

        {method === "usg" && (
          <>
            <h3 className="calculator-section-title text-lg mb-4">Cálculo por Ultrassom</h3>
            <div className="mb-4">
              <Label htmlFor="usg-date" className="calculator-label block mb-2">Data do Ultrassom</Label>
              <Calendar
                mode="single"
                selected={usgDate}
                onSelect={setUsgDate}
                locale={ptBR}
                className="calculator-calendar border border-blue-900/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="usg-weeks" className="calculator-label">Semanas</Label>
                <Input
                  id="usg-weeks"
                  type="number"
                  min="0"
                  max="42"
                  value={usgWeeks}
                  onChange={(e) => setUsgWeeks(parseInt(e.target.value) || 0)}
                  className="calculator-input"
                />
              </div>
              <div>
                <Label htmlFor="usg-days" className="calculator-label">Dias</Label>
                <Input
                  id="usg-days"
                  type="number"
                  min="0"
                  max="6"
                  value={usgDays}
                  onChange={(e) => setUsgDays(parseInt(e.target.value) || 0)}
                  className="calculator-input"
                />
              </div>
            </div>
          </>
        )}

        {method === "transfer" && (
          <>
            <h3 className="calculator-section-title text-lg mb-4">Cálculo por Transferência de Embriões</h3>
            <div className="mb-4">
              <Label htmlFor="transfer-date" className="calculator-label block mb-2">Data da Transferência</Label>
              <Calendar
                mode="single"
                selected={transferDate}
                onSelect={setTransferDate}
                locale={ptBR}
                className="calculator-calendar border border-blue-900/30"
              />
            </div>
            <div className="mb-4">
              <Label className="calculator-label mb-2 block">Estágio do Embrião</Label>
              <RadioGroup
                value={String(embryoDays)}
                onValueChange={(value) => setEmbryoDays(parseInt(value))}
                className="flex gap-4"
              >
                <div className="flex items-center">
                  <RadioGroupItem value="3" id="r1" className="text-teal-400" />
                  <Label htmlFor="r1" className="ml-2 text-blue-200">D3 (3 dias)</Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="5" id="r2" className="text-teal-400" />
                  <Label htmlFor="r2" className="ml-2 text-blue-200">D5 (Blastocisto)</Label>
                </div>
              </RadioGroup>
            </div>
          </>
        )}

        <motion.div 
          className="mt-6 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button 
            onClick={calculateAge} 
            className={`calculator-button px-6 py-2 w-full md:w-auto relative ${isCalculating ? 'pointer-events-none' : ''}`}
            disabled={isCalculating || 
              (method === "lmp" && !lmpDate) || 
              (method === "usg" && (!usgDate || (usgWeeks === 0 && usgDays === 0))) || 
              (method === "transfer" && !transferDate)
            }
          >
            {isCalculating ? (
              <>
                <span className="opacity-0">Calcular Idade Gestacional</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculando...
                </span>
              </>
            ) : "Calcular Idade Gestacional"}
          </Button>
        </motion.div>
      </motion.div>

      {results && (
        <div className="space-y-6 animation-slide-up">
          <motion.div 
            className="calculator-result p-6 parallax-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="calculator-result-title">Resultado</h3>
            
            <div className="calculator-display mb-4 glow-effect">
              <p className="text-sm mb-1 text-teal-300">Idade Gestacional:</p>
              <p className="text-xl font-bold">
                {results.weeks} semanas e {results.days} dias
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-center">
                  <div className="w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={results.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                          animationDuration={800}
                          animationBegin={200}
                        >
                          {results.pieData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} dias`, null]}
                          contentStyle={{ 
                            backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                            borderColor: '#1d4ed8',
                            color: '#f0f9ff',
                            fontFamily: '"Roboto Mono", monospace'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-blue-200 text-sm font-roboto-mono">
                    <span className="inline-block w-3 h-3 bg-[#4ade80] rounded-full mr-2"></span>
                    {results.daysPassed} dias passados
                  </p>
                  <p className="text-blue-200 text-sm font-roboto-mono">
                    <span className="inline-block w-3 h-3 bg-[#60a5fa] rounded-full mr-2"></span>
                    {results.daysRemaining} dias restantes
                  </p>
                </div>
                
                {results.foetalMeasurements && results.foetalMeasurements.weight > 0 && (
                  <div className="mt-4 glass-panel p-3">
                    <h4 className="text-sm font-medium text-teal-300 mb-2">Parâmetros Fetais Estimados</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {results.foetalMeasurements.headCircumference > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-blue-200">Perímetro Cefálico:</span>
                          <span className="font-bold text-white">{results.foetalMeasurements.headCircumference} cm</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200">Comprimento:</span>
                        <span className="font-bold text-white">{results.foetalMeasurements.length} cm</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200">Peso:</span>
                        <span className="font-bold text-white">{results.foetalMeasurements.weight} g</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-teal-300">Trimestre</h4>
                  <p className="text-md text-blue-200">{calculateTrimester()}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-teal-300">Data Provável do Parto</h4>
                  <p className="text-md text-teal-400 font-medium glow-text">
                    {format(results.dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                
                <div className="mt-2">
                  {/* Progress bar */}
                  <div className="w-full bg-blue-900/30 rounded-full h-4 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-teal-500 h-4 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${results.percentComplete}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-blue-200 text-center font-roboto-mono">
                    {results.percentComplete}% da gestação
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="calculator-result p-6 parallax-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="calculator-result-title">Desenvolvimento</h3>
            
            <div className="mb-6">
              {/* Progress steps for trimesters */}
              <div className="relative flex justify-between items-center mb-8">
                {results.trimesterInfo.map((trimester: any, index: number) => (
                  <div key={index} className="z-10 flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 flex items-center justify-center rounded-full border-2 
                      ${trimester.complete 
                        ? 'bg-teal-600 border-teal-400 text-white' 
                        : 'bg-blue-900/30 border-blue-800 text-blue-300'}`}
                    >
                      {index + 1}
                    </div>
                    <p className="text-xs text-blue-200 mt-2 text-center whitespace-nowrap">{trimester.name}</p>
                    <p className="text-xs text-blue-300/70 mt-1 text-center whitespace-nowrap">{trimester.weeks} semanas</p>
                  </div>
                ))}
                
                {/* Connecting line between steps */}
                <div className="absolute top-5 left-0 transform -translate-y-1/2 w-full h-0.5 bg-blue-900/50 -z-0"></div>
              </div>
            </div>
            
            {/* Current development milestone */}
            {results.weeks > 0 && (
              <motion.div 
                className="glass-panel p-4 mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <h4 className="text-sm font-medium text-teal-300 mb-2">Marco Atual do Desenvolvimento</h4>
                <div className="text-blue-100">
                  {getDevelopmentMilestones(results.weeks).currentMilestone && (
                    <div className="mb-3">
                      <p className="text-sm font-medium">
                        <span className="text-teal-400">{getDevelopmentMilestones(results.weeks).currentMilestone?.week} semanas:</span> {getDevelopmentMilestones(results.weeks).currentMilestone?.description}
                      </p>
                    </div>
                  )}
                  
                  {getDevelopmentMilestones(results.weeks).nextMilestone && (
                    <div>
                      <p className="text-sm text-blue-200">
                        <span className="text-blue-300">Próximo marco:</span> {getDevelopmentMilestones(results.weeks).nextMilestone?.week} semanas - {getDevelopmentMilestones(results.weeks).nextMilestone?.description}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            <motion.div 
              className="mt-4 glass-panel p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <p className="text-sm text-blue-200 font-roboto-mono">
                Este cálculo é uma estimativa baseada em idade gestacional média. Consulte sempre seu médico para avaliações específicas e ajustes necessários.
              </p>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GestationalCalculator;