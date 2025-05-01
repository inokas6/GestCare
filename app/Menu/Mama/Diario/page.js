"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "../../../componets/Home/navbar_home";

const PregnancyDiary = () => {
  const [currentWeek, setCurrentWeek] = useState(12);
  const [date, setDate] = useState('');
  const [mood, setMood] = useState('feliz');
  const [kicks, setKicks] = useState(0);
  const [wellbeing, setWellbeing] = useState(8);
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [babySize, setBabySize] = useState('Limão');
  
  // Mapeia semanas para tamanhos de frutas/vegetais
  const babySizes = {
    8: 'Uva',
    12: 'Limão',
    16: 'Abacate',
    20: 'Banana',
    24: 'Milho',
    28: 'Berinjela',
    32: 'Melão',
    36: 'Abacaxi',
    40: 'Melancia'
  };
  
  // Atualiza o tamanho do bebê conforme a semana
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
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    setDate(formattedDate);
  }, []);
  
  const moodOptions = ['feliz', 'cansada', 'enjoada', 'ansiosa', 'energética'];
  
  const handleSaveEntry = () => {
    const newEntry = {
      id: Date.now(),
      date,
      week: currentWeek,
      mood,
      kicks,
      wellbeing,
      notes,
      babySize
    };
    
    setEntries([newEntry, ...entries]);
    setNotes('');
    setKicks(0);
    setWellbeing(8);
    setShowForm(false);
  };
  
  return (
    <div className="min-h-screen bg-white">
        <Navbar />
      {/* Header */}
      <header className="bg-pink-800 text-white py-6 px-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Meu Diário de Gravidez</h1>
            <p className="text-pink-200">{date} • Semana {currentWeek}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-medium">Bebê do tamanho de um</p>
            <p className="text-2xl font-bold">{babySize}</p>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        {/* Progress Bar */}
        <div className="mb-8 bg-pink-100 rounded-full h-6 overflow-hidden">
          <div 
            className="bg-pink-800 h-full text-xs text-white flex items-center justify-center"
            style={{ width: `${(currentWeek / 40) * 100}%` }}
          >
            {Math.round((currentWeek / 40) * 100)}%
          </div>
        </div>
        
        {/* Week Selector */}
        <div className="mb-8 bg-pink-50 p-4 rounded-lg shadow">
          <p className="text-pink-800 font-medium mb-2">Ajuste sua semana de gravidez:</p>
          <div className="flex items-center">
            <button 
              onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
              className="bg-pink-800 text-white w-8 h-8 rounded-full"
            >
              -
            </button>
            <input 
              type="range" 
              min="1" 
              max="40" 
              value={currentWeek} 
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              className="mx-4 w-full"
            />
            <button 
              onClick={() => setCurrentWeek(Math.min(40, currentWeek + 1))}
              className="bg-pink-800 text-white w-8 h-8 rounded-full"
            >
              +
            </button>
            <span className="ml-4 text-pink-800 font-bold text-xl">{currentWeek}</span>
          </div>
        </div>

        {/* Add New Entry Button */}
        {!showForm && (
          <button 
            className="bg-pink-800 text-white py-3 px-6 rounded-lg shadow-md hover:bg-pink-900 transition w-full flex justify-center items-center mb-8"
            onClick={() => setShowForm(true)}
          >
            <span className="text-2xl mr-2">+</span> Adicionar entrada no diário
          </button>
        )}
        
        {/* Entry Form */}
        {showForm && (
          <div className="bg-pink-50 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold text-pink-800 mb-4">Como está se sentindo hoje?</h2>
            
            {/* Mood Selection */}
            <div className="mb-6">
              <p className="text-pink-800 font-medium mb-2">Humor:</p>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setMood(option)}
                    className={`px-4 py-2 rounded-full ${
                      mood === option 
                        ? 'bg-pink-800 text-white' 
                        : 'bg-white text-pink-800 border border-pink-800'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Kicks Counter */}
            <div className="mb-6">
              <p className="text-pink-800 font-medium mb-2">Chutinhos hoje:</p>
              <div className="flex items-center">
                <button 
                  onClick={() => setKicks(Math.max(0, kicks - 1))}
                  className="bg-pink-200 text-pink-800 w-10 h-10 rounded-full font-bold text-xl"
                >
                  -
                </button>
                <span className="mx-6 text-pink-800 font-bold text-2xl">{kicks}</span>
                <button 
                  onClick={() => setKicks(kicks + 1)}
                  className="bg-pink-800 text-white w-10 h-10 rounded-full font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Wellbeing Slider */}
            <div className="mb-6">
              <p className="text-pink-800 font-medium mb-2">Bem-estar (1-10):</p>
              <div className="flex items-center">
                <span className="text-pink-800">1</span>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={wellbeing} 
                  onChange={(e) => setWellbeing(Number(e.target.value))}
                  className="mx-4 w-full"
                />
                <span className="text-pink-800">10</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-pink-800 font-bold text-xl">{wellbeing}</span>
              </div>
            </div>
            
            {/* Notes */}
            <div className="mb-6">
              <p className="text-pink-800 font-medium mb-2">Anotações do dia:</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Como foi seu dia? Alguma novidade?"
                className="w-full p-4 border border-pink-300 rounded-lg h-32"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                className="bg-pink-800 text-white py-2 px-6 rounded-lg shadow-md hover:bg-pink-900 transition flex-1"
                onClick={handleSaveEntry}
              >
                Salvar
              </button>
              <button 
                className="bg-white text-pink-800 border border-pink-800 py-2 px-6 rounded-lg shadow-md hover:bg-pink-100 transition"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        
        {/* Past Entries */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-pink-800 mb-4">Entradas anteriores</h2>
          
          {entries.length === 0 ? (
            <div className="text-center p-8 bg-pink-50 rounded-lg">
              <p className="text-pink-600">Sem entradas ainda. Adicione seu primeiro registro!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => (
                <div key={entry.id} className="bg-pink-50 p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-pink-800">{entry.date} • Semana {entry.week}</p>
                      <p className="text-pink-600">Humor: {entry.mood} • Chutinhos: {entry.kicks} • Bem-estar: {entry.wellbeing}/10</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg text-center">
                      <p className="text-xs text-pink-600">Bebê do tamanho de</p>
                      <p className="text-pink-800 font-bold">{entry.babySize}</p>
                    </div>
                  </div>
                  {entry.notes && <p className="text-gray-700">{entry.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-pink-800 text-white py-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <p>Diário de Gravidez • Acompanhe sua jornada</p>
        </div>
      </footer>
    </div>
  );
};

export default PregnancyDiary;