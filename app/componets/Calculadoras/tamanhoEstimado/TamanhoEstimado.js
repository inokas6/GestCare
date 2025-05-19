import React, { useState } from 'react';

const TamanhoEstimado = () => {
  const [semanaGestacao, setSemanaGestacao] = useState('');
  const [dataUltrassom, setDataUltrassom] = useState('');
  const [medidaFeto, setMedidaFeto] = useState('');
  const [resultado, setResultado] = useState(null);

  // Dados de referência para tamanho e peso por semana
  const dadosReferencia = {
    1: { tamanho: '0.1', peso: '0', comparacao: 'Menor que um grão de arroz' },
    2: { tamanho: '0.2', peso: '0', comparacao: 'Grão de papoila' },
    3: { tamanho: '0.3', peso: '0', comparacao: 'Grão de sésamo' },
    4: { tamanho: '0.4', peso: '0', comparacao: 'Semente de papaia' },
    5: { tamanho: '0.5', peso: '0', comparacao: 'Semente de maçã' },
    6: { tamanho: '0.6', peso: '0', comparacao: 'Lentilha' },
    7: { tamanho: '1.3', peso: '0', comparacao: 'Mirtilo' },
    8: { tamanho: '1.6', peso: '1', comparacao: 'Feijão' },
    9: { tamanho: '2.3', peso: '2', comparacao: 'Uva' },
    10: { tamanho: '3.1', peso: '4', comparacao: 'Morangueiro' },
    11: { tamanho: '4.1', peso: '7', comparacao: 'Figo' },
    12: { tamanho: '5.4', peso: '14', comparacao: 'Lima' },
    13: { tamanho: '7.4', peso: '23', comparacao: 'Limão' },
    14: { tamanho: '8.7', peso: '43', comparacao: 'Laranja' },
    15: { tamanho: '10.1', peso: '70', comparacao: 'Maçã' },
    16: { tamanho: '11.6', peso: '100', comparacao: 'Abacate' },
    17: { tamanho: '13.0', peso: '140', comparacao: 'Pera' },
    18: { tamanho: '14.2', peso: '190', comparacao: 'Pimento' },
    19: { tamanho: '15.3', peso: '240', comparacao: 'Manga' },
    20: { tamanho: '16.4', peso: '300', comparacao: 'Banana' },
    21: { tamanho: '26.7', peso: '360', comparacao: 'Cenoura' },
    22: { tamanho: '27.8', peso: '430', comparacao: 'Beringela' },
    23: { tamanho: '28.9', peso: '501', comparacao: 'Papaia' },
    24: { tamanho: '30.0', peso: '600', comparacao: 'Milho' },
    25: { tamanho: '34.6', peso: '660', comparacao: 'Couve-flor' },
    26: { tamanho: '35.6', peso: '760', comparacao: 'Alface' },
    27: { tamanho: '36.6', peso: '875', comparacao: 'Couve' },
    28: { tamanho: '37.6', peso: '1000', comparacao: 'Couve pequena' },
    29: { tamanho: '38.6', peso: '1150', comparacao: 'Ananás' },
    30: { tamanho: '39.9', peso: '1300', comparacao: 'Melão' },
    31: { tamanho: '41.1', peso: '1500', comparacao: 'Coco' },
    32: { tamanho: '42.4', peso: '1700', comparacao: 'Jaca pequena' },
    33: { tamanho: '43.7', peso: '1900', comparacao: 'Abóbora' },
    34: { tamanho: '45.0', peso: '2100', comparacao: 'Melancia pequena' },
    35: { tamanho: '46.2', peso: '2400', comparacao: 'Couve grande' },
    36: { tamanho: '47.4', peso: '2600', comparacao: 'Melancia média' },
    37: { tamanho: '48.6', peso: '2800', comparacao: 'Jaca média' },
    38: { tamanho: '49.8', peso: '3100', comparacao: 'Melancia grande' },
    39: { tamanho: '50.7', peso: '3300', comparacao: 'Jaca grande' },
    40: { tamanho: '51.2', peso: '3400', comparacao: 'Abóbora grande' },
  };

  const calcularTamanhoEstimado = () => {
    if (!semanaGestacao) {
      alert('Por favor, selecione a semana de gestação');
      return;
    }

    const semana = parseInt(semanaGestacao);
    const dadosSemana = dadosReferencia[semana];

    if (!dadosSemana) {
      alert('Semana inválida');
      return;
    }

    let crescimentoAjustado = dadosSemana;

    // Ajuste baseado na ecografia, se disponível
    if (dataUltrassom && medidaFeto) {
      const medidaReal = parseFloat(medidaFeto);
      const medidaPadrao = parseFloat(dadosSemana.tamanho);
      const fatorAjuste = medidaReal / medidaPadrao;

      crescimentoAjustado = {
        carregandodadosSemana,
        tamanho: (medidaReal).toFixed(1),
        peso: Math.round(parseFloat(dadosSemana.peso) * fatorAjuste)
      };
    }

    setResultado({
      carregandocrescimentoAjustado,
      semana
    });
  };

  return (
    <div className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text text-black">Semana atual da gestação</span>
        </label>
        <select 
          className="select select-bordered border-pink-200 focus:border-pink-500 text-black"
          value={semanaGestacao}
          onChange={(e) => setSemanaGestacao(e.target.value)}
        >
          <option value="" className="text-black">Selecione</option>
          {Object.keys(dadosReferencia).map((semana) => (
            <option key={semana} value={semana} className="text-black">{semana}ª semana</option>
          ))}
        </select>
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text text-black">Data da última ecografia (opcional)</span>
        </label>
        <input 
          type="date" 
          className="input input-bordered border-pink-200 focus:border-pink-500 text-black"
          value={dataUltrassom}
          onChange={(e) => setDataUltrassom(e.target.value)}
        />
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text text-black">Medida do feto na última ecografia (cm)</span>
        </label>
        <input 
          type="number" 
          step="0.1"
          placeholder="0.0" 
          className="input input-bordered border-pink-200 focus:border-pink-500 text-black"
          value={medidaFeto}
          onChange={(e) => setMedidaFeto(e.target.value)}
        />
      </div>
      
      <button 
        className="btn bg-gradient-to-r from-pink-600 to-pink-500 border-none text-white hover:from-pink-700 hover:to-pink-600 w-full mt-4"
        onClick={calcularTamanhoEstimado}
      >
        Ver Tamanho Estimado
      </button>

      {resultado && (
        <div className="mt-6 p-4 bg-pink-50 rounded-lg">
          <h3 className="text-lg font-semibold text-black mb-3">
            O seu bebé na {resultado.semana}ª semana:
          </h3>
          <div className="space-y-3">
            <p className="text-black">
              <span className="font-medium">Tamanho aproximado:</span> {resultado.tamanho} cm
            </p>
            <p className="text-black">
              <span className="font-medium">Peso aproximado:</span> {resultado.peso} gramas
            </p>
            <p className="text-black">
              <span className="font-medium">Comparação:</span> Tamanho aproximado de {resultado.comparacao.toLowerCase()}
            </p>
          </div>
          <div className="mt-4 text-sm text-black">
            <p>💡 Estas medidas são aproximadas e podem variar de bebé para bebé.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TamanhoEstimado; 