import React, { useState } from 'react';

const SignCalculator = () => {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [includeAstralMap, setIncludeAstralMap] = useState(false);
  const [result, setResult] = useState(null);

  const signs = [
    { 
      name: 'Áries', 
      start: [3, 21], 
      end: [4, 19],
      element: 'Fogo',
      characteristics: ['Corajoso', 'Determinado', 'Impulsivo', 'Energético'],
      compatibility: ['Leão', 'Sagitário', 'Gêmeos', 'Aquário']
    },
    { 
      name: 'Touro', 
      start: [4, 20], 
      end: [5, 20],
      element: 'Terra',
      characteristics: ['Persistente', 'Prático', 'Dedicado', 'Confiável'],
      compatibility: ['Virgem', 'Capricórnio', 'Câncer', 'Peixes']
    },
    { 
      name: 'Gêmeos', 
      start: [5, 21], 
      end: [6, 20],
      element: 'Ar',
      characteristics: ['Versátil', 'Comunicativo', 'Curioso', 'Adaptável'],
      compatibility: ['Libra', 'Aquário', 'Áries', 'Leão']
    },
    { 
      name: 'Câncer', 
      start: [6, 21], 
      end: [7, 22],
      element: 'Água',
      characteristics: ['Sensível', 'Protetor', 'Intuitivo', 'Emocional'],
      compatibility: ['Escorpião', 'Peixes', 'Touro', 'Virgem']
    },
    { 
      name: 'Leão', 
      start: [7, 23], 
      end: [8, 22],
      element: 'Fogo',
      characteristics: ['Criativo', 'Generoso', 'Carismático', 'Líder'],
      compatibility: ['Áries', 'Sagitário', 'Libra', 'Gêmeos']
    },
    { 
      name: 'Virgem', 
      start: [8, 23], 
      end: [9, 22],
      element: 'Terra',
      characteristics: ['Analítico', 'Prestativo', 'Perfeccionista', 'Organizado'],
      compatibility: ['Touro', 'Capricórnio', 'Câncer', 'Escorpião']
    },
    { 
      name: 'Libra', 
      start: [9, 23], 
      end: [10, 22],
      element: 'Ar',
      characteristics: ['Diplomático', 'Justo', 'Sociável', 'Harmonioso'],
      compatibility: ['Gêmeos', 'Aquário', 'Leão', 'Sagitário']
    },
    { 
      name: 'Escorpião', 
      start: [10, 23], 
      end: [11, 21],
      element: 'Água',
      characteristics: ['Intenso', 'Determinado', 'Misterioso', 'Perspicaz'],
      compatibility: ['Câncer', 'Peixes', 'Virgem', 'Capricórnio']
    },
    { 
      name: 'Sagitário', 
      start: [11, 22], 
      end: [12, 21],
      element: 'Fogo',
      characteristics: ['Otimista', 'Aventureiro', 'Honesto', 'Filosófico'],
      compatibility: ['Áries', 'Leão', 'Libra', 'Aquário']
    },
    { 
      name: 'Capricórnio', 
      start: [12, 22], 
      end: [1, 19],
      element: 'Terra',
      characteristics: ['Ambicioso', 'Responsável', 'Disciplinado', 'Paciente'],
      compatibility: ['Touro', 'Virgem', 'Escorpião', 'Peixes']
    },
    { 
      name: 'Aquário', 
      start: [1, 20], 
      end: [2, 18],
      element: 'Ar',
      characteristics: ['Inovador', 'Humanitário', 'Independente', 'Original'],
      compatibility: ['Gêmeos', 'Libra', 'Sagitário', 'Áries']
    },
    { 
      name: 'Peixes', 
      start: [2, 19], 
      end: [3, 20],
      element: 'Água',
      characteristics: ['Intuitivo', 'Compassivo', 'Artístico', 'Sonhador'],
      compatibility: ['Câncer', 'Escorpião', 'Touro', 'Capricórnio']
    }
  ];

  const calculateSign = () => {
    if (!birthDate) {
      alert('Por favor, insira uma data de nascimento.');
      return;
    }

    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Encontrar o signo correspondente
    const sign = signs.find(({ start, end }) => {
      if (start[0] === end[0]) {
        return month === start[0] && day >= start[1] && day <= end[1];
      } else {
        return (
          (month === start[0] && day >= start[1]) ||
          (month === end[0] && day <= end[1])
        );
      }
    });

    if (sign) {
      setResult(sign);
    } else {
      alert('Não foi possível determinar o signo. Verifique a data inserida.');
    }
  };

  const getElementColor = (element) => {
    const colors = {
      'Fogo': 'text-red-600',
      'Terra': 'text-yellow-800',
      'Ar': 'text-blue-500',
      'Água': 'text-blue-700'
    };
    return colors[element];
  };

  return (
    <div className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text text-black">Data de Nascimento</span>
        </label>
        <input
          type="date"
          className="input input-bordered border-pink-200 focus:border-pink-500 text-black"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text text-black">Horário de Nascimento (opcional)</span>
        </label>
        <input
          type="time"
          className="input input-bordered border-pink-200 focus:border-pink-500 text-black"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
        />
      </div>

      <div className="form-control">
        <label className="flex items-center gap-2 cursor-pointer mt-2">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={includeAstralMap}
            onChange={(e) => setIncludeAstralMap(e.target.checked)}
          />
          <span className="label-text text-black">Incluir mapa astral completo</span>
        </label>
      </div>

      <button
        className="btn bg-gradient-to-r from-pink-500 to-pink-400 border-none text-white hover:from-pink-600 hover:to-pink-500 w-full mt-4"
        onClick={calculateSign}
      >
        Descobrir Signo
      </button>

      {result && (
        <div className="mt-6 p-4 bg-pink-50 rounded-lg">
          <h3 className="text-2xl font-bold text-black mb-3">{result.name}</h3>
          
          <div className="space-y-4">
            <div>
              <p className={`text-lg font-medium ${getElementColor(result.element)}`}>
                Elemento: {result.element}
              </p>
              <p className="text-black mt-1">
                Período: {result.start[0]}/{result.start[1]} - {result.end[0]}/{result.end[1]}
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-black mb-2">Características:</h4>
              <div className="flex flex-wrap gap-2">
                {result.characteristics.map((trait, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pink-100 text-black rounded-full text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-black mb-2">Compatibilidade:</h4>
              <div className="flex flex-wrap gap-2">
                {result.compatibility.map((sign, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pink-100 text-black rounded-full text-sm"
                  >
                    {sign}
                  </span>
                ))}
              </div>
            </div>

            {includeAstralMap && (
              <div className="mt-4 p-4 bg-white rounded border border-pink-200">
                <h4 className="text-lg font-medium text-black mb-2">Mapa Astral:</h4>
                <p className="text-black">
                  Para um mapa astral completo, é necessário o horário exato de nascimento.
                  {!birthTime && ' Por favor, adicione o horário de nascimento.'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-black">
            <p>💡 A astrologia é uma interpretação milenar dos astros, mas não deve ser considerada como determinística.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignCalculator;