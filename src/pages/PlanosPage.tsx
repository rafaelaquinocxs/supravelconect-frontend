import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PlanosPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const planos = [
    {
      id: 'gratuito',
      nome: 'Gratuito',
      preco: 0,
      precoAnual: 0,
      popular: false,
      descricao: 'Ideal para uso ocasional',
      recursos: [
        '2 sessões por mês',
        'Suporte básico por chat',
        'Acesso a técnicos verificados',
        'Histórico de sessões',
        'Avaliação de técnicos'
      ],
      limitacoes: [
        'Sem videochamadas',
        'Sem compartilhamento de tela',
        'Suporte limitado'
      ],
      cor: 'border-gray-600',
      botao: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      id: 'premium',
      nome: 'Premium',
      preco: 29.90,
      precoAnual: 299.00, // 10 meses pelo preço de 12
      popular: true,
      descricao: 'Para quem precisa de suporte completo',
      recursos: [
        'Sessões ilimitadas',
        'Videochamadas HD',
        'Compartilhamento de tela',
        'Chat em tempo real',
        'Suporte prioritário 24/7',
        'Técnicos especializados',
        'Histórico completo',
        'Relatórios detalhados',
        'Sem taxa por sessão',
        'Cancelamento a qualquer momento'
      ],
      limitacoes: [],
      cor: 'border-red-500',
      botao: 'bg-red-600 hover:bg-red-700'
    }
  ];

  const faq = [
    {
      pergunta: 'Posso cancelar a qualquer momento?',
      resposta: 'Sim, você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento.'
    },
    {
      pergunta: 'O que acontece se eu exceder o limite do plano gratuito?',
      resposta: 'Você será notificado quando atingir o limite e poderá fazer upgrade para o plano Premium.'
    },
    {
      pergunta: 'Os técnicos são verificados?',
      resposta: 'Sim, todos os técnicos passam por um rigoroso processo de verificação e avaliação contínua.'
    },
    {
      pergunta: 'Posso mudar de plano depois?',
      resposta: 'Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.'
    },
    {
      pergunta: 'Há garantia de resolução do problema?',
      resposta: 'Oferecemos garantia de satisfação. Se não resolvermos seu problema, você não paga.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Planos e Preços</h1>
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Escolha o plano ideal para suas necessidades. Comece grátis ou tenha acesso completo 
            com nosso plano Premium.
          </p>
        </div>
      </section>

      {/* Toggle de Billing */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-12">
            <div className="bg-gray-800 p-1 rounded-lg flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  billingCycle === 'monthly' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  billingCycle === 'yearly' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Anual
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  2 meses grátis
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cards de Planos */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {planos.map((plano) => (
              <div 
                key={plano.id}
                className={`bg-gray-800 rounded-lg p-8 border-2 ${plano.cor} relative ${
                  plano.popular ? 'transform scale-105' : ''
                }`}
              >
                {plano.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
                  <p className="text-gray-400 mb-4">{plano.descricao}</p>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold">
                      R$ {billingCycle === 'monthly' ? plano.preco.toFixed(2) : plano.precoAnual.toFixed(2)}
                    </span>
                    <span className="text-gray-400 ml-2">
                      /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                    </span>
                  </div>
                  
                  {billingCycle === 'yearly' && plano.id === 'premium' && (
                    <p className="text-green-400 text-sm">
                      Economize R$ 59,80 por ano
                    </p>
                  )}
                </div>

                <div className="mb-8">
                  <h4 className="font-bold mb-4 text-green-400">✓ Incluído:</h4>
                  <ul className="space-y-2">
                    {plano.recursos.map((recurso, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="text-green-400 mr-3">✓</span>
                        {recurso}
                      </li>
                    ))}
                  </ul>
                </div>

                {plano.limitacoes.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-bold mb-4 text-red-400">✗ Limitações:</h4>
                    <ul className="space-y-2">
                      {plano.limitacoes.map((limitacao, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-400">
                          <span className="text-red-400 mr-3">✗</span>
                          {limitacao}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link
                  to="/register"
                  className={`block w-full text-center py-3 rounded-lg font-bold transition-colors ${plano.botao}`}
                >
                  {plano.id === 'gratuito' ? 'Começar Grátis' : 'Assinar Premium'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparação Detalhada */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Comparação <span className="text-red-500">Detalhada</span>
          </h2>
          
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full bg-gray-700 rounded-lg">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-4">Recursos</th>
                  <th className="text-center p-4">Gratuito</th>
                  <th className="text-center p-4">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-600">
                  <td className="p-4">Sessões por mês</td>
                  <td className="text-center p-4">2</td>
                  <td className="text-center p-4 text-green-400">Ilimitadas</td>
                </tr>
                <tr className="border-b border-gray-600">
                  <td className="p-4">Videochamadas HD</td>
                  <td className="text-center p-4 text-red-400">✗</td>
                  <td className="text-center p-4 text-green-400">✓</td>
                </tr>
                <tr className="border-b border-gray-600">
                  <td className="p-4">Compartilhamento de tela</td>
                  <td className="text-center p-4 text-red-400">✗</td>
                  <td className="text-center p-4 text-green-400">✓</td>
                </tr>
                <tr className="border-b border-gray-600">
                  <td className="p-4">Chat em tempo real</td>
                  <td className="text-center p-4 text-red-400">✗</td>
                  <td className="text-center p-4 text-green-400">✓</td>
                </tr>
                <tr className="border-b border-gray-600">
                  <td className="p-4">Suporte prioritário</td>
                  <td className="text-center p-4 text-red-400">✗</td>
                  <td className="text-center p-4 text-green-400">24/7</td>
                </tr>
                <tr className="border-b border-gray-600">
                  <td className="p-4">Técnicos especializados</td>
                  <td className="text-center p-4">Básico</td>
                  <td className="text-center p-4 text-green-400">Premium</td>
                </tr>
                <tr>
                  <td className="p-4">Relatórios detalhados</td>
                  <td className="text-center p-4 text-red-400">✗</td>
                  <td className="text-center p-4 text-green-400">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Perguntas <span className="text-red-500">Frequentes</span>
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faq.map((item, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 text-red-400">
                  {item.pergunta}
                </h3>
                <p className="text-gray-300">
                  {item.resposta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Comece hoje mesmo!
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de usuários que já resolveram seus problemas técnicos conosco. 
            Comece grátis e faça upgrade quando precisar.
          </p>
          <div className="space-x-4">
            <Link 
              to="/register"
              className="inline-block bg-white text-red-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Começar Grátis
            </Link>
            <Link 
              to="/contato"
              className="inline-block border border-white text-white font-bold py-4 px-8 rounded-lg hover:bg-white hover:text-red-600 transition-colors"
            >
              Falar com Vendas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlanosPage;