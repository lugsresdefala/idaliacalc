import { useState } from "react";
import GestationalCalculator from "@/components/calculator/GestationalCalculator";
import FertilityCalculator from "@/components/calculator/FertilityCalculator";

const Home = () => {
  const [activeTab, setActiveTab] = useState<"gestational" | "fertility">("gestational");

  return (
    <div className="bg-neutral-100 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-medium text-primary mb-2">Calculadoras de Gravidez e Fertilidade</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ferramentas precisas para cálculo de idade gestacional e período fértil baseadas em padrões médicos
          </p>
        </header>

        <div className="bg-white rounded-t-lg shadow-sm flex border-b">
          <button
            onClick={() => setActiveTab("gestational")}
            className={`flex-1 py-4 px-6 text-center font-medium transition ${
              activeTab === "gestational" ? "text-primary border-b-2 border-primary" : ""
            }`}
          >
            Idade Gestacional
          </button>
          <button
            onClick={() => setActiveTab("fertility")}
            className={`flex-1 py-4 px-6 text-center font-medium transition ${
              activeTab === "fertility" ? "text-primary border-b-2 border-primary" : ""
            }`}
          >
            Período Fértil
          </button>
        </div>

        {activeTab === "gestational" ? (
          <GestationalCalculator />
        ) : (
          <FertilityCalculator />
        )}

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            Esta ferramenta fornece estimativas baseadas em cálculos padrão. Consulte sempre um profissional de saúde para orientações específicas.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;