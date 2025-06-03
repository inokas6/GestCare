"use client";
import { useState, useEffect } from 'react';
import Navbar from '../../../componets/Home/navbar_home';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from 'date-fns';

const PregnancyDiary = () => {
  const [currentWeek, setCurrentWeek] = useState(12);
  const [date, setDate] = useState('');
  const [mood, setMood] = useState('feliz');
  const [kicks, setKicks] = useState(0);
  const [wellbeing, setWellbeing] = useState(8);
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [babySize, setBabySize] = useState('Limão');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [lastKickTime, setLastKickTime] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  
  // Novos estados para filtros
  const [filtroHumor, setFiltroHumor] = useState('todos');
  const [filtroSintoma, setFiltroSintoma] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [entradasFiltradas, setEntradasFiltradas] = useState([]);
  
  const supabase = createClientComponentClient();
  
  // Lista de sintomas comuns na gravidez
  const symptomsList = [
    'Náusea', 'Cansaço', 'Inchaço', 'Dor nas costas', 
    'Azia', 'Insónia', 'Dor de cabeça', 'Desejos alimentares'
  ];
  
  // Mapeia semanas para tamanhos de frutas/vegetais com imagens
  const babySizes = {
    4: { name: 'Semente de Papoila', description: 'Quase do tamanho de uma semente de papoila (1-2mm)' },
    8: { name: 'Framboesa', description: 'O seu bebé está a crescer rapidamente, aproximadamente 1,6cm' },
    12: { name: 'Limão', description: 'Agora com cerca de 5-6cm e pesando cerca de 14g' },
    16: { name: 'Abacate', description: 'O seu bebé tem aproximadamente 11-12cm' },
    20: { name: 'Banana', description: 'Cerca de 25cm do topo da cabeça até aos calcanhares' },
    24: { name: 'Milho', description: 'O seu bebé tem aproximadamente 30cm e pesa cerca de 600g' },
    28: { name: 'Beringela', description: 'Cerca de 37cm e pesando aproximadamente 1kg' },
    32: { name: 'Melão', description: 'O seu bebé tem 42-43cm e pesa cerca de 1,7kg' },
    36: { name: 'Ananás', description: 'Aproximadamente 47cm e pesando cerca de 2,5kg' },
    40: { name: 'Melancia', description: 'Completamente desenvolvido! Cerca de 50cm e 3-3,5kg' }
  };
  
  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        // Buscar utilizador atual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (user) {
          setUserId(user.id);
          
          // Buscar dados da gravidez
          const { data: gravidezData, error: gravidezError } = await supabase
            .from('gravidez_info')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (gravidezError && gravidezError.code !== 'PGRST116') throw gravidezError;
          
          if (gravidezData) {
            const dataInicio = new Date(gravidezData.data_ultima_menstruacao);
            const hoje = new Date();
            const diffWeeks = Math.floor((hoje - dataInicio) / (1000 * 60 * 60 * 24 * 7)) + 2;
            setCurrentWeek(Math.min(diffWeeks, 40));
          }
          
          // Buscar entradas do diário
          await fetchDiaryEntries(user.id);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndData();
  }, []);

  const fetchDiaryEntries = async (userId) => {
    try {
      const { data: entriesData, error: entriesError } = await supabase
        .from('diario_entradas')
        .select(`
          *,
          diario_sintomas (
            sintoma
          )
        `)
        .eq('user_id', userId)
        .order('data', { ascending: false });
        
      if (entriesError) throw entriesError;
      
      const formattedEntries = entriesData.map(entry => ({
        id: entry.id,
        date: format(new Date(entry.data), 'dd/MM/yyyy'),
        week: entry.semana_gestacao,
        mood: entry.humor,
        kicks: entry.chutes,
        wellbeing: entry.bem_estar,
        notes: entry.notas,
        babySize: entry.tamanho_bebe,
        symptoms: entry.diario_sintomas?.map(s => s.sintoma) || []
      }));
      
      setEntries(formattedEntries);
    } catch (error) {
      console.error('Erro ao carregar entradas do diário:', error);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    const confirmar = window.confirm('Tem certeza que deseja eliminar esta entrada? Esta ação não pode ser desfeita.');
    if (!confirmar) return;

    try {
      // Primeiro, eliminar os sintomas relacionados
      const { error: sintomasError } = await supabase
        .from('diario_sintomas')
        .delete()
        .eq('entrada_id', entryId);

      if (sintomasError) throw sintomasError;

      // Depois, eliminar a entrada principal
      const { error: entryError } = await supabase
        .from('diario_entradas')
        .delete()
        .eq('id', entryId);

      if (entryError) throw entryError;

      // Atualizar a lista de entradas
      await fetchDiaryEntries(userId);
      
      // Mostrar mensagem de sucesso
      alert('Entrada eliminada com sucesso!');
    } catch (error) {
      console.error('Erro ao eliminar entrada:', error);
      alert('Erro ao eliminar entrada. Por favor, tente novamente.');
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setMood(entry.mood);
    setKicks(entry.kicks);
    setWellbeing(entry.wellbeing);
    setNotes(entry.notes);
    setSymptoms(entry.symptoms);
    setShowForm(true);
  };

  const handleSaveEntry = async () => {
    if (!userId) {
      alert('Por favor, faça login para guardar entradas no diário');
      return;
    }

    // Adicionar confirmação se estiver editando ou adicionando nova entrada
    const mensagemConfirmacao = editingEntry 
      ? 'Tem certeza que deseja guardar as alterações?' 
      : 'Tem certeza que deseja adicionar uma nova entrada?';
    
    const confirmar = window.confirm(mensagemConfirmacao);
    if (!confirmar) {
      return;
    }

    try {
      if (editingEntry) {
        // Atualizar entrada existente
        const { error: entryError } = await supabase
          .from('diario_entradas')
          .update({
            humor: mood,
            chutes: kicks,
            bem_estar: wellbeing,
            notas: notes,
            tamanho_bebe: babySize.name
          })
          .eq('id', editingEntry.id);

        if (entryError) throw entryError;

        // Eliminar sintomas antigos
        const { error: deleteSintomasError } = await supabase
          .from('diario_sintomas')
          .delete()
          .eq('entrada_id', editingEntry.id);

        if (deleteSintomasError) throw deleteSintomasError;

        // Inserir novos sintomas
        if (symptoms.length > 0) {
          const sintomasData = symptoms.map(sintoma => ({
            entrada_id: editingEntry.id,
            sintoma: sintoma
          }));

          const { error: sintomasError } = await supabase
            .from('diario_sintomas')
            .insert(sintomasData);

          if (sintomasError) throw sintomasError;
        }

        // Mostrar mensagem de sucesso
        alert('Entrada atualizada com sucesso!');
      } else {
        // Inserir nova entrada
        const { data: entryData, error: entryError } = await supabase
          .from('diario_entradas')
          .insert([{
            user_id: userId,
            data: new Date().toISOString(),
            semana_gestacao: currentWeek,
            humor: mood,
            chutes: kicks,
            bem_estar: wellbeing,
            notas: notes,
            tamanho_bebe: babySize.name
          }])
          .select()
          .single();

        if (entryError) throw entryError;

        if (symptoms.length > 0) {
          const sintomasData = symptoms.map(sintoma => ({
            entrada_id: entryData.id,
            sintoma: sintoma
          }));

          const { error: sintomasError } = await supabase
            .from('diario_sintomas')
            .insert(sintomasData);

          if (sintomasError) throw sintomasError;
        }

        // Mostrar mensagem de sucesso
        alert('Nova entrada adicionada com sucesso!');
      }

      // Atualizar lista de entradas
      await fetchDiaryEntries(userId);

      // Limpar formulário
      setNotes('');
      setKicks(0);
      setWellbeing(8);
      setSymptoms([]);
      setShowForm(false);
      setEditingEntry(null);

    } catch (error) {
      console.error('Erro ao guardar entrada:', error);
      alert('Erro ao guardar entrada no diário. Por favor, tente novamente.');
    }
  };
  
  // Regista o tempo entre os Pontapés
  const handleKickTimer = () => {
    const now = new Date();
    if (!isTimerActive) {
      setIsTimerActive(true);
      setLastKickTime(now);
    } else {
      setKicks(kicks + 1);
      setLastKickTime(now);
    }
  };
  
  // Parar o cronômetro de chutes
  const stopKickTimer = () => {
    setIsTimerActive(false);
  };
  
  // Atualiza o tamanho do bebé conforme a semana
  useEffect(() => {
    const sizes = Object.keys(babySizes).map(Number);
    const closestWeek = sizes.reduce((prev, curr) => {
      return (Math.abs(curr - currentWeek) < Math.abs(prev - currentWeek) ? curr : prev);
    });
    setBabySize(babySizes[closestWeek]);
  }, [currentWeek]);
  
  // Formata a data para o formato brasileiro
  useEffect(() => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    setDate(formattedDate);
  }, []);
  
  // Formatador de tempo para o cronômetro
  const formatTime = (time) => {
    if (!time) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Opções de humor com emojis
  const moodOptions = [
    { value: 'feliz', emoji: '😊', label: 'Feliz' },
    { value: 'cansada', emoji: '😴', label: 'Cansada' },
    { value: 'enjoada', emoji: '🤢', label: 'Enjoada' },
    { value: 'ansiosa', emoji: '😰', label: 'Ansiosa' },
    { value: 'energética', emoji: '⚡', label: 'Energética' },
    { value: 'emotiva', emoji: '😢', label: 'Emotiva' }
  ];
  
  // Função para toggle de sintomas
  const toggleSymptom = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };
  
  // Gera um gradiente de cores com base no bem-estar
  const getWellbeingColor = (value) => {
    if (value <= 3) return 'from-red-400 to-red-600';
    if (value <= 6) return 'from-yellow-400 to-yellow-600';
    return 'from-green-400 to-green-600';
  };
  
  // Gera os dias do calendário
  const generateCalendarDays = () => {
    const daysInMonth = new Date(
      selectedDate.getFullYear(), 
      selectedDate.getMonth() + 1, 
      0
    ).getDate();
    
    const firstDay = new Date(
      selectedDate.getFullYear(), 
      selectedDate.getMonth(), 
      1
    ).getDay();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };
  
  // Formata mês e ano para exibição no calendário
  const formatMonthYear = (date) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };
  
  // Altera o mês do calendário
  const changeMonth = (increment) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
  };
  
  // Adicionar esta função para obter o emoji do humor
  const getMoodEmoji = (mood) => {
    const moodOption = moodOptions.find(m => m.value === mood);
    return moodOption ? moodOption.emoji : '●';
  };
  
  // Modificar a função hasEntryOnDay
  const hasEntryOnDay = (day) => {
    if (!day) return false;
    
    const formattedDay = day.toString().padStart(2, '0');
    const formattedMonth = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const formattedYear = selectedDate.getFullYear();
    const dateString = `${formattedDay}/${formattedMonth}/${formattedYear}`;
    
    const entry = entries.find(entry => entry.date === dateString);
    return entry ? entry.mood : false;
  };
  
  // Função para filtrar as entradas
  useEffect(() => {
    let resultado = [...entries];

    // Filtro por humor
    if (filtroHumor !== 'todos') {
      resultado = resultado.filter(entry => entry.mood === filtroHumor);
    }

    // Filtro por sintoma
    if (filtroSintoma !== 'todos') {
      resultado = resultado.filter(entry => entry.symptoms.includes(filtroSintoma));
    }

    // Filtro por período
    const hoje = new Date();
    if (filtroPeriodo !== 'todos') {
      resultado = resultado.filter(entry => {
        const dataEntrada = new Date(entry.date.split('/').reverse().join('-'));
        const diffDias = Math.floor((hoje - dataEntrada) / (1000 * 60 * 60 * 24));
        
        switch (filtroPeriodo) {
          case '7dias':
            return diffDias <= 7;
          case '30dias':
            return diffDias <= 30;
          case '90dias':
            return diffDias <= 90;
          default:
            return true;
        }
      });
    }

    setEntradasFiltradas(resultado);
  }, [entries, filtroHumor, filtroSintoma, filtroPeriodo]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white text-pink-900">
      <div className="mt-[80px]">
        <Navbar />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-700"></div>
        </div>
      ) : (
        <main className="max-w-5xl mx-auto p-4 relative z-10">
                  
          
          {/* Quick Stats & Calendar Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Total Kicks */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                <span className="text-pink-800 text-2xl font-bold">👶</span>
              </div>
              <h3 className="text-xl font-bold text-pink-800">Total de Pontapés</h3>
              <p className="text-3xl font-bold text-pink-700 mt-2">{entries.reduce((sum, entry) => sum + entry.kicks, 0) + kicks}</p>
            </div>
            
            {/* Diary Entries */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                <span className="text-pink-800 text-2xl font-bold">📓</span>
              </div>
              <h3 className="text-xl font-bold text-pink-800">Entradas no Diário</h3>
              <p className="text-3xl font-bold text-pink-700 mt-2">{entries.length}</p>
            </div>
            
            {/* Calendar Toggle */}
            <div 
              className="bg-gradient-to-r from-pink-600 to-pink-800 p-6 rounded-2xl shadow-lg text-white cursor-pointer hover:shadow-xl transition-all"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Calendário</h3>
                  <p className="text-pink-200 mt-1">{showCalendar ? "Ocultar" : "Visualizar"} calendário</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Calendar (Conditionally Rendered) */}
          {showCalendar && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100 mb-10">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => changeMonth(-1)}
                  className="text-pink-800 hover:text-pink-600 p-2"
                >
                  &lt; Anterior
                </button>
                <h3 className="text-xl font-bold text-pink-800">{formatMonthYear(selectedDate)}</h3>
                <button
                  onClick={() => changeMonth(1)}
                  className="text-pink-800 hover:text-pink-600 p-2"
                >
                  Próximo &gt;
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-pink-800 font-medium p-2">
                    {day}
                  </div>
                ))}
                
                {generateCalendarDays().map((day, index) => (
                  <div 
                    key={index}
                    className={`
                      p-2 rounded-lg relative
                      ${day ? 'hover:bg-pink-50 cursor-pointer' : ''}
                      ${hasEntryOnDay(day) ? 'bg-pink-100' : ''}
                    `}
                  >
                    {day && (
                      <>
                        {day}
                        {hasEntryOnDay(day) && (
                          <span className="absolute bottom-1 right-1 text-lg">
                            {getMoodEmoji(hasEntryOnDay(day))}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Filtros do Diário */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100 mb-10">
            <h3 className="text-lg font-semibold text-pink-800 mb-4">Filtrar entradas:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por Humor */}
              <div>
                <label className="block text-sm font-medium text-pink-700 mb-2">Humor</label>
                <select
                  value={filtroHumor}
                  onChange={(e) => setFiltroHumor(e.target.value)}
                  className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black"
                >
                  <option value="todos">Todos os humores</option>
                  {moodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.emoji} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Sintoma */}
              <div>
                <label className="block text-sm font-medium text-pink-700 mb-2">Sintoma</label>
                <select
                  value={filtroSintoma}
                  onChange={(e) => setFiltroSintoma(e.target.value)}
                  className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black"
                >
                  <option value="todos">Todos os sintomas</option>
                  {symptomsList.map((symptom) => (
                    <option key={symptom} value={symptom}>
                      {symptom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Período */}
              <div>
                <label className="block text-sm font-medium text-pink-700 mb-2">Período</label>
                <select
                  value={filtroPeriodo}
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                  className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black"
                >
                  <option value="todos">Todo o período</option>
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                  <option value="90dias">Últimos 90 dias</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Add New Entry Button */}
          {!showForm && (
            <button 
              className="bg-gradient-to-r from-pink-600 to-pink-800 text-white py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all w-full flex justify-center items-center mb-10 transform hover:-translate-y-1"
              onClick={() => setShowForm(true)}
            >
              <span className="text-2xl mr-2">+</span> Adicionar entrada no diário
            </button>
          )}
          
          {/* Entry Form */}
          {showForm && (
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-pink-100 mb-10">
              <h2 className="text-2xl font-bold text-pink-800 mb-6 text-center">
                {editingEntry ? 'Editar entrada do diário' : 'Como se está a sentir hoje?'}
              </h2>
              
              {/* Mood Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-pink-800 mb-4">Humor:</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {moodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setMood(option.value)}
                      className={`
                        flex flex-col items-center justify-center p-4 rounded-xl transition-all
                        ${mood === option.value 
                          ? 'bg-pink-700 text-white shadow-lg transform scale-105' 
                          : 'bg-white text-pink-800 border border-pink-200 hover:border-pink-400'}
                      `}
                    >
                      <span className="text-2xl mb-1">{option.emoji}</span>
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Symptoms Checklist */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-pink-800 mb-4">Sintomas:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {symptomsList.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`
                        py-3 px-4 rounded-lg text-left text-sm transition-all
                        ${symptoms.includes(symptom) 
                          ? 'bg-pink-700 text-white shadow-md' 
                          : 'bg-white text-pink-800 border border-pink-200 hover:border-pink-400'}
                      `}
                    >
                      <span className="mr-2">{symptoms.includes(symptom) ? '✓' : '○'}</span>
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Kicks Timer */}
              <div className="mb-8 bg-pink-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-pink-800 mb-4">Contador de Pontapés:</h3>
                <div className="flex flex-col items-center">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-pink-700 mb-2">{kicks}</div>
                    <p className="text-pink-600">pontapés registados</p>
                  </div>
                  
                  {isTimerActive ? (
                    <div className="w-full max-w-md">
                      <div className="bg-white border-2 border-pink-400 rounded-full h-24 w-24 mx-auto flex items-center justify-center mb-4 shadow-lg">
                        <button
                          onClick={handleKickTimer}
                          className="h-20 w-20 rounded-full bg-pink-600 text-white flex items-center justify-center transform active:scale-95 transition-all text-sm font-medium"
                        >
                          PONTAPÉ!
                        </button>
                      </div>
                      
                      <div className="flex justify-center mb-4">
                        <button
                          onClick={stopKickTimer}
                          className="bg-pink-200 text-pink-800 py-2 px-6 rounded-full text-sm"
                        >
                          Parar contador
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleKickTimer}
                      className="bg-gradient-to-r from-pink-600 to-pink-800 text-white py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      Iniciar contador de pontapés
                    </button>
                  )}
                </div>
              </div>
              
              {/* Wellbeing Slider */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-pink-800 mb-4">Bem-estar:</h3>
                <div className="flex items-center mb-2">
                  <span className="text-pink-800 text-sm">1</span>
                  <div className="flex-1 mx-4 relative">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={wellbeing} 
                      onChange={(e) => setWellbeing(Number(e.target.value))}
                      className="w-full h-3 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-700"
                    />
                  </div>
                  <span className="text-pink-800 text-sm">10</span>
                </div>
                <div className="flex justify-center mt-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getWellbeingColor(wellbeing)} flex items-center justify-center shadow-md`}>
                    <span className="text-white font-bold text-xl">{wellbeing}</span>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-pink-800 mb-4">Anotações do dia:</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Como foi o seu dia? Alguma novidade? Sentimentos ou pensamentos especiais?"
                  className="w-full p-4 border border-pink-200 rounded-xl h-40 focus:border-pink-400 focus:ring focus:ring-pink-200 focus:ring-opacity-50 outline-none"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className="bg-gradient-to-r from-pink-600 to-pink-800 text-white py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all flex-1 font-medium"
                  onClick={handleSaveEntry}
                >
                  Guardar no diário
                </button>
                <button 
                  className="bg-white text-pink-800 border border-pink-300 py-3 px-8 rounded-xl shadow-sm hover:bg-pink-50 transition-all"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          
          {/* Past Entries */}
          <div className="mt-8 mb-16">
            <h2 className="text-2xl font-bold text-pink-800 mb-6 flex items-center">
              <span className="w-8 h-8 bg-pink-700 text-white rounded-full flex items-center justify-center mr-2 text-sm">📖</span>
              Entradas anteriores
            </h2>
            
            {entradasFiltradas.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-2xl shadow-md border border-pink-100">
                <div className="w-20 h-20 mx-auto bg-pink-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-xl font-bold text-pink-800 mb-2">Nenhuma entrada encontrada</h3>
                <p className="text-pink-600">Tente ajustar os filtros ou adicione uma nova entrada!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {entradasFiltradas.map(entry => (
                  <div key={entry.id} className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100 hover:shadow-xl transition-all">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center">
                          <span className="bg-pink-700 text-white text-xs px-3 py-1 rounded-full mr-2">Semana {entry.week}</span>
                          <span className="text-pink-600">{entry.date}</span>
                        </div>
                        <h3 className="text-xl font-bold text-pink-800 mt-2">
                          {moodOptions.find(m => m.value === entry.mood)?.emoji || ''} {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="bg-pink-50 p-3 rounded-xl flex space-x-6">
                          <div className="text-center">
                            <p className="text-xs text-pink-600">Pontapés</p>
                            <p className="text-pink-800 font-bold text-lg">{entry.kicks}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-pink-600">Bem-estar</p>
                            <p className="text-pink-800 font-bold text-lg">{entry.wellbeing}/10</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-pink-600">Bebé</p>
                            <p className="text-pink-800 font-bold text-lg">{entry.babySize}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg text-sm hover:bg-pink-200 transition-colors"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm hover:bg-red-200 transition-colors"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {entry.symptoms.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-pink-600 mb-2">Sintomas:</p>
                        <div className="flex flex-wrap gap-2">
                          {entry.symptoms.map(symptom => (
                            <span key={symptom} className="bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {entry.notes && (
                      <div className="bg-pink-50 p-4 rounded-xl mt-4">
                        <p className="text-pink-800">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
};

export default PregnancyDiary;