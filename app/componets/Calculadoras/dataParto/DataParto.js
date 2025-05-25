import React, { useState } from 'react';

const DataParto = () => {
  const [dataUltimaMenstruacao, setDataUltimaMenstruacao] = useState('');
  const [dataConcepcao, setDataConcepcao] = useState('');
  const [dataUltrassom, setDataUltrassom] = useState('');
  const [metodoCalculo, setMetodoCalculo] = useState('dum');
  const [cicloIrregular, setCicloIrregular] = useState(false);
  const [resultado, setResultado] = useState(null);

  const validarData = (data) => {
    const dataObj = new Date(data);
    return dataObj instanceof Date && !isNaN(dataObj);
  };

  const calcularDataParto = () => {
    let dataBase;
    let dataParto;

    switch (metodoCalculo) {
      case 'dum':
        if (!dataUltimaMenstruacao || !validarData(dataUltimaMenstruacao)) {
          alert('Por favor, preencha uma data válida da última menstruação');
          return;
        }
        dataBase = new Date(dataUltimaMenstruacao);
        dataParto = new Date(dataBase);
        dataParto.setDate(dataBase.getDate() + 7);
        dataParto.setMonth(dataBase.getMonth() + 9);
        break;

      case 'concepcao':
        if (!dataConcepcao || !validarData(dataConcepcao)) {
          alert('Por favor, preencha uma data válida da conceção');
          return;
        }
        dataBase = new Date(dataConcepcao);
        dataParto = new Date(dataBase);
        dataParto.setDate(dataBase.getDate() + 266); // 38 semanas
        break;

      case 'ultrassom':
        if (!dataUltrassom || !validarData(dataUltrassom)) {
          alert('Por favor, preencha uma data válida da ecografia');
          return;
        }
        dataBase = new Date(dataUltrassom);
        dataParto = new Date(dataBase);
        dataParto.setDate(dataBase.getDate() + 266);
        break;

      default:
        alert('Método de cálculo inválido');
        return;
    }

    // Ajuste para ciclo irregular (pode variar ±7 dias)
    const dataPartoMin = new Date(dataParto);
    const dataPartoMax = new Date(dataParto);

    if (cicloIrregular) {
      dataPartoMin.setDate(dataParto.getDate() - 7);
      dataPartoMax.setDate(dataParto.getDate() + 7);
    }

    // Cálculo da idade gestacional atual
    const hoje = new Date();
    const diffTime = Math.abs(hoje - dataBase);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const semanasGestacao = Math.floor(diffDays / 7);
    const diasRestantes = diffDays % 7;

    setResultado({
      dataParto: dataParto.toLocaleDateString('pt-PT'),
      dataPartoMin: cicloIrregular ? dataPartoMin.toLocaleDateString('pt-PT') : null,
      dataPartoMax: cicloIrregular ? dataPartoMax.toLocaleDateString('pt-PT') : null,
      semanasGestacao,
      diasRestantes
    });
  };

  return (
    <div className="space-y-4">
      {metodoCalculo === 'dum' && (
        <div className="form-control">
          <label className="label">
            <span className="label-text text-black">Data da última menstruação</span>
          </label>
          <input 
            type="date" 
            className="input input-bordered border-pink-200 focus:border-pink-500 text-black"
            value={dataUltimaMenstruacao}
            onChange={(e) => setDataUltimaMenstruacao(e.target.value)}
          />
        </div>
      )}

      {metodoCalculo === 'concepcao' && (
        <div className="form-control">
          <label className="label">
            <span className="label-text text-black">Data da conceção</span>
          </label>
          <input 
            type="date" 
            className="input input-bordered border-pink-200 focus:border-pink-500 text-black"
            value={dataConcepcao}
            onChange={(e) => setDataConcepcao(e.target.value)}
          />
        </div>
      )}

      {metodoCalculo === 'ultrassom' && (
        <div className="form-control">
          <label className="label">
            <span className="label-text text-black">Data da ecografia</span>
          </label>
          <input 
            type="date" 
            className="input input-bordered border-pink-200 focus:border-pink-500 text-black"
            value={dataUltrassom}
            onChange={(e) => setDataUltrassom(e.target.value)}
          />
        </div>
      )}
      
      <div className="tabs tabs-boxed justify-center bg-pink-50 p-1">
        <a 
          className={`tab ${metodoCalculo === 'dum' ? 'tab-active bg-rose-400 text-white' : 'text-black'}`}
          onClick={() => setMetodoCalculo('dum')}
        >
          Utilizar DUM
        </a>
        <a 
          className={`tab ${metodoCalculo === 'concepcao' ? 'tab-active bg-rose-400 text-white' : 'text-black'}`}
          onClick={() => setMetodoCalculo('concepcao')}
        >
          Utilizar data de conceção
        </a>
        <a 
          className={`tab ${metodoCalculo === 'ultrassom' ? 'tab-active bg-rose-400 text-white' : 'text-black'}`}
          onClick={() => setMetodoCalculo('ultrassom')}
        >
          Utilizar data da ecografia
        </a>
      </div>
      
      <div className="form-control mt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            className="checkbox checkbox-primary"
            checked={cicloIrregular}
            onChange={(e) => setCicloIrregular(e.target.checked)}
          />
          <span className="label-text text-black">Considerar ciclo irregular</span> 
        </label>
      </div>
      
      <button 
        className="btn bg-gradient-to-r from-rose-500 to-rose-400 border-none text-white hover:from-rose-600 hover:to-rose-500 w-full mt-4"
        onClick={calcularDataParto}
      >
        Calcular Data do Parto
      </button>

      {resultado && (
        <div className="mt-6 p-4 bg-pink-50 rounded-lg">
          <h3 className="text-lg font-semibold text-black mb-3">Resultado:</h3>
          <div className="space-y-2">
            <p className="text-black">
              <span className="font-medium">Data provável do parto:</span> {resultado.dataParto}
            </p>
            {cicloIrregular && (
              <div className="text-sm text-black">
                <p>Considerando ciclo irregular:</p>
                <p>Entre {resultado.dataPartoMin} e {resultado.dataPartoMax}</p>
              </div>
            )}
            <p className="text-black mt-4">
              <span className="font-medium">Idade gestacional atual:</span> {resultado.semanasGestacao} semanas e {resultado.diasRestantes} dias
            </p>
          </div>
          <div className="mt-4 text-sm text-black">
            <p>💡 A data provável do parto é uma estimativa. O bebé pode nascer naturalmente entre 37 e 42 semanas de gestação.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataParto; 