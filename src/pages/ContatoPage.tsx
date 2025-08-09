import React, { useState } from 'react';

const ContatoPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envio do formulário
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canaisContato = [
    {
      icone: '📧',
      titulo: 'E-mail',
      descricao: 'Envie sua dúvida por e-mail',
      contato: 'contato@supravelconnect.com',
      tempo: 'Resposta em até 24h'
    },
    {
      icone: '📱',
      titulo: 'WhatsApp',
      descricao: 'Fale conosco pelo WhatsApp',
      contato: '+55 (11) 99999-9999',
      tempo: 'Resposta imediata'
    },
    {
      icone: '📞',
      titulo: 'Telefone',
      descricao: 'Ligue para nosso suporte',
      contato: '0800 123 4567',
      tempo: 'Seg-Sex: 8h às 18h'
    },
    {
      icone: '💬',
      titulo: 'Chat Online',
      descricao: 'Chat ao vivo no site',
      contato: 'Disponível no canto inferior',
      tempo: 'Seg-Sex: 8h às 22h'
    }
  ];

  const escritorios = [
    {
      cidade: 'São Paulo - SP',
      endereco: 'Av. Paulista, 1000 - Bela Vista',
      cep: '01310-100',
      telefone: '(11) 3000-0000'
    },
    {
      cidade: 'Rio de Janeiro - RJ',
      endereco: 'Av. Copacabana, 500 - Copacabana',
      cep: '22070-001',
      telefone: '(21) 3000-0000'
    },
    {
      cidade: 'Belo Horizonte - MG',
      endereco: 'Av. Afonso Pena, 800 - Centro',
      cep: '30130-001',
      telefone: '(31) 3000-0000'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Contato</h1>
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo 
            ou envie sua mensagem pelo formulário.
          </p>
        </div>
      </section>

      {/* Canais de Contato */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Canais de <span className="text-red-500">Atendimento</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {canaisContato.map((canal, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg text-center hover:bg-gray-700 transition-colors">
                <div className="text-4xl mb-4">{canal.icone}</div>
                <h3 className="text-xl font-bold mb-2">{canal.titulo}</h3>
                <p className="text-gray-400 mb-3 text-sm">{canal.descricao}</p>
                <p className="text-red-400 font-semibold mb-2">{canal.contato}</p>
                <p className="text-gray-500 text-sm">{canal.tempo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário e Informações */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulário */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Envie sua Mensagem</h2>
              
              {submitStatus === 'success' && (
                <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
                  Mensagem enviada com sucesso! Entraremos em contato em breve.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
                  Erro ao enviar mensagem. Tente novamente ou use outro canal de contato.
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="telefone" className="block text-sm font-medium mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="assunto" className="block text-sm font-medium mb-2">
                      Assunto *
                    </label>
                    <select
                      id="assunto"
                      name="assunto"
                      value={formData.assunto}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500"
                    >
                      <option value="">Selecione um assunto</option>
                      <option value="suporte">Suporte Técnico</option>
                      <option value="vendas">Vendas e Planos</option>
                      <option value="parceria">Parceria/Técnico</option>
                      <option value="feedback">Feedback</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="mensagem" className="block text-sm font-medium mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                    placeholder="Descreva sua dúvida ou mensagem..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
              </form>
            </div>
            
            {/* Informações Adicionais */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Informações Adicionais</h2>
              
              {/* Horários */}
              <div className="bg-gray-700 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-bold mb-4 text-red-400">Horários de Atendimento</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Segunda a Sexta:</span>
                    <span>8h às 22h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábado:</span>
                    <span>9h às 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingo:</span>
                    <span>10h às 16h</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <p className="text-green-400 font-semibold">
                      🟢 Suporte técnico 24/7 para clientes Premium
                    </p>
                  </div>
                </div>
              </div>
              
              {/* FAQ Rápido */}
              <div className="bg-gray-700 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-bold mb-4 text-red-400">Perguntas Frequentes</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold mb-1">Como funciona o suporte?</p>
                    <p className="text-gray-300">Conectamos você com técnicos especializados via videochamada para resolver problemas em tempo real.</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Quanto custa?</p>
                    <p className="text-gray-300">Temos um plano gratuito e um Premium por R$ 29,90/mês com recursos completos.</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">É seguro?</p>
                    <p className="text-gray-300">Sim, todos os técnicos são verificados e as conexões são criptografadas.</p>
                  </div>
                </div>
              </div>
              
              {/* Redes Sociais */}
              <div className="bg-gray-700 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-red-400">Siga-nos</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-2xl hover:text-red-400 transition-colors">📘</a>
                  <a href="#" className="text-2xl hover:text-red-400 transition-colors">📷</a>
                  <a href="#" className="text-2xl hover:text-red-400 transition-colors">🐦</a>
                  <a href="#" className="text-2xl hover:text-red-400 transition-colors">💼</a>
                  <a href="#" className="text-2xl hover:text-red-400 transition-colors">📺</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Escritórios */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Nossos <span className="text-red-500">Escritórios</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {escritorios.map((escritorio, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-4 text-red-400">{escritorio.cidade}</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>{escritorio.endereco}</p>
                  <p>CEP: {escritorio.cep}</p>
                  <p className="font-semibold">{escritorio.telefone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Precisa de ajuda agora?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Não espere! Conecte-se agora com um técnico especializado e resolva seu problema em minutos.
          </p>
          <div className="space-x-4">
            <a 
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-colors"
            >
              WhatsApp Agora
            </a>
            <a 
              href="tel:08001234567"
              className="inline-block border border-white text-white font-bold py-4 px-8 rounded-lg hover:bg-white hover:text-red-600 transition-colors"
            >
              Ligar Agora
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContatoPage;