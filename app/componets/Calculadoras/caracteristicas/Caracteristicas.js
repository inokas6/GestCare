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
      preto: { gene: 'BB', dominancia: 'dominante' },
      castanho: { gene: 'Bb', dominancia: 'dominante' },
      loiro: { gene: 'bb', dominancia: 'recessivo' },
      ruivo: { gene: 'RR', dominancia: 'recessivo' }
    },
    corOlhos: {
      castanhoEscuro: { gene: 'BB', dominancia: 'dominante' },
      castanhoClaro: { gene: 'Bb', dominancia: 'dominante' },
      verde: { gene: 'GG', dominancia: 'dominante' },
      azul: { gene: 'bb', dominancia: 'recessivo' }
    },
    tipoCabelo: {
      crespo: { gene: 'CC', dominancia: 'dominante' },
      ondulado: { gene: 'Cc', dominancia: 'dominante' },
      liso: { gene: 'cc', dominancia: 'recessivo' }
    },
    lobuloOrelha: {
      solto: { gene: 'DD', dominancia: 'dominante' },
      preso: { gene: 'dd', dominancia: 'recessivo' }
    },
    corPele: {
      escura: { gene: 'EE', dominancia: 'dominante' },
      morena: { gene: 'Ee', dominancia: 'dominante' },
      clara: { gene: 'ee', dominancia: 'recessivo' }
    }
  };

  const calcularProbabilidades = () => {
    // Verificar se pelo menos uma característica foi selecionada
    const caracteristicasSelecionadas = Object.keys(caracteristicasGeneticas).filter(caracteristica => 
      caracteristicasPai[caracteristica] && caracteristicasMae[caracteristica]
    );

    if (caracteristicasSelecionadas.length === 0) {
      alert('Por favor, selecione pelo menos uma característica para o pai e para a mãe.');
      return;
    }

    const resultado = {};
    
    // Calcular probabilidades para cada característica
    Object.keys(caracteristicasGeneticas).forEach(caracteristica => {
      const genePai = caracteristicasGeneticas[caracteristica][caracteristicasPai[caracteristica]]?.gene;
      const geneMae = caracteristicasGeneticas[caracteristica][caracteristicasMae[caracteristica]]?.gene;

      if (!genePai || !geneMae) return;

      // Gerar gametas (cada pai contribui com um alelo)
      const gametasPai = genePai.split('');
      const gametasMae = geneMae.split('');

      // Criar quadrado de Punnett (todas as combinações possíveis)
      const quadradoPunnett = [];
      gametasPai.forEach(aleloPai => {
        gametasMae.forEach(aleloMae => {
          // Ordenar os alelos (maiúsculo primeiro para dominante)
          const alelos = [aleloPai, aleloMae].sort((a, b) => {
            if (a === a.toUpperCase() && b === b.toLowerCase()) return -1;
            if (a === a.toLowerCase() && b === b.toUpperCase()) return 1;
            return 0;
          });
          quadradoPunnett.push(alelos.join(''));
        });
      });

      // Calcular probabilidades para cada fenótipo usando as leis de Mendel
      const probabilidades = {};
      
      // Para cada fenótipo possível
      Object.entries(caracteristicasGeneticas[caracteristica]).forEach(([fenotipo, info]) => {
        let count = 0;
        
        quadradoPunnett.forEach(genotipo => {
          let corresponde = false;
          
          if (info.dominancia === 'dominante') {
            // Para características dominantes, pelo menos um alelo dominante
            const aleloDominante = info.gene[0].toUpperCase();
            corresponde = genotipo.includes(aleloDominante);
          } else {
            // Para características recessivas, ambos os alelos devem ser recessivos
            const alelosRecessivos = info.gene.toLowerCase();
            corresponde = genotipo.toLowerCase() === alelosRecessivos;
          }
          
          if (corresponde) count++;
        });
        
        probabilidades[fenotipo] = (count / quadradoPunnett.length) * 100;
      });
      
      // Filtrar apenas probabilidades maiores que 0 e normalizar para somar 100%
      const probabilidadesFiltradas = {};
      let totalProb = 0;
      
      Object.entries(probabilidades).forEach(([fenotipo, prob]) => {
        if (prob > 0) {
          probabilidadesFiltradas[fenotipo] = prob;
          totalProb += prob;
        }
      });
      
      // Normalizar para que somem 100%
      if (totalProb > 0) {
        Object.keys(probabilidadesFiltradas).forEach(fenotipo => {
          probabilidadesFiltradas[fenotipo] = (probabilidadesFiltradas[fenotipo] / totalProb) * 100;
        });
      }
      
      resultado[caracteristica] = probabilidadesFiltradas;
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
                onChange={(e) => setCaracteristicasPai({...caracteristicasPai, [caracteristica]: e.target.value})}
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
                onChange={(e) => setCaracteristicasMae({...caracteristicasMae, [caracteristica]: e.target.value})}
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