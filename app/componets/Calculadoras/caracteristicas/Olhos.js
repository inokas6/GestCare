import React, { useState } from 'react';

const MendelCalculator = () => {
  const [fatherTrait, setFatherTrait] = useState('');
  const [motherTrait, setMotherTrait] = useState('');
  const [result, setResult] = useState('');

  const traits = {
    eyeColor: {
      brown: 'BB', // Dominante (homozigoto)
      green: 'Gg', // Intermediário (heterozigoto)
      blue: 'bb',  // Recessivo (homozigoto)
    },
  };

  const calculateProbability = () => {
    const fatherGene = traits.eyeColor[fatherTrait];
    const motherGene = traits.eyeColor[motherTrait];

    if (!fatherGene || !motherGene) {
      setResult('Por favor, selecione características válidas.');
      return;
    }

    // Gerar todas as combinações possíveis de genes
    const possibleGenotypes = [];
    for (let i = 0; i < fatherGene.length; i++) {
      for (let j = 0; j < motherGene.length; j++) {
        possibleGenotypes.push(fatherGene[i] + motherGene[j]);
      }
    }

    // Contar quantos genótipos resultam em cada cor de olhos
    const brownEyesCount = possibleGenotypes.filter(
      (genotype) => genotype.includes('B')
    ).length;
    const greenEyesCount = possibleGenotypes.filter(
      (genotype) => genotype.includes('G')
    ).length;
    const blueEyesCount = possibleGenotypes.filter(
      (genotype) => genotype === 'bb'
    ).length;

    // Calcular as probabilidades
    const totalGenotypes = possibleGenotypes.length;
    const brownEyesProbability = (brownEyesCount / totalGenotypes) * 100;
    const greenEyesProbability = (greenEyesCount / totalGenotypes) * 100;
    const blueEyesProbability = (blueEyesCount / totalGenotypes) * 100;

    // Determinar a cor dominante
    const dominantTrait = brownEyesCount > 0 ? 'Castanhos' : greenEyesCount > 0 ? 'Verdes' : 'Azuis';

    // Exibir o resultado
    setResult(`
      Cor dominante: ${dominantTrait}
      Probabilidade de olhos castanhos: ${brownEyesProbability.toFixed(2)}%
      Probabilidade de olhos verdes: ${greenEyesProbability.toFixed(2)}%
      Probabilidade de olhos azuis: ${blueEyesProbability.toFixed(2)}%
    `);
  };

  return (
    <div className="min-h-screen text-black flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-pink-500 mb-6 text-center">Calculadora dos Olhos </h1>
        <div className="space-y-4">
          <div>
            <label className="block text-pink-500 font-semibold mb-2">Característica do Pai:</label>
            <select
              className="w-full p-2 border border-pink-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={fatherTrait}
              onChange={(e) => setFatherTrait(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="brown">Olhos Castanhos</option>
              <option value="green">Olhos Verdes</option>
              <option value="blue">Olhos Azuis</option>
            </select>
          </div>
          <div>
            <label className="block text-pink-500 font-semibold mb-2">Característica da Mãe:</label>
            <select
              className="w-full p-2 border border-pink-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={motherTrait}
              onChange={(e) => setMotherTrait(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="brown">Olhos Castanhos</option>
              <option value="green">Olhos Verdes</option>
              <option value="blue">Olhos Azuis</option>
            </select>
          </div>
          <button
            className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition duration-300"
            onClick={calculateProbability}
          >
            Calcular
          </button>
        </div>

        {/* Área de Resultado */}
        {result && (
          <div className="mt-6 p-4 bg-pink-200 rounded-lg text-pink-700">
            <h2 className="text-xl font-semibold mb-2">Resultado</h2>
            <pre className="text-lg whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default MendelCalculator;