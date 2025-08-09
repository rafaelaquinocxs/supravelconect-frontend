import React from 'react';
import { Link } from 'react-router-dom';

const EspecialidadesPage: React.FC = () => {
  const especialidades = [
    {
      id: 1,
      titulo: 'Manutenção Preventiva',
      icone: '🔧',
      descricao: 'Manutenção programada para evitar quebras e garantir o funcionamento ideal da sua empilhadeira.',
      problemas: [
        'Troca de óleo e filtros',
        'Verificação de freios',
        'Inspeção de correntes',
        'Calibragem de pneus',
        'Teste de sistemas hidráulicos'
      ],
      cor: 'from-blue-600 to-blue-700'
    },
    {
      id: 2,
      titulo: 'Manutenção Corretiva',
      icone: '⚡',
      descricao: 'Reparo rápido e eficiente quando sua empilhadeira apresenta problemas ou falhas.',
      problemas: [
        'Problemas no motor',
        'Falhas hidráulicas',
        'Defeitos elétricos',
        'Problemas de transmissão',
        'Reparos de emergência'
      ],
      cor: 'from-red-600 to-red-700'
    },
    {
      id: 3,
      titulo: 'Sistema Hidráulico',
      icone: '💧',
      descricao: 'Especialistas em sistemas hidráulicos de empilhadeiras, garantindo elevação e movimentação perfeitas.',
      problemas: [
        'Vazamentos de óleo',
        'Problemas de elevação',
        'Cilindros hidráulicos',
        'Bombas hidráulicas',
        'Mangueiras e conexões'
      ],
      cor: 'from-cyan-600 to-cyan-700'
    },
    {
      id: 4,
      titulo: 'Sistema Elétrico',
      icone: '⚡',
      descricao: 'Diagnóstico e reparo de sistemas elétricos, incluindo baterias e componentes eletrônicos.',
      problemas: [
        'Problemas de bateria',
        'Falhas no carregador',
        'Sistemas de controle',
        'Fiação elétrica',
        'Componentes eletrônicos'
      ],
      cor: 'from-yellow-600 to-yellow-700'
    },
    {
      id: 5,
      titulo: 'Motor e Transmissão',
      icone: '🔩',
      descricao: 'Manutenção completa de motores a combustão, elétricos e sistemas de transmissão.',
      problemas: [
        'Revisão de motor',
        'Problemas de transmissão',
        'Embreagem',
        'Sistema de combustível',
        'Arrefecimento'
      ],
      cor: 'from-gray-600 to-gray-700'
    },
    {
      id: 6,
      titulo: 'Freios e Segurança',
      icone: '🛡️',
      descricao: 'Manutenção de sistemas de freio e dispositivos de segurança para operação segura.',
      problemas: [
        'Sistema de freios',
        'Freio de estacionamento',
        'Dispositivos de segurança',
        'Alarmes e sinalizadores',
        'Sistemas de proteção'
      ],
      cor: 'from-green-600 to-green-700'
    },
    {
      id: 7,
      titulo: 'Pneus e Rodas',
      icone: '🛞',
      descricao: 'Serviços especializados em pneus, rodas e sistemas de direção de empilhadeiras.',
      problemas: [
        'Troca de pneus',
        'Balanceamento',
        'Alinhamento',
        'Problemas de direção',
        'Manutenção de rodas'
      ],
      cor: 'from-orange-600 to-orange-700'
    },
    {
      id: 8,
      titulo: 'Garfos e Acessórios',
      icone: '🔱',
      descricao: 'Manutenção e reparo de garfos, mastros e acessórios especiais para empilhadeiras.',
      problemas: [
        'Reparo de garfos',
        'Manutenção de mastro',
        'Acessórios especiais',
        'Correntes de elevação',
        'Sistemas de inclinação'
      ],
      cor: 'from-purple-600 to-purple-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Especialidades em Empilhadeiras</h1>
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Conectamos você com técnicos especializados em manutenção de empilhadeiras. 
            Suporte remoto especializado para todos os tipos de problemas.
          </p>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">200+</div>
              <div className="text-gray-300">Técnicos Especializados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">8</div>
              <div className="text-gray-300">Áreas de Especialidade</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">24/7</div>
              <div className="text-gray-300">Suporte Disponível</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">95%</div>
              <div className="text-gray-300">Problemas Resolvidos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Especialidades */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Nossas <span className="text-red-500">Especialidades</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {especialidades.map((especialidade) => (
              <div 
                key={especialidade.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className={`bg-gradient-to-r ${especialidade.cor} p-6 text-center`}>
                  <div className="text-4xl mb-3">{especialidade.icone}</div>
                  <h3 className="text-xl font-bold">{especialidade.titulo}</h3>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-300 mb-4 text-sm">
                    {especialidade.descricao}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-red-400">✓ Serviços inclusos:</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {especialidade.problemas.map((problema, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-red-500 mr-2">•</span>
                          {problema}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link 
                    to="/register"
                    className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    Conectar com Técnico
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tipos de Empilhadeiras */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Atendemos <span className="text-red-500">Todos os Tipos</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-gray-700 p-6 rounded-lg">
              <div className="text-4xl mb-4">🔋</div>
              <h3 className="text-xl font-bold mb-3 text-red-400">Empilhadeiras Elétricas</h3>
              <p className="text-gray-300 text-sm">
                Especialistas em sistemas elétricos, baterias, carregadores e componentes eletrônicos.
              </p>
            </div>
            
            <div className="text-center bg-gray-700 p-6 rounded-lg">
              <div className="text-4xl mb-4">⛽</div>
              <h3 className="text-xl font-bold mb-3 text-red-400">Empilhadeiras a Combustão</h3>
              <p className="text-gray-300 text-sm">
                Manutenção completa de motores a gasolina, diesel e GLP, incluindo sistemas de combustível.
              </p>
            </div>
            
            <div className="text-center bg-gray-700 p-6 rounded-lg">
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="text-xl font-bold mb-3 text-red-400">Empilhadeiras Industriais</h3>
              <p className="text-gray-300 text-sm">
                Atendimento especializado para equipamentos industriais de grande porte e alta capacidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Escolher */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">
              Como Escolher o <span className="text-red-500">Técnico Ideal</span>?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Avaliações</h3>
                <p className="text-gray-300">
                  Veja as avaliações de outros clientes para escolher técnicos com melhor reputação em empilhadeiras.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Especialização</h3>
                <p className="text-gray-300">
                  Filtre por tipo de problema e modelo de empilhadeira para encontrar o especialista certo.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Preço</h3>
                <p className="text-gray-300">
                  Compare preços por hora e escolha o técnico que oferece melhor custo-benefício para sua empilhadeira.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Sua empilhadeira com problema?
            </h2>
            <p className="text-xl text-red-100 mb-8">
              Conecte-se agora com um técnico especializado em empilhadeiras e resolva seu problema rapidamente.
            </p>
            <div className="space-x-4">
              <Link 
                to="/register"
                className="inline-block bg-white text-red-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Encontrar Técnico Agora
              </Link>
              <Link 
                to="/como-funciona"
                className="inline-block border border-white text-white font-bold py-4 px-8 rounded-lg hover:bg-white hover:text-red-600 transition-colors"
              >
                Como Funciona
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EspecialidadesPage;
