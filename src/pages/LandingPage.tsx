import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [stats, setStats] = useState({
    users: 0,
    sessions: 0,
    satisfaction: 0,
    response: 0
  });

  // Animação dos números
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        users: 500,
        sessions: 12000,
        satisfaction: 98,
        response: 2
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Carrossel de depoimentos
  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Gerente de Manutenção",
      company: "Indústria ABC",
      text: "O Supravel Connect revolucionou nossa manutenção. Conseguimos resolver problemas em minutos que antes levavam horas.",
      rating: 5
    },
    {
      name: "Ana Santos",
      role: "Especialista em Elétrica",
      company: "Freelancer",
      text: "Como especialista, encontrei uma fonte de renda estável e flexível. A plataforma é intuitiva e os pagamentos são pontuais.",
      rating: 5
    },
    {
      name: "Roberto Lima",
      role: "Diretor de Operações",
      company: "Metalúrgica XYZ",
      text: "Reduzimos 70% do tempo de parada das máquinas. O ROI foi imediato e a qualidade do suporte é excepcional.",
      rating: 5
    }
  ];

  const specialties = [
    { name: "Elétrica", icon: "⚡", description: "Instalações e reparos elétricos" },
    { name: "Hidráulica", icon: "🔧", description: "Sistemas hidráulicos e tubulações" },
    { name: "Motor", icon: "⚙️", description: "Motores e sistemas mecânicos" },
    { name: "Transmissão", icon: "🔗", description: "Sistemas de transmissão" },
    { name: "Sistemas Eletrônicos", icon: "💻", description: "Eletrônica e automação" },
    { name: "Manutenção Preventiva", icon: "🛠️", description: "Prevenção e inspeções" }
  ];

  const features = [
    {
      icon: "🎯",
      title: "Conexão Instantânea",
      description: "Conecte-se com especialistas em segundos, 24/7"
    },
    {
      icon: "🔒",
      title: "Segurança Garantida",
      description: "Usuários verificados e certificados para sua tranquilidade"
    },
    {
      icon: "💰",
      title: "Preços Transparentes",
      description: "Sem surpresas. Você sabe exatamente quanto vai pagar"
    },
    {
      icon: "📱",
      title: "Suporte Remoto",
      description: "Resolva problemas sem sair do local com nossa tecnologia"
    },
    {
      icon: "📊",
      title: "Relatórios Detalhados",
      description: "Acompanhe todas as intervenções e mantenha histórico"
    },
    {
      icon: "⚡",
      title: "Resposta Rápida",
      description: "Tempo médio de resposta de apenas 2 minutos"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ef4444' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Conecte-se com{' '}
                <span className="text-primary-500 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  Especialistas
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Suporte técnico remoto para empilhadeiras e equipamentos industriais. 
                Resolva problemas rapidamente com nossa rede de especialistas certificados.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link
                  to="/auth/register"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Começar Agora
                </Link>
                <Link
                  to="/auth/register"
                  className="border-2 border-gray-600 hover:border-primary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-primary-500/10"
                >
                  Cadastrar-se
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary-500 mb-1">
                    {stats.users}+
                  </div>
                  <div className="text-gray-400 text-sm">Usuários</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary-500 mb-1">
                    {stats.sessions.toLocaleString()}+
                  </div>
                  <div className="text-gray-400 text-sm">Sessões</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary-500 mb-1">
                    {stats.satisfaction}%
                  </div>
                  <div className="text-gray-400 text-sm">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary-500 mb-1">
                    {stats.response}min
                  </div>
                  <div className="text-gray-400 text-sm">Resposta</div>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl p-8 backdrop-blur-sm border border-primary-500/30">
                <div className="bg-gray-800 rounded-lg p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">JS</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">João Silva</div>
                        <div className="text-green-400 text-sm flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          Online
                        </div>
                      </div>
                    </div>
                    <div className="text-yellow-400 flex">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                  
                  <div className="text-gray-300 text-sm mb-4">
                    "Problema na empilhadeira resolvido em 15 minutos. Excelente suporte!"
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Há 2 minutos</span>
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                      Resolvido
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-primary-500 text-white p-3 rounded-full shadow-lg animate-bounce">
                ⚡
              </div>
              <div className="absolute -bottom-4 -left-4 bg-green-500 text-white p-3 rounded-full shadow-lg animate-pulse">
                ✓
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Nossa plataforma conecta você com especialistas em tempo real
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-primary-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Descreva o Problema</h3>
              <p className="text-gray-400">
                Conte-nos sobre o problema do seu equipamento e a urgência da situação
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-primary-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Conecte com Especialista</h3>
              <p className="text-gray-400">
                Nosso sistema encontra o especialista mais adequado para seu problema específico
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-primary-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Resolva Remotamente</h3>
              <p className="text-gray-400">
                Receba suporte em tempo real via chat, vídeo ou telefone até resolver o problema
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Especialidades Disponíveis
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Especialistas em diversas áreas para atender suas necessidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((specialty, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all duration-300 hover:scale-105 border border-gray-700 hover:border-primary-500/50"
              >
                <div className="text-4xl mb-4">{specialty.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{specialty.name}</h3>
                <p className="text-gray-400">{specialty.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Por que Escolher o Supravel Connect?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Tecnologia avançada e expertise técnica para resolver seus problemas rapidamente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-lg p-6 hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-primary-500/50"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              O que Nossos Usuários Dizem
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Depoimentos reais de empresas que transformaram sua manutenção
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <div className="text-center">
                <div className="text-yellow-400 text-2xl mb-4">
                  {'★'.repeat(testimonials[currentTestimonial].rating)}
                </div>
                
                <blockquote className="text-xl text-gray-300 mb-6 italic">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {testimonials[currentTestimonial].name.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {testimonials[currentTestimonial].role} - {testimonials[currentTestimonial].company}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicators */}
            <div className="flex justify-center space-x-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para Revolucionar sua Manutenção?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Junte-se a centenas de empresas que já reduziram custos e aumentaram a eficiência
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Começar Gratuitamente
            </Link>
            <Link
              to="/auth/login"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
