import React, { useState } from 'react';

const MendelCalculator = () => {
  const [fatherTrait, setFatherTrait] = useState('');
  const [motherTrait, setMotherTrait] = useState('');
  const [result, setResult] = useState('');

  const traits = {
    hairColor: {
      black: 'BB', // Dominante (homozigoto)
      brown: 'Br', // Intermediário (heterozigoto)
      blonde: 'rr',  // Recessivo (homozigoto)
    },
  };

  const calculateProbability = () => {
    const fatherGene = traits.hairColor[fatherTrait];
    const motherGene = traits.hairColor[motherTrait];

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

    // Contar quantos genótipos resultam em cada cor de cabelo
    const blackHairCount = possibleGenotypes.filter(
      (genotype) => genotype.includes('B')
    ).length;
    const brownHairCount = possibleGenotypes.filter(
      (genotype) => genotype.includes('r') && genotype.includes('B')
    ).length;
    const blondeHairCount = possibleGenotypes.filter(
      (genotype) => genotype === 'rr'
    ).length;

    // Calcular as probabilidades
    const totalGenotypes = possibleGenotypes.length;
    const blackHairProbability = (blackHairCount / totalGenotypes) * 100;
    const brownHairProbability = (brownHairCount / totalGenotypes) * 100;
    const blondeHairProbability = (blondeHairCount / totalGenotypes) * 100;

    // Determinar a cor dominante
    const dominantTrait = blackHairCount > 0 ? 'Preto' : brownHairCount > 0 ? 'Castanho' : 'Loiro';

    // Exibir o resultado
    setResult(`
      Cor dominante: ${dominantTrait}
      Probabilidade de cabelo preto: ${blackHairProbability.toFixed(2)}%
      Probabilidade de cabelo castanho: ${brownHairProbability.toFixed(2)}%
      Probabilidade de cabelo loiro: ${blondeHairProbability.toFixed(2)}%
    `);
  };

  return (
    <div className="min-h-screen text-black flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-pink-500 mb-6 text-center">Calculadora do Cabelo</h1>
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-pink-700">Característica do Pai:</span>
            </label>
            <select
              className="select select-bordered border-pink-200 focus:border-pink-500"
              value={fatherTrait}
              onChange={(e) => setFatherTrait(e.target.value)}
            >
              <option disabled value="">Selecione</option>
              <option value="black">Cabelo Preto</option>
              <option value="brown">Cabelo Castanho</option>
              <option value="blonde">Cabelo Loiro</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-pink-700">Característica da Mãe:</span>
            </label>
            <select
              className="select select-bordered border-pink-200 focus:border-pink-500"
              value={motherTrait}
              onChange={(e) => setMotherTrait(e.target.value)}
            >
              <option disabled value="">Selecione</option>
              <option value="black">Cabelo Preto</option>
              <option value="brown">Cabelo Castanho</option>
              <option value="blonde">Cabelo Loiro</option>
            </select>
          </div>

          <button
            className="btn bg-gradient-to-r from-pink-500 to-pink-400 border-none text-white hover:from-pink-600 hover:to-pink-500 w-full mt-4"
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