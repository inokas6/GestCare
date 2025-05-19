import React, { useState } from 'react';

const Caracteristicas = () => {
  const [caracteristicasPai, setCaracteristicasPai] = useState({
    corCabelo: '',
    corOlhos: '',
    tipoCabelo: '',
    lobuloOrelha: '',
    corPele: ''
  });

  const [caracteristicasMae, setCaracteristicasMae] = useState({
    corCabelo: '',
    corOlhos: '',
    tipoCabelo: '',
    lobuloOrelha: '',
    corPele: ''
  });

  const [resultado, setResultado] = useState(null);

  const caracteristicasGeneticas = {
    corCabelo: {
      preto: { gene: 'BB', dominancia: 3 },
      castanho: { gene: 'Br', dominancia: 2 },
      loiro: { gene: 'rr', dominancia: 1 },
      ruivo: { gene: 'Rr', dominancia: 1 }
    },
    corOlhos: {
      castanhoEscuro: { gene: 'CC', dominancia: 4 },
      castanhoClaro: { gene: 'Cc', dominancia: 3 },
      verde: { gene: 'Vv', dominancia: 2 },
      azul: { gene: 'aa', dominancia: 1 }
    },
    tipoCabelo: {
      crespo: { gene: 'CC', dominancia: 3 },
      ondulado: { gene: 'Oo', dominancia: 2 },
      liso: { gene: 'll', dominancia: 1 }
    },
    lobuloOrelha: {
      solto: { gene: 'SS', dominancia: 2 },
      preso: { gene: 'ss', dominancia: 1 }
    },
    corPele: {
      escura: { gene: 'EE', dominancia: 3 },
      morena: { gene: 'Em', dominancia: 2 },
      clara: { gene: 'mm', dominancia: 1 }
    }
  };

  const calcularProbabilidades = () => {
    const resultado = {};
    
    // Calcular probabilidades para cada característica
    Object.keys(caracteristicasGeneticas).forEach(caracteristica => {
      const genePai = caracteristicasGeneticas[caracteristica][caracteristicasPai[caracteristica]]?.gene;
      const geneMae = caracteristicasGeneticas[caracteristica][caracteristicasMae[caracteristica]]?.gene;

      if (!genePai || !geneMae) return;

      const combinacoes = [];
      for (let i = 0; i < genePai.length; i++) {
        for (let j = 0; j < geneMae.length; j++) {
          combinacoes.push(genePai[i] + geneMae[j]);
        }
      }

      // Calcular probabilidades para cada fenótipo possível
      const probabilidades = {};
      Object.entries(caracteristicasGeneticas[caracteristica]).forEach(([fenotipo, info]) => {
        const count = combinacoes.filter(gene => {
          const dominancia = info.dominancia;
          if (dominancia === 1) return gene.toLowerCase() === info.gene.toLowerCase();
          return gene.includes(info.gene[0]);
        }).length;

        probabilidades[fenotipo] = (count / combinacoes.length) * 100;
      });

      resultado[caracteristica] = probabilidades;
    });

    setResultado(resultado);
  };

  const traduzirCaracteristica = (caracteristica, valor) => {
    const traducoes = {
      corCabelo: {
        preto: 'Preto',
        castanho: 'Castanho',
        loiro: 'Loiro',
        ruivo: 'Ruivo'
      },
      corOlhos: {
        castanhoEscuro: 'Castanho Escuro',
        castanhoClaro: 'Castanho Claro',
        verde: 'Verde',
        azul: 'Azul'
      },
      tipoCabelo: {
        crespo: 'Crespo',
        ondulado: 'Ondulado',
        liso: 'Liso'
      },
      lobuloOrelha: {
        solto: 'Solto',
        preso: 'Preso'
      },
      corPele: {
        escura: 'Escura',
        morena: 'Morena',
        clara: 'Clara'
      }
    };

    return traducoes[caracteristica][valor];
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Características do Pai */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">Características do Pai</h3>
          {Object.keys(caracteristicasGeneticas).map((caracteristica) => (
            <div key={`pai-${caracteristica}`} className="form-control">
              <label className="label">
                <span className="label-text text-black">{caracteristica.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              </label>
              <select
                className="select select-bordered border-pink-200 focus:border-pink-500 text-black"
                value={caracteristicasPai[caracteristica]}
                onChange={(e) => setCaracteristicasPai({carregandocaracteristicasPai, [caracteristica]: e.target.value})}
              >
                <option value="" className="text-black">Selecione</option>
                {Object.keys(caracteristicasGeneticas[caracteristica]).map((valor) => (
                  <option key={valor} value={valor} className="text-black">
                    {traduzirCaracteristica(caracteristica, valor)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Características da Mãe */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">Características da Mãe</h3>
          {Object.keys(caracteristicasGeneticas).map((caracteristica) => (
            <div key={`mae-${caracteristica}`} className="form-control">
              <label className="label">
                <span className="label-text text-black">{caracteristica.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              </label>
              <select
                className="select select-bordered border-pink-200 focus:border-pink-500 text-black"
                value={caracteristicasMae[caracteristica]}
                onChange={(e) => setCaracteristicasMae({carregandocaracteristicasMae, [caracteristica]: e.target.value})}
              >
                <option value="" className="text-black">Selecione</option>
                {Object.keys(caracteristicasGeneticas[caracteristica]).map((valor) => (
                  <option key={valor} value={valor} className="text-black">
                    {traduzirCaracteristica(caracteristica, valor)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn bg-gradient-to-r from-pink-500 to-pink-400 border-none text-white hover:from-pink-600 hover:to-pink-500 w-full mt-6"
        onClick={calcularProbabilidades}
      >
        Calcular Probabilidades
      </button>

      {resultado && (
        <div className="mt-6 p-4 bg-pink-50 rounded-lg">
          <h3 className="text-lg font-semibold text-black mb-3">Probabilidades para o Bebé:</h3>
          {Object.entries(resultado).map(([caracteristica, probabilidades]) => (
            <div key={caracteristica} className="mb-4">
              <h4 className="font-medium text-black mb-2">
                {caracteristica.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
              </h4>
              <div className="space-y-1 pl-4">
                {Object.entries(probabilidades)
                  .filter(([_, prob]) => prob > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([valor, probabilidade]) => (
                    <p key={valor} className="text-black">
                      {traduzirCaracteristica(caracteristica, valor)}: {probabilidade.toFixed(1)}%
                    </p>
                  ))}
              </div>
            </div>
          ))}
          <div className="mt-4 text-sm text-black">
            <p>💡 Estas são probabilidades baseadas nas Leis de Mendel. Outros fatores genéticos e ambientais podem influenciar o resultado final.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Caracteristicas; 