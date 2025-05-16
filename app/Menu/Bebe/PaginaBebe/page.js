"use client"
import { useState } from 'react';  
import Navbar from "../../../componets/Home/navbar_home";

// Layout principal
export default function BabyCarePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('development');

  // Fechar menu móvel quando uma seção é selecionada
  const handleSectionClick = (section) => {
    setCurrentSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col">
      <Header 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        handleSectionClick={handleSectionClick} 
        currentSection={currentSection} 
      />
      <main className="flex-grow">
        {currentSection === 'development' && <WeeklyDevelopmentSection />}
        {currentSection === 'milestones' && <MilestonesSection />}
        {currentSection === 'newborn' && <NewbornCareSection />}
        {currentSection === 'wellness' && <WellnessSection />}
        {currentSection === 'problems' && <CommonProblemsSection />}
        {currentSection === 'products' && <RecommendedProductsSection />}
      </main>
      <Footer />
    </div>
  );
}

// Componente de cabeçalho
function Header({ mobileMenuOpen, setMobileMenuOpen, handleSectionClick, currentSection }) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
    <div className="mt-80">
      <Navbar />
      </div>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-pink-800 text-2xl mr-2">♥</span>
          <h1 className="text-2xl font-bold text-pink-800">BebéCare</h1>
        </div>
        
        {/* Menu para desktop */}
        <nav className="hidden md:flex space-x-6">
          <NavLinks onSectionClick={handleSectionClick} currentSection={currentSection} />
        </nav>
        
        {/* Botão de menu para mobile */}
        <button 
          className="md:hidden text-pink-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>
      
      {/* Menu móvel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <NavLinks onSectionClick={handleSectionClick} currentSection={currentSection} />
          </nav>
        </div>
      )}
    </header>
  );
}

// Links de navegação
function NavLinks({ onSectionClick, currentSection }) {
  const links = [
    { id: 'development', name: 'Desenvolvimento Semanal' },
    { id: 'milestones', name: 'Marcos do Desenvolvimento' },
    { id: 'newborn', name: 'Cuidados com o Recém-nascido' },
    { id: 'wellness', name: 'Dicas de Bem-estar' },
    { id: 'problems', name: 'Problemas Comuns' },
    { id: 'products', name: 'Produtos Recomendados' },
  ];
  
  return (
    <>
      {links.map((link) => (
        <button
          key={link.id}
          onClick={() => onSectionClick(link.id)}
          className={`text-sm font-medium hover:text-pink-600 transition-colors ${
            currentSection === link.id ? 'text-pink-600 font-bold' : 'text-gray-700'
          }`}
        >
          {link.name}
        </button>
      ))}
    </>
  );
}

// Seção de desenvolvimento semanal
function WeeklyDevelopmentSection() {
  const weeks = [
    { week: 1, description: 'O óvulo fertilizado começa a se dividir.', size: 'Do tamanho de uma semente de papoula.' },
    { week: 4, description: 'O coração do bebé começa a bater.', size: 'Do tamanho de uma semente de mamão.' },
    { week: 8, description: 'Todos os órgãos principais começam a se formar.', size: 'Do tamanho de um feijão.' },
    { week: 12, description: 'O bebé pode sugar o polegar e tem unhas.', size: 'Do tamanho de um limão.' },
    { week: 16, description: 'Os movimentos do bebé podem ser sentidos.', size: 'Do tamanho de um abacate.' },
    { week: 20, description: 'O bebé tem sobrancelhas e cílios.', size: 'Do tamanho de uma banana.' },
    { week: 24, description: 'O bebé responde a sons externos.', size: 'Do tamanho de uma espiga de milho.' },
    { week: 28, description: 'Os olhos podem abrir e fechar.', size: 'Do tamanho de uma berinjela.' },
    { week: 32, description: 'O bebé pratica a respiração.', size: 'Do tamanho de um repolho.' },
    { week: 36, description: 'O bebé ganha peso rapidamente.', size: 'Do tamanho de um melão.' },
    { week: 40, description: 'O bebé está pronto para nascer!', size: 'Do tamanho de uma melancia pequena.' },
  ];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-pink-800 mb-8">Desenvolvimento Semana a Semana</h2>
        <p className="text-gray-700 mb-8">Acompanhe o crescimento e desenvolvimento do seu bebé dentro da barriga, semana a semana.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeks.map((item) => (
            <div key={item.week} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-3">
                <div className="bg-pink-800 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mr-4">
                  {item.week}
                </div>
                <h3 className="text-xl font-semibold text-pink-700">Semana {item.week}</h3>
              </div>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <p className="text-pink-600 font-medium">{item.size}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Seção de marcos do desenvolvimento
function MilestonesSection() {
  const milestones = [
    {
      age: '0-3 meses',
      achievements: [
        'Levantar a cabeça brevemente',
        'Começar a sorrir para pessoas',
        'Acompanhar objetos com os olhos',
        'Reconhecer rostos familiares',
        'Começar a balbuciar'
      ]
    },
    {
      age: '4-6 meses',
      achievements: [
        'Rolar de barriga para cima e para baixo',
        'Sentar com apoio',
        'Rir alto',
        'Mostrar curiosidade por objetos',
        'Responder ao próprio nome'
      ]
    },
    {
      age: '7-9 meses',
      achievements: [
        'Sentar sem apoio',
        'Engatinhar',
        'Transferir objetos de uma mão para outra',
        'Bater palmas',
        'Dizer "mamã" e "papá"'
      ]
    },
    {
      age: '10-12 meses',
      achievements: [
        'Ficar em pé sozinho',
        'Dar os primeiros passos',
        'Usar objetos corretamente',
        'Seguir instruções simples',
        'Dizer 2-3 palavras além de "mamã" e "papá"'
      ]
    }
  ];

  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-pink-800 mb-8">Marcos do Desenvolvimento</h2>
        <p className="text-gray-700 mb-8">Descubra o que esperar nos primeiros meses e anos do desenvolvimento do seu bebé.</p>
        
        <div className="space-y-8">
          {milestones.map((milestone, index) => (
            <div key={index} className="border-l-4 border-pink-800 pl-6">
              <h3 className="text-2xl font-bold text-pink-700 mb-4">{milestone.age}</h3>
              <ul className="space-y-2">
                {milestone.achievements.map((achievement, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-pink-600 mr-2">•</span>
                    <span className="text-gray-700">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Seção de cuidados com o recém-nascido
function NewbornCareSection() {
  const careCategories = [
    {
      title: 'Higiene',
      icon: '🧼',
      tips: [
        'Dar banho em dias alternados com água morna',
        'Limpar o umbigo com álcool 70%',
        'Trocar fraldas frequentemente',
        'Limpar suavemente as dobrinhas da pele'
      ]
    },
    {
      title: 'Sono',
      icon: '😴',
      tips: [
        'Colocar o bebé de barriga para cima',
        'Manter o ambiente calmo e escuro',
        'Estabelecer uma rotina de sono',
        'Evitar superaquecimento'
      ]
    },
    {
      title: 'Alimentação',
      icon: '🍼',
      tips: [
        'Amamentar em livre demanda',
        'Observar sinais de boa pega',
        'Arrotar após as mamadas',
        'Monitorar o ganho de peso'
      ]
    },
    {
      title: 'Vacinas',
      icon: '💉',
      tips: [
        'Seguir o calendário vacinal',
        'Manter a caderneta atualizada',
        'Observar reações após vacinas',
        'Consultar o pediatra regularmente'
      ]
    }
  ];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-pink-800 mb-8">Cuidados com o Recém-nascido</h2>
        <p className="text-gray-700 mb-8">Aprenda o essencial sobre os cuidados diários do seu recém-nascido.</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {careCategories.map((category, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{category.icon}</span>
                <h3 className="text-xl font-bold text-pink-700">{category.title}</h3>
              </div>
              <ul className="space-y-2">
                {category.tips.map((tip, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-pink-600 mr-2">•</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Seção de dicas de bem-estar
function WellnessSection() {
  const [activeTab, setActiveTab] = useState('massage');
  
  const tabs = [
    { id: 'massage', label: 'Massagem Infantil' },
    { id: 'sensory', label: 'Estimulação Sensorial' },
    { id: 'music', label: 'Música e Som' },
    { id: 'touch', label: 'Contato Pele a Pele' }
  ];
  
  const tabContent = {
    massage: {
      title: 'Massagem para Bebé',
      description: 'A massagem infantil fortalece o vínculo entre pais e bebé, além de proporcionar diversos benefícios para a saúde.',
      steps: [
        'Escolha um momento tranquilo, quando o bebé estiver alerta e calmo',
        'Use óleo vegetal natural próprio para bebés',
        'Comece com toques suaves nas pernas, depois braços, barriga e costas',
        'Observe os sinais do bebé: se ele mostrar desconforto, pare e tente outro dia',
        'Mantenha contato visual e converse com seu bebé durante a massagem'
      ]
    },
    sensory: {
      title: 'Estimulação Sensorial',
      description: 'Atividades sensoriais ajudam o desenvolvimento cerebral e cognitivo do seu bebé.',
      steps: [
        'Ofereça brinquedos com diferentes texturas, cores e sons',
        'Crie um "tempo de barriga" diário para fortalecer os músculos',
        'Use livros de alto contraste para estimular a visão',
        'Fale e cante frequentemente para o bebé',
        'Permita que o bebé explorar objetos seguros com a boca e mãos'
      ]
    },
    music: {
      title: 'Música e Som',
      description: 'A música tem um impacto positivo no desenvolvimento cerebral e emocional dos bebés.',
      steps: [
        'Cante para o seu bebé, independente da qualidade da sua voz',
        'Use músicas calmas durante a hora do sono',
        'Explore diferentes ritmos e estilos musicais',
        'Introduza instrumentos musicais simples como chocalhos',
        'Crie rotinas associadas a diferentes canções'
      ]
    },
    touch: {
      title: 'Contato Pele a Pele',
      description: 'O contato pele a pele, também conhecido como método canguru, traz inúmeros benefícios para o bebé e os pais.',
      steps: [
        'Posicione o bebé apenas de fralda contra o seu peito nu',
        'Cubra as costas do bebé com uma manta leve',
        'Pratique por pelo menos 1 hora sem interrupções',
        'Observe a respiração e temperatura do bebé',
        'Aproveite este momento para fortalecer o vínculo'
      ]
    }
  };
  
  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-pink-800 mb-8">Dicas de Bem-estar</h2>
        <p className="text-gray-700 mb-8">Descubra atividades e práticas que promovem o bem-estar do seu bebé.</p>
        
        <div className="bg-pink-50 rounded-lg p-1 flex mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors flex-shrink-0 ${
                activeTab === tab.id 
                  ? 'bg-white text-pink-800 shadow-sm' 
                  : 'text-pink-700 hover:bg-pink-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold text-pink-700 mb-4">{tabContent[activeTab].title}</h3>
          <p className="text-gray-700 mb-6">{tabContent[activeTab].description}</p>
          
          <div className="border-l-4 border-pink-300 pl-6">
            <h4 className="text-lg font-semibold text-pink-600 mb-4">Como fazer:</h4>
            <ol className="space-y-3">
              {tabContent[activeTab].steps.map((step, i) => (
                <li key={i} className="flex items-start">
                  <span className="bg-pink-100 text-pink-800 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    {i+1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

// Seção de problemas comuns
function CommonProblemsSection() {
  const problems = [
    {
      title: 'Cólicas',
      symptoms: 'Choro intenso, pernas recolhidas para o abdômen, punhos cerrados, face avermelhada.',
      solutions: [
        'Massagem circular na barriga no sentido horário',
        'Posição de "tigre" - bebé de barriga para baixo sobre o antebraço',
        'Compressas mornas na barriga',
        'Movimentos de bicicleta com as perninhas'
      ]
    },
    {
      title: 'Refluxo',
      symptoms: 'Regurgitação frequente, irritabilidade após alimentação, choro durante as mamadas, problemas ao dormir.',
      solutions: [
        'Manter o bebé em posição mais vertical durante e após a alimentação',
        'Fazer pausas durante a mamada para arrotar',
        'Elevar a cabeceira do berço levemente',
        'Consultar o pediatra para avaliar a necessidade de tratamento'
      ]
    },
    {
      title: 'Febre',
      symptoms: 'Temperatura acima de 37,8°C, irritabilidade, sonolência, falta de apetite.',
      solutions: [
        'Nos primeiros meses, qualquer febre requer consulta médica imediata',
        'Manter o bebé hidratado',
        'Vestir o bebé com roupas leves',
        'Não medicar sem orientação médica'
      ]
    },
    {
      title: 'Assaduras',
      symptoms: 'Vermelhidão na área da fralda, pele irritada, desconforto ao trocar a fralda.',
      solutions: [
        'Trocar a fralda com frequência',
        'Limpar bem a região com água morna a cada troca',
        'Deixar a pele secar completamente antes de colocar nova fralda',
        'Aplicar pomada específica para assaduras'
      ]
    }
  ];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-pink-800 mb-8">Problemas Comuns</h2>
        <p className="text-gray-700 mb-8">Saiba identificar e lidar com os problemas mais comuns do seu bebé.</p>
        
        <div className="space-y-8">
          {problems.map((problem, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-pink-700 mb-4">{problem.title}</h3>
              
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-pink-600 mb-2">Sintomas:</h4>
                <p className="text-gray-700">{problem.symptoms}</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-pink-600 mb-2">O que fazer:</h4>
                <ul className="space-y-2">
                  {problem.solutions.map((solution, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-pink-600 mr-2">•</span>
                      <span className="text-gray-700">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Seção de produtos recomendados
function RecommendedProductsSection() {
  const categories = [
    {
      name: 'Fraldas',
      products: [
        { title: 'Fraldas de Algodão Reutilizáveis', rating: 4.8, price: 'R$ 89,90', key: 'eco' },
        { title: 'Fraldas Premium Ultrassuaves', rating: 4.7, price: 'R$ 65,90', key: 'premium' },
        { title: 'Fraldas Noturnas Extra-absorventes', rating: 4.5, price: 'R$ 72,50', key: 'night' }
      ]
    },
    {
      name: 'Cremes e Loções',
      products: [
        { title: 'Hidratante Corporal Hipoalergênico', rating: 4.9, price: 'R$ 39,90', key: 'hydra' },
        { title: 'Pomada para Assaduras Natural', rating: 4.8, price: 'R$ 28,90', key: 'diaper' },
        { title: 'Óleo de Massagem Relaxante', rating: 4.6, price: 'R$ 42,50', key: 'oil' }
      ]
    },
    {
      name: 'Roupas Essenciais',
      products: [
        { title: 'Kit 3 Bodies Manga Longa Algodão Orgânico', rating: 4.7, price: 'R$ 119,90', key: 'body' },
        { title: 'Macacão Térmico Acolchoado', rating: 4.8, price: 'R$ 89,90', key: 'thermal' },
        { title: 'Conjunto Casaco e Calça em Plush', rating: 4.6, price: 'R$ 79,90', key: 'outfit' }
      ]
    }
  ];

  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-pink-800 mb-8">Produtos Recomendados</h2>
        <p className="text-gray-700 mb-8">Selecionamos os melhores produtos para o cuidado do seu bebé.</p>
        
        {categories.map((category, index) => (
          <div key={index} className="mb-12 last:mb-0">
            <h3 className="text-2xl font-bold text-pink-700 mb-6 border-b-2 border-pink-200 pb-2">{category.name}</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.products.map((product) => (
                <div key={product.key} className="bg-pink-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-full h-48 bg-white rounded-md flex items-center justify-center mb-4">
                    <span className="text-5xl">📦</span>
                  </div>
                  <h4 className="text-lg font-semibold text-pink-800 mb-2">{product.title}</h4>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {"★".repeat(Math.floor(product.rating))}
                      {"☆".repeat(5 - Math.floor(product.rating))}
                    </div>
                    <span className="text-gray-600 text-sm ml-2">{product.rating}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-700 font-bold">{product.price}</span>
                    <button className="bg-pink-800 hover:bg-pink-900 text-white py-1 px-4 rounded-md text-sm transition-colors">
                      Ver detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Rodapé
function Footer() {
  return (
    <footer className="bg-pink-800 text-white py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center">
              <span className="text-2xl mr-2">♥</span>
              <h2 className="text-xl font-bold">BebéCare</h2>
            </div>
            <p className="mt-2 text-pink-200 max-w-md">
              Seu guia completo sobre desenvolvimento infantil e cuidados com o bebé.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold mb-3">Navegação</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-pink-200 hover:text-white transition-colors">Início</a></li>
                <li><a href="#" className="text-pink-200 hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="text-pink-200 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-pink-200 hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Redes Sociais</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-pink-200 hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="text-pink-200 hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="text-pink-200 hover:text-white transition-colors">YouTube</a></li>
                <li><a href="#" className="text-pink-200 hover:text-white transition-colors">Pinterest</a></li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-semibold mb-3">Newsletter</h3>
              <p className="text-pink-200 mb-3">Receba dicas e novidades sobre cuidados com o bebé.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Seu e-mail" 
                  className="bg-pink-700 text-white px-3 py-2 rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <button className="bg-white text-pink-800 px-4 py-2 rounded-r-md font-medium hover:bg-pink-100 transition-colors">
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-pink-700 mt-8 pt-6 text-center text-pink-300">
          <p>&copy; {new Date().getFullYear()} BebéCare. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}