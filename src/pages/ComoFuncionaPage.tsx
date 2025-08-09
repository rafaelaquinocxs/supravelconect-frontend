import React from 'react';
import { Link } from 'react-router-dom';

const ComoFuncionaPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Como Funciona</h1>
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Conectamos você com técnicos especializados em poucos cliques. 
            Suporte remoto rápido, seguro e eficiente.
          </p>
        </div>
      </section>

      {/* Processo em 4 Etapas */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Processo Simples em <span className="text-red-500">4 Etapas</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Etapa 1 */}
            <div className="text-center">
              <div className="bg-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Descreva o Problema</h3>
              <p className="text-gray-400">
                Conte-nos qual é o problema técnico que você está enfrentando. 
                Seja específico para encontrarmos o técnico ideal.
              </p>
            </div>

            {/* Etapa 2 */}
            <div className="text-center">
              <div className="bg-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Escolha o Técnico</h3>
              <p className="text-gray-400">
                Veja perfis de técnicos especializados, avaliações, preços 
                e escolha o profissional que melhor atende suas necessidades.
              </p>
            </div>

            {/* Etapa 3 */}
            <div className="text-center">
              <div className="bg-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Conecte-se</h3>
              <p className="text-gray-400">
                Inicie uma videochamada segura com compartilhamento de tela. 
                O técnico resolve seu problema em tempo real.
              </p>
            </div>

            {/* Etapa 4 */}
            <div className="text-center">
              <div className="bg-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold">4</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Problema Resolvido</h3>
              <p className="text-gray-400">
                Pague apenas pelo tempo utilizado e avalie o atendimento. 
                Simples, rápido e eficiente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Principais */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Recursos <span className="text-red-500">Principais</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Videochamada */}
            <div className="bg-gray-700 p-8 rounded-lg">
              <div className="text-red-500 text-4xl mb-4">🎥</div>
              <h3 className="text-2xl font-bold mb-4">Videochamada HD</h3>
              <p className="text-gray-300">
                Comunicação clara e direta com o técnico através de videochamadas 
                em alta definição com áudio cristalino.
              </p>
            </div>

            {/* Compartilhamento de Tela */}
            <div className="bg-gray-700 p-8 rounded-lg">
              <div className="text-red-500 text-4xl mb-4">🖥️</div>
              <h3 className="text-2xl font-bold mb-4">Compartilhamento de Tela</h3>
              <p className="text-gray-300">
                O técnico pode ver exatamente o que está acontecendo no seu 
                dispositivo para diagnóstico preciso.
              </p>
            </div>

            {/* Chat em Tempo Real */}
            <div className="bg-gray-700 p-8 rounded-lg">
              <div className="text-red-500 text-4xl mb-4">💬</div>
              <h3 className="text-2xl font-bold mb-4">Chat em Tempo Real</h3>
              <p className="text-gray-300">
                Troque mensagens instantâneas durante o atendimento para 
                esclarecimentos adicionais.
              </p>
            </div>

            {/* Pagamento Seguro */}
            <div className="bg-gray-700 p-8 rounded-lg">
              <div className="text-red-500 text-4xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-4">Pagamento Seguro</h3>
              <p className="text-gray-300">
                Sistema de pagamento integrado e seguro. Pague apenas pelo 
                tempo de atendimento utilizado.
              </p>
            </div>

            {/* Técnicos Verificados */}
            <div className="bg-gray-700 p-8 rounded-lg">
              <div className="text-red-500 text-4xl mb-4">✅</div>
              <h3 className="text-2xl font-bold mb-4">Técnicos Verificados</h3>
              <p className="text-gray-300">
                Todos os técnicos passam por processo de verificação e 
                avaliação contínua da qualidade.
              </p>
            </div>

            {/* Suporte 24/7 */}
            <div className="bg-gray-700 p-8 rounded-lg">
              <div className="text-red-500 text-4xl mb-4">🕐</div>
              <h3 className="text-2xl font-bold mb-4">Disponível 24/7</h3>
              <p className="text-gray-300">
                Técnicos disponíveis a qualquer hora do dia ou da noite. 
                Suporte quando você mais precisa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vantagens */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">
                Por que escolher o <span className="text-red-500">SupravelConnect</span>?
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="text-red-500 text-2xl">⚡</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Atendimento Rápido</h3>
                    <p className="text-gray-400">
                      Conecte-se com técnicos em minutos, não em horas ou dias.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-red-500 text-2xl">💰</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Preço Justo</h3>
                    <p className="text-gray-400">
                      Pague apenas pelo tempo utilizado, sem taxas ocultas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-red-500 text-2xl">🏠</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Sem Sair de Casa</h3>
                    <p className="text-gray-400">
                      Resolva problemas técnicos sem precisar sair de casa.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-red-500 text-2xl">🎯</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Especialistas</h3>
                    <p className="text-gray-400">
                      Técnicos especializados em diversas áreas tecnológicas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-6 text-center">Pronto para começar?</h3>
              <div className="text-center space-y-4">
                <p className="text-gray-300">
                  Junte-se a milhares de usuários que já resolveram seus problemas técnicos conosco.
                </p>
                <Link 
                  to="/register" 
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                >
                  Começar Agora
                </Link>
                <p className="text-sm text-gray-400">
                  Cadastro gratuito • Sem compromisso
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComoFuncionaPage;
