import React, { useState } from 'react';

const PeriodoFertil = () => {
  const [ultimaMenstruacao, setUltimaMenstruacao] = useState('');
  const [duracaoCiclo, setDuracaoCiclo] = useState('');
  const [resultado, setResultado] = useState(null);

  const calcularPeriodoFertil = () => {
    if (!ultimaMenstruacao || !duracaoCiclo) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const dataUltimaMenstruacao = new Date(ultimaMenstruacao);
    const ciclo = parseInt(duracaoCiclo);

    // Cálculo do período fértil
    const inicioFertil = new Date(dataUltimaMenstruacao);
    inicioFertil.setDate(dataUltimaMenstruacao.getDate() + (ciclo - 18));

    const fimFertil = new Date(dataUltimaMenstruacao);
    fimFertil.setDate(dataUltimaMenstruacao.getDate() + (ciclo - 11));

    const ovulacao = new Date(dataUltimaMenstruacao);
    ovulacao.setDate(dataUltimaMenstruacao.getDate() + (ciclo - 14));

    setResultado({
      inicioFertil: inicioFertil.toLocaleDateString('pt-PT'),
      fimFertil: fimFertil.toLocaleDateString('pt-PT'),
      ovulacao: ovulacao.toLocaleDateString('pt-PT')
    });
  };

  return (
    <div className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text text-black">Data da última menstruação</span>
        </label>
        <input 
          type="date" 
          className="input input-bordered border-pink-200 focus:border-pink-500 text-black"
          value={ultimaMenstruacao}
          onChange={(e) => setUltimaMenstruacao(e.target.value)}
        />
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text text-black">Duração média do seu ciclo</span>
        </label>
        <select 
          className="select select-bordered border-pink-200 focus:border-pink-500 text-black"
          value={duracaoCiclo}
          onChange={(e) => setDuracaoCiclo(e.target.value)}
        >
          <option value="" className="text-black">Selecione</option>
          {[...Array(15)].map((_, i) => (
            <option key={i + 21} value={i + 21} className="text-black">{i + 21} dias</option>
          ))}
        </select>
      </div>
      
      <button 
        className="btn bg-gradient-to-r from-fuchsia-500 to-purple-400 border-none text-white hover:from-fuchsia-600 hover:to-purple-500 w-full mt-4"
        onClick={calcularPeriodoFertil}
      >
        Calcular Período Fértil
      </button>

      {resultado && (
        <div className="mt-6 p-4 bg-pink-50 rounded-lg">
          <h3 className="text-lg font-semibold text-black mb-3">Resultado:</h3>
          <div className="space-y-2">
            <p className="text-black">
              <span className="font-medium">Início do período fértil:</span> {resultado.inicioFertil}
            </p>
            <p className="text-black">
              <span className="font-medium">Dia provável da ovulação:</span> {resultado.ovulacao}
            </p>
            <p className="text-black">
              <span className="font-medium">Fim do período fértil:</span> {resultado.fimFertil}
            </p>
          </div>
          <div className="mt-4 text-sm text-black">
            <p>💡 Estas são as datas mais prováveis para engravidar. Para aumentar as probabilidades, considere ter relações durante todo o período fértil.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodoFertil; 