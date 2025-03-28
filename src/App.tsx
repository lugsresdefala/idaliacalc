import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GestationalCalculator from "@/components/calculator/GestationalCalculator";
import FertilityCalculator from "@/components/calculator/FertilityCalculator";
import RecentCalculationsHistory from "@/components/dashboard/RecentCalculationsHistory";
import { getCalculationHistory, CalculationRecord } from "@/lib/calculationHistoryStorage";
import "./styles/global.css";

function App() {
  const [activeTab, setActiveTab] = useState<"fertility" | "gestational">("fertility");
  const [calculationHistory, setCalculationHistory] = useState<CalculationRecord[]>([]);

  // Carregar histórico de cálculos ao iniciar
  useEffect(() => {
    const history = getCalculationHistory();
    setCalculationHistory(history);
  }, []);

  // Atualizar histórico quando um novo cálculo for feito
  const handleCalculationUpdate = () => {
    const history = getCalculationHistory();
    setCalculationHistory(history);
  };

  // Carregar um cálculo salvo
  const handleSelectCalculation = (calculation: CalculationRecord) => {
    setActiveTab(calculation.type);
    // Outros estados seriam restaurados nos componentes filhos
  };

  return (
    <div className="calculator-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <motion.h1 
            className="calculator-title text-5xl font-bold mb-4 font-orbitron"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            IDALIA-CALC
          </motion.h1>
          <motion.p 
            className="text-blue-100 max-w-2xl mx-auto opacity-90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Calculadora científica para período fértil e idade gestacional
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Histórico de cálculos (sidebar) */}
          <motion.div 
            className="lg:col-span-3 order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <RecentCalculationsHistory 
              calculations={calculationHistory} 
              onSelect={handleSelectCalculation}
            />
          </motion.div>
          
          {/* Calculadora principal */}
          <motion.div 
            className="lg:col-span-9 order-1 lg:order-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="calculator-container p-4 rounded-xl">
              <div className="tab-buttons mb-4 grid grid-cols-2 gap-1">
                <button
                  onClick={() => setActiveTab("fertility")}
                  className={`tab-button flex items-center justify-center p-3 transition-all ${
                    activeTab === "fertility" 
                      ? "tab-button-active" 
                      : "tab-button-inactive"
                  }`}
                >
                  <span>Período Fértil</span>
                </button>
                <button
                  onClick={() => setActiveTab("gestational")}
                  className={`tab-button flex items-center justify-center p-3 transition-all ${
                    activeTab === "gestational" 
                      ? "tab-button-active" 
                      : "tab-button-inactive"
                  }`}
                >
                  <span>Idade Gestacional</span>
                </button>
              </div>

              <div className="calculator-content p-3 rounded-lg">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === "fertility" ? (
                      <FertilityCalculator onCalculate={handleCalculationUpdate} />
                    ) : (
                      <GestationalCalculator onCalculate={handleCalculationUpdate} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        <footer className="mt-8 text-center text-sm text-blue-200">
          <p>
            © {new Date().getFullYear()} IDALIA-CALC | Calculadora para uso informativo, não substitui orientação médica
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;