import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  credits: number;
  features: string[];
  billingCycle: 'monthly' | 'yearly';
}

interface LocationState {
  plan: Plan;
  userType: 'client' | 'technician';
  userData: any;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [selectedMethod, setSelectedMethod] = useState<string>('credit_card');
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    cpf: '',
    installments: 1
  });
  
  const state = location.state as LocationState;
  const plan = state?.plan;
  const userType = state?.userType;
  const userData = state?.userData;

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      icon: '💳',
      description: 'Visa, Mastercard, Elo'
    },
    {
      id: 'pix',
      name: 'PIX',
      icon: '🔄',
      description: 'Pagamento instantâneo'
    },
    {
      id: 'boleto',
      name: 'Boleto Bancário',
      icon: '📄',
      description: 'Vencimento em 3 dias úteis'
    }
  ];

  useEffect(() => {
    if (!plan || !userData) {
      navigate('/auth/register');
      return;
    }
  }, [plan, userData, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Formatação específica para alguns campos
    let formattedValue = value;
    
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    } else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'cpf') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    setPaymentData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Preparar dados do pagamento
      const paymentPayload = {
        planId: plan.id,
        amount: plan.price,
        paymentMethod: selectedMethod,
        customer: {
          name: userData.name,
          email: userData.email,
          cpfCnpj: paymentData.cpf.replace(/\D/g, ''),
          phone: userData.phone
        },
        ...(selectedMethod === 'credit_card' && {
          creditCard: {
            holderName: paymentData.cardName,
            number: paymentData.cardNumber.replace(/\s/g, ''),
            expiryMonth: paymentData.expiryDate.split('/')[0],
            expiryYear: `20${paymentData.expiryDate.split('/')[1]}`,
            ccv: paymentData.cvv
          },
          installmentCount: paymentData.installments
        })
      };

      // Chamar API de pagamento (integração com Asaas)
      const response = await api.post('/api/payments/process', paymentPayload);
      
      if (response.data.success) {
        // Pagamento aprovado
        if (selectedMethod === 'credit_card') {
          // Redirecionar direto para dashboard
          navigate(userType === 'technician' ? '/app/technician/dashboard' : '/app/dashboard');
        } else {
          // Para PIX ou Boleto, mostrar instruções
          navigate('/payment/success', {
            state: {
              paymentData: response.data.data,
              plan,
              userType
            }
          });
        }
      } else {
        throw new Error(response.data.message || 'Erro no pagamento');
      }
      
    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      alert(error.response?.data?.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const getInstallmentOptions = () => {
    const maxInstallments = Math.min(12, Math.floor(plan.price / 10));
    const options = [];
    
    for (let i = 1; i <= maxInstallments; i++) {
      const installmentValue = plan.price / i;
      options.push({
        value: i,
        label: `${i}x de R$ ${installmentValue.toFixed(2)} ${i === 1 ? 'à vista' : 'sem juros'}`
      });
    }
    
    return options;
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-dark-400 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Plano não encontrado</h2>
          <button onClick={() => navigate('/plans')} className="btn btn-primary">
            Selecionar Plano
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-400">
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Finalizar Pagamento</h1>
            <p className="text-gray-300">Complete sua assinatura e comece a usar agora</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Dados do Pagamento</h2>
              
              {/* Payment Methods */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedMethod === method.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{method.icon}</span>
                        <div>
                          <h3 className="font-medium text-white">{method.name}</h3>
                          <p className="text-sm text-gray-400">{method.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Credit Card Form */}
              {selectedMethod === 'credit_card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome no Cartão
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={paymentData.cardName}
                      onChange={handleInputChange}
                      placeholder="Nome como está no cartão"
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Validade
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentData.cvv}
                        onChange={handleInputChange}
                        placeholder="000"
                        maxLength={4}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CPF
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={paymentData.cpf}
                      onChange={handleInputChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Parcelamento
                    </label>
                    <select
                      name="installments"
                      value={paymentData.installments}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      {getInstallmentOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* PIX Instructions */}
              {selectedMethod === 'pix' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="font-medium text-blue-400 mb-2">Pagamento via PIX</h3>
                  <p className="text-sm text-gray-300">
                    Após confirmar, você receberá um QR Code para pagamento instantâneo.
                    O acesso será liberado automaticamente após a confirmação.
                  </p>
                </div>
              )}

              {/* Boleto Instructions */}
              {selectedMethod === 'boleto' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-400 mb-2">Pagamento via Boleto</h3>
                  <p className="text-sm text-gray-300">
                    O boleto será gerado e enviado por email. O prazo de vencimento é de 3 dias úteis.
                    O acesso será liberado após a confirmação do pagamento.
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Resumo do Pedido</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-600 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{plan.description}</p>
                  
                  <ul className="space-y-1 mb-4">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-sm text-gray-400">
                        +{plan.features.length - 3} recursos adicionais
                      </li>
                    )}
                  </ul>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-600">
                    <span className="text-gray-300">Valor mensal:</span>
                    <span className="text-2xl font-bold text-primary-500">
                      R$ {plan.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border border-gray-600 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">Dados do Cliente</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nome:</span>
                      <span className="text-white">{userData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{userData?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tipo:</span>
                      <span className="text-white">
                        {userType === 'technician' ? 'Técnico' : 'Cliente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="font-medium text-green-400">Pagamento Seguro</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Seus dados são protegidos com criptografia SSL e processados pelo Asaas.
                  </p>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={processing || (selectedMethod === 'credit_card' && (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cpf))}
                className="w-full btn btn-primary btn-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : (
                  `Pagar R$ ${plan.price.toFixed(2)}`
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Ao confirmar o pagamento, você concorda com nossos{' '}
                <a href="/terms" className="text-primary-400 hover:text-primary-300">
                  Termos de Uso
                </a>{' '}
                e{' '}
                <a href="/privacy" className="text-primary-400 hover:text-primary-300">
                  Política de Privacidade
                </a>
              </p>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/plans')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Voltar aos planos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

