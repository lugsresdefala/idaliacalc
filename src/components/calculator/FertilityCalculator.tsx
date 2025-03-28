import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calculateFertilePeriod, calculatePredictedFertileWindow } from "@/lib/calculationUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { saveCalculation } from "@/lib/calculationHistoryStorage";
import { motion } from "framer-motion";

interface FertilityCalculatorProps {
  onCalculate?: () => void;
}

const FertilityCalculator = ({ onCalculate }: FertilityCalculatorProps) => {
  const [lastPeriodStart, setLastPeriodStart] = useState<Date | undefined>(undefined);
  const [lastPeriodEnd, setLastPeriodEnd] = useState<Date | undefined>(undefined);
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [calculatedCycleLength, setCalculatedCycleLength] = useState<number | null>(null);
  const [results, setResults] = useState<any>(null);
  const [previousCycles, setPreviousCycles] = useState<Array<{
    startDate: Date;
    endDate: Date;
    length: number;
  }>>([]);
  const [newCycleStart, setNewCycleStart] = useState<Date | undefined>(undefined);
  const [newCycleEnd, setNewCycleEnd] = useState<Date | undefined>(undefined);
  const [isCalculating, setIsCalculating] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);
  const [currentCycleDay, setCurrentCycleDay] = useState<number | null>(null);
  const [cyclePhase, setCyclePhase] = useState<string>("");
  const [fertilityStatus, setFertilityStatus] = useState<{
    status: string;
    probability: "alta" | "média" | "baixa" | "muito baixa";
    mucusType: string;
    temperature: string;
    hormoneLevels: {
      estrogen: string;
      progesterone: string;
      lh: string;
      fsh: string;
    };
  } | null>(null);

  // Calcular a duração média do ciclo com base nos dados históricos
  useEffect(() => {
    if (previousCycles.length > 1) {
      // Ordenar ciclos por data de início
      const sortedCycles = [...previousCycles].sort((a, b) => 
        a.startDate.getTime() - b.startDate.getTime()
      );
      
      // Calcular dias entre o início de cada ciclo
      const cycleLengths = [];
      for (let i = 1; i < sortedCycles.length; i++) {
        cycleLengths.push(
          differenceInDays(sortedCycles[i].startDate, sortedCycles[i-1].startDate)
        );
      }
      
      if (cycleLengths.length > 0) {
        const avgLength = Math.round(
          cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length
        );
        setCalculatedCycleLength(avgLength);
      }
    } else {
      setCalculatedCycleLength(null);
    }
  }, [previousCycles]);

  // Resetar o status de salvamento quando os resultados mudarem
  useEffect(() => {
    if (results) {
      setHistorySaved(false);
      
      // Calcular o dia atual do ciclo
      const today = new Date();
      const cycleDay = differenceInDays(today, lastPeriodStart!) + 1;
      setCurrentCycleDay(cycleDay);
      
      // Determinar a fase do ciclo e status de fertilidade
      updateFertilityStatus(cycleDay);
    }
  }, [results]);

  const updateFertilityStatus = (cycleDay: number) => {
    const effectiveCycleLength = calculatedCycleLength || cycleLength;
    const ovulationDay = effectiveCycleLength - 14;
    
    let phase = "";
    let status = {
      status: "",
      probability: "muito baixa" as "alta" | "média" | "baixa" | "muito baixa",
      mucusType: "",
      temperature: "",
      hormoneLevels: {
        estrogen: "",
        progesterone: "",
        lh: "",
        fsh: ""
      }
    };
    
    // Fase menstrual (1-5 dias)
    if (cycleDay <= 5) {
      phase = "Fase Menstrual";
      status = {
        status: "Não Fértil",
        probability: "muito baixa",
        mucusType: "Fluxo menstrual presente",
        temperature: "Normal a baixa (36.2°C - 36.5°C)",
        hormoneLevels: {
          estrogen: "Baixo",
          progesterone: "Baixo",
          lh: "Baixo",
          fsh: "Começando a aumentar"
        }
      };
    }
    // Fase folicular precoce (6 a ovulação-5)
    else if (cycleDay > 5 && cycleDay < ovulationDay - 5) {
      phase = "Fase Folicular Precoce";
      status = {
        status: "Baixa Fertilidade",
        probability: "baixa",
        mucusType: "Pouco ou seco, pegajoso e opaco",
        temperature: "Basal baixa (36.2°C - 36.5°C)",
        hormoneLevels: {
          estrogen: "Começando a aumentar",
          progesterone: "Baixo",
          lh: "Baixo",
          fsh: "Moderado, estimulando o desenvolvimento folicular"
        }
      };
    }
    // Fase fértil pré-ovulatória (5 dias antes da ovulação)
    else if (cycleDay >= ovulationDay - 5 && cycleDay < ovulationDay) {
      phase = "Fase Fértil Pré-Ovulatória";
      const daysToOvulation = ovulationDay - cycleDay;
      
      if (daysToOvulation <= 2) {
        status = {
          status: "Alta Fertilidade",
          probability: "alta",
          mucusType: "Transparente, elástico (semelhante à clara de ovo)",
          temperature: "Ligeira queda antes da ovulação",
          hormoneLevels: {
            estrogen: "Pico",
            progesterone: "Baixo",
            lh: "Aumento rápido (pico de LH)",
            fsh: "Moderado"
          }
        };
      } else {
        status = {
          status: "Fertilidade Crescente",
          probability: "média",
          mucusType: "Cremoso, úmido, branco ou amarelado",
          temperature: "Basal baixa (36.2°C - 36.5°C)",
          hormoneLevels: {
            estrogen: "Aumentando rapidamente",
            progesterone: "Baixo",
            lh: "Começando a aumentar",
            fsh: "Moderado"
          }
        };
      }
    }
    // Dia da ovulação
    else if (cycleDay === ovulationDay) {
      phase = "Dia da Ovulação";
      status = {
        status: "Fertilidade Máxima",
        probability: "alta",
        mucusType: "Muito elástico e transparente (ápice)",
        temperature: "Início do aumento (36.4°C - 36.7°C)",
        hormoneLevels: {
          estrogen: "Começando a diminuir após o pico",
          progesterone: "Começando a aumentar",
          lh: "Pico (desencadeia a ovulação)",
          fsh: "Diminuindo"
        }
      };
    }
    // Fase lútea precoce (1-3 dias após ovulação)
    else if (cycleDay > ovulationDay && cycleDay <= ovulationDay + 3) {
      phase = "Fase Lútea Precoce";
      status = {
        status: "Fertilidade Diminuindo",
        probability: "baixa",
        mucusType: "Voltando a ficar pegajoso e opaco",
        temperature: "Elevada (36.6°C - 37.0°C)",
        hormoneLevels: {
          estrogen: "Moderado com leve aumento secundário",
          progesterone: "Aumentando significativamente",
          lh: "Diminuindo após o pico",
          fsh: "Baixo"
        }
      };
    }
    // Fase lútea tardia (resto do ciclo)
    else {
      phase = "Fase Lútea Tardia";
      status = {
        status: "Não Fértil",
        probability: "muito baixa",
        mucusType: "Pouco ou seco",
        temperature: "Elevada, caindo próximo à menstruação",
        hormoneLevels: {
          estrogen: "Moderado a baixo",
          progesterone: "Alto, diminuindo próximo à menstruação",
          lh: "Baixo",
          fsh: "Baixo"
        }
      };
    }
    
    setCyclePhase(phase);
    setFertilityStatus(status);
  };

  const handleLastPeriodStartChange = (date: Date | undefined) => {
    setLastPeriodStart(date);
    if (date && !lastPeriodEnd) {
      setLastPeriodEnd(addDays(date, 5));
    }
    
    // Se uma data for definida, calcular o dia atual do ciclo
    if (date) {
      const today = new Date();
      const cycleDay = differenceInDays(today, date) + 1;
      if (cycleDay > 0) {
        setCurrentCycleDay(cycleDay);
      } else {
        setCurrentCycleDay(null);
      }
    } else {
      setCurrentCycleDay(null);
    }
  };

  const handleNewCycleStartChange = (date: Date | undefined) => {
    setNewCycleStart(date);
    if (date && !newCycleEnd) {
      setNewCycleEnd(addDays(date, 5));
    }
  };

  const addPreviousCycle = () => {
    if (!newCycleStart || !newCycleEnd) return;

    const length = differenceInDays(newCycleEnd, newCycleStart) + 1;
    const newCycle = {
      startDate: newCycleStart,
      endDate: newCycleEnd,
      length
    };

    setPreviousCycles([...previousCycles, newCycle]);
    setNewCycleStart(undefined);
    setNewCycleEnd(undefined);
  };

  const saveToHistory = () => {
    if (!results || historySaved) return;
    
    saveCalculation('fertility', results);
    setHistorySaved(true);
    
    if (onCalculate) {
      onCalculate();
    }
  };

  const calculateFertility = () => {
    if (!lastPeriodStart || !lastPeriodEnd) return;

    setIsCalculating(true);
    setTimeout(() => {
      try {
        let result;
        
        // Usar dados históricos se disponíveis, senão usar o método padrão
        if (previousCycles.length > 1 && calculatedCycleLength) {
          result = calculatePredictedFertileWindow(previousCycles, lastPeriodStart);
        } else {
          // Usar ciclo médio informado ou padrão de 28 dias
          const cycleToUse = calculatedCycleLength || cycleLength;
          result = calculateFertilePeriod(
            lastPeriodStart,
            lastPeriodEnd,
            cycleToUse
          );
        }
        
        // Enhanced results with cycle day
        const today = new Date();
        const cycleDay = differenceInDays(today, lastPeriodStart) + 1;
        
        // Determinar qual duração do ciclo foi usada
        const effectiveCycleLength = calculatedCycleLength || cycleLength;
        
        // Generate chart data for 35 days
        const chartData = generateCycleChartData(
          lastPeriodStart, 
          result.ovulationDay, 
          result.fertileStart, 
          result.fertileEnd, 
          effectiveCycleLength
        );
        
        // Add cycle day to results
        const enhancedResults = {
          ...result,
          cycleDay,
          effectiveCycleLength,
          usedHistoricalData: calculatedCycleLength !== null,
          expectedMucus: getMucusStatus(cycleDay, effectiveCycleLength),
          expectedTemp: getTemperatureStatus(cycleDay, effectiveCycleLength),
          chartData
        };
        
        setResults(enhancedResults);
        setIsCalculating(false);
        
        // Salvar no histórico
        setTimeout(() => {
          saveToHistory();
        }, 500);
        
      } catch (error) {
        console.error("Erro ao calcular período fértil:", error);
        setIsCalculating(false);
      }
    }, 600); // Simular cálculo para mostrar animação
  };

  const generateCycleChartData = (
    periodStart: Date, 
    ovulationDay: Date, 
    fertileStart: Date, 
    fertileEnd: Date, 
    effectiveCycleLength: number
  ) => {
    const data = [];
    
    // Generate data for hormone levels throughout cycle
    for (let i = 1; i <= 35; i++) {
      const currentDate = addDays(periodStart, i - 1);
      const dayOfCycle = i;
      
      // Estrogen levels - rises before ovulation
      let estrogen = 30 + (dayOfCycle * 5);
      if (dayOfCycle > 12) estrogen = 140 - ((dayOfCycle - 12) * 7);
      if (estrogen < 30) estrogen = 30;
      
      // Progesterone levels - rises after ovulation
      let progesterone = 1;
      if (dayOfCycle > 14) progesterone = 1 + ((dayOfCycle - 14) * 2);
      if (dayOfCycle > 24) progesterone = 24 - ((dayOfCycle - 24) * 2);
      if (progesterone < 1) progesterone = 1;
      
      // Temperature (in arbitrary units based on cycle phase)
      let temperature = 36.4;
      if (dayOfCycle > 14) temperature = 36.4 + ((dayOfCycle - 14) * 0.03);
      if (dayOfCycle > 24) temperature = 36.7 - ((dayOfCycle - 24) * 0.03);
      if (temperature < 36.4) temperature = 36.4;
      
      // Simplistic calculation for fertility score (0-10)
      let fertility = 1;
      const isFertileDay = currentDate >= fertileStart && currentDate <= fertileEnd;
      const isOvulationDay = format(currentDate, 'yyyy-MM-dd') === format(ovulationDay, 'yyyy-MM-dd');
      
      if (isFertileDay) fertility = 7;
      if (isOvulationDay) fertility = 10;
      
      data.push({
        day: dayOfCycle,
        date: format(currentDate, 'dd/MM'),
        estrogen,
        progesterone,
        temperature: temperature.toFixed(2),
        fertility
      });
    }
    
    return data;
  };

  const getMucusStatus = (cycleDay: number, effectiveCycleLength: number) => {
    const ovulationDay = effectiveCycleLength - 14; // Típico: ovulação 14 dias antes da próxima menstruação
    
    if (cycleDay <= 7) {
      return "Pouco ou nenhum muco durante a menstruação";
    } else if (cycleDay > 7 && cycleDay < ovulationDay - 3) {
      return "Muco pegajoso e opaco";
    } else if (cycleDay >= ovulationDay - 3 && cycleDay <= ovulationDay) {
      return "Muco transparente e elástico (tipo clara de ovo)";
    } else {
      return "Muco pegajoso ou seco";
    }
  };
  
  const getTemperatureStatus = (cycleDay: number, effectiveCycleLength: number) => {
    const ovulationDay = effectiveCycleLength - 14;
    
    if (cycleDay < ovulationDay) {
      return "Temperatura basal mais baixa (36.2°C - 36.5°C)";
    } else if (cycleDay === ovulationDay) {
      return "Possível queda ligeira seguida de aumento";
    } else {
      return "Temperatura elevada (36.6°C - 37.0°C)";
    }
  };

  // Color mappings for probability labels
  const probabilityColors = {
    "alta": "bg-red-500",
    "média": "bg-yellow-500",
    "baixa": "bg-blue-400",
    "muito baixa": "bg-gray-500"
  };

  return (
    <div className="p-4 text-blue-50 animation-fade-in">
      <motion.div 
        className="calculator-form-container mb-6 parallax-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="calculator-section-title text-lg mb-4">Cálculo do Período Fértil</h3>

        {/* Bloco de Informação Dinâmica do Ciclo - sempre visível */}
        {currentCycleDay && currentCycleDay > 0 && (
          <motion.div 
            className="mb-6 glass-panel p-4 border-l-4 border-teal-500"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-between items-start flex-wrap">
              <div>
                <h4 className="text-md font-bold text-teal-300 mb-1">
                  Dia {currentCycleDay} do seu ciclo
                </h4>
                <p className="text-sm font-medium text-blue-100">
                  {cyclePhase}
                </p>
              </div>
              
              {fertilityStatus && (
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${probabilityColors[fertilityStatus.probability]}`}>
                    {fertilityStatus.status}
                  </span>
                </div>
              )}
            </div>
            
            {fertilityStatus && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-teal-300 font-medium">Muco Cervical:</p>
                    <p className="text-sm text-blue-100">{fertilityStatus.mucusType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-300 font-medium">Temperatura Basal:</p>
                    <p className="text-sm text-blue-100">{fertilityStatus.temperature}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-teal-300 font-medium">Níveis Hormonais:</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>
                      <span className="text-pink-300">Estrogênio:</span> 
                      <span className="text-blue-100 ml-1">{fertilityStatus.hormoneLevels.estrogen}</span>
                    </div>
                    <div>
                      <span className="text-purple-300">Progesterona:</span> 
                      <span className="text-blue-100 ml-1">{fertilityStatus.hormoneLevels.progesterone}</span>
                    </div>
                    <div>
                      <span className="text-yellow-300">LH:</span> 
                      <span className="text-blue-100 ml-1">{fertilityStatus.hormoneLevels.lh}</span>
                    </div>
                    <div>
                      <span className="text-green-300">FSH:</span> 
                      <span className="text-blue-100 ml-1">{fertilityStatus.hormoneLevels.fsh}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Label className="calculator-label block mb-2">Início da Última Menstruação</Label>
            <Calendar
              mode="single"
              selected={lastPeriodStart}
              onSelect={handleLastPeriodStartChange}
              locale={ptBR}
              className="calculator-calendar border border-blue-900/30"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Label className="calculator-label block mb-2">Fim da Última Menstruação</Label>
            <Calendar
              mode="single"
              selected={lastPeriodEnd}
              onSelect={setLastPeriodEnd}
              locale={ptBR}
              className="calculator-calendar border border-blue-900/30"
              disabled={(date) => 
                lastPeriodStart ? date < lastPeriodStart : false
              }
            />
          </motion.div>
        </div>
        
        {/* Mostrar duração média do ciclo apenas se não puder ser calculada automaticamente */}
        {!calculatedCycleLength && (
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Label htmlFor="cycle-length" className="calculator-label">Duração do Ciclo (em dias)</Label>
            <Input
              id="cycle-length"
              type="number"
              min="21"
              max="45"
              value={cycleLength}
              onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
              className="calculator-input mt-1"
            />
            <p className="text-xs text-blue-200/70 mt-1 font-roboto-mono">
              A duração média do ciclo menstrual pode variar de pessoa para pessoa.
            </p>
          </motion.div>
        )}

        {/* Mostrar duração média calculada */}
        {calculatedCycleLength && (
          <motion.div 
            className="mt-4 glass-panel p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center">
              <span className="text-teal-300 font-medium mr-2">Duração média do ciclo (calculada):</span>
              <span className="text-white font-bold font-roboto-mono">{calculatedCycleLength} dias</span>
            </div>
            <p className="text-xs text-blue-200/70 mt-1">
              Baseado no histórico de {previousCycles.length} ciclos registrados.
            </p>
          </motion.div>
        )}
        
        <motion.div 
          className="mt-6 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button 
            onClick={calculateFertility} 
            className={`calculator-button px-6 py-2 w-full md:w-auto relative ${isCalculating ? 'pointer-events-none' : ''}`}
            disabled={!lastPeriodStart || !lastPeriodEnd || isCalculating}
          >
            {isCalculating ? (
              <>
                <span className="opacity-0">Calcular Período Fértil</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculando...
                </span>
              </>
            ) : "Calcular Período Fértil"}
          </Button>
        </motion.div>
      </motion.div>

      {results && (
        <motion.div 
          className="calculator-result p-6 parallax-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="calculator-result-title">Resultado</h3>
          
          <div className="calculator-display mb-4 glow-effect">
            <p className="text-sm mb-1 text-teal-300">Janela Fértil:</p>
            <p className="text-lg">
              De {format(results.fertileStart, "dd 'de' MMMM", { locale: ptBR })} até{" "}
              {format(results.fertileEnd, "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>

          {results.usedHistoricalData && (
            <div className="glass-panel p-3 mb-4 text-sm">
              <p className="text-teal-300 font-medium">
                <span className="inline-block bg-teal-500/30 px-2 py-1 rounded-md mr-2">✓</span>
                Cálculo baseado no seu histórico de ciclos
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-teal-300">Dia Provável da Ovulação</h4>
                <p className="text-lg font-bold text-teal-400 glow-text">
                  {format(results.ovulationDay, "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-teal-300">Ciclo Atual</h4>
                <p className="text-md text-blue-200">
                  Dia {results.cycleDay} do ciclo (duração média: {results.effectiveCycleLength} dias)
                </p>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-teal-300">Próxima Menstruação</h4>
                <p className="text-md text-blue-200">
                  Previsão: {format(results.nextPeriodStart, "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-teal-300">Características do Muco Cervical</h4>
                <p className="text-sm text-blue-200">{results.expectedMucus}</p>
              </div>
            </div>
          </div>
          
          {results.chartData && (
            <motion.div 
              className="mt-6 glass-panel p-4 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h4 className="text-sm font-medium text-teal-300 mb-3">Variação dos Hormônios e Fertilidade</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 197, 253, 0.1)" />
                    <XAxis 
                      dataKey="day" 
                      label={{ value: 'Dia do Ciclo', position: 'insideBottom', offset: -10, fill: '#93c5fd' }}
                      stroke="#93c5fd"
                      tick={{ fill: '#93c5fd' }}
                    />
                    <YAxis stroke="#93c5fd" tick={{ fill: '#93c5fd' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        borderColor: '#1d4ed8',
                        color: '#f0f9ff',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        fontFamily: '"Roboto Mono", monospace'
                      }}
                      labelStyle={{ color: '#93c5fd', fontWeight: 'bold' }}
                      formatter={(value, name) => {
                        if (name === 'fertility') return [value + '/10', 'Fertilidade'];
                        if (name === 'estrogen') return [value + ' pg/mL', 'Estrogênio'];
                        if (name === 'progesterone') return [value + ' ng/mL', 'Progesterona'];
                        return [value, name];
                      }}
                      labelFormatter={(value) => `Dia ${value} do Ciclo`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="fertility" 
                      stroke="#4ade80" 
                      strokeWidth={3} 
                      dot={{ fill: '#4ade80', r: 4 }}
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                      name="Fertilidade"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="estrogen" 
                      stroke="#60a5fa" 
                      strokeWidth={2} 
                      dot={false}
                      name="Estrogênio"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="progesterone" 
                      stroke="#f472b6" 
                      strokeWidth={2} 
                      dot={false}
                      name="Progesterona"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 text-xs text-blue-300 font-roboto-mono">
                <div className="flex items-center mb-1"><span className="inline-block w-3 h-3 bg-[#4ade80] rounded-full mr-2"></span> Fertilidade</div>
                <div className="flex items-center mb-1"><span className="inline-block w-3 h-3 bg-[#60a5fa] rounded-full mr-2"></span> Estrogênio</div>
                <div className="flex items-center"><span className="inline-block w-3 h-3 bg-[#f472b6] rounded-full mr-2"></span> Progesterona</div>
              </div>
            </motion.div>
          )}
          
          <motion.div 
            className="mt-4 glass-panel p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-sm text-blue-200 font-roboto-mono">
              Para maior precisão, considere também outros sinais de fertilidade como muco cervical e temperatura corporal basal.
            </p>
          </motion.div>
        </motion.div>
      )}
      
      <motion.div 
        className="calculator-form-container mt-6 parallax-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="calculator-section-title text-lg mb-4">Registrar Ciclo Anterior</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="calculator-label block mb-2">Início da Menstruação</Label>
            <Calendar
              mode="single"
              selected={newCycleStart}
              onSelect={handleNewCycleStartChange}
              locale={ptBR}
              className="calculator-calendar border border-blue-900/30"
            />
          </div>
          
          <div>
            <Label className="calculator-label block mb-2">Fim da Menstruação</Label>
            <Calendar
              mode="single"
              selected={newCycleEnd}
              onSelect={setNewCycleEnd}
              locale={ptBR}
              className="calculator-calendar border border-blue-900/30"
              disabled={(date) => 
                newCycleStart ? date < newCycleStart : false
              }
            />
          </div>
        </div>
        
        <Button 
          onClick={addPreviousCycle} 
          disabled={!newCycleStart || !newCycleEnd}
          className="calculator-button w-full md:w-auto"
        >
          Registrar Ciclo
        </Button>
        
        {previousCycles.length > 0 && (
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="text-md font-medium mb-2 text-blue-200">Ciclos Registrados</h4>
            <div className="glass-panel rounded-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-blue-900/30">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-blue-300">Início</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-blue-300">Fim</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-blue-300">Duração</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/20">
                  {previousCycles.map((cycle, index) => (
                    <tr key={index} className="hover:bg-blue-900/10 transition-colors">
                      <td className="px-4 py-2 text-sm text-blue-200">
                        {format(cycle.startDate, "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-2 text-sm text-blue-200">
                        {format(cycle.endDate, "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-2 text-sm text-blue-200">
                        {differenceInDays(cycle.endDate, cycle.startDate) + 1} dias
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FertilityCalculator;