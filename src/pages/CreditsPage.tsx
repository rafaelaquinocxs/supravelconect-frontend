import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  isPopular?: boolean;
  description: string;
  features: string[];
}

interface Transaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund';
  amount: number;
  credits: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface UserCredits {
  balance: number;
  totalPurchased: number;
  totalUsed: number;
  expirationDate?: string;
}

const CreditsPage: React.FC = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [userCredits, setUserCredits] = useState<UserCredits>({
    balance: 0,
    totalPurchased: 0,
    totalUsed: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesResponse, creditsResponse, transactionsResponse] = await Promise.all([
        api.get('/api/credits/packages'),
        api.get('/api/credits/balance'),
        api.get('/api/credits/transactions')
      ]);
      
      setPackages(packagesResponse.data.data);
      setUserCredits(creditsResponse.data.data);
      setTransactions(transactionsResponse.data.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      
      // Dados mockados para demonstração
      setPackages([
        {
          id: '1',
          name: 'Básico',
          credits: 10,
          price: 89.90,
          description: 'Ideal para uso ocasional',
          features: ['10 créditos', 'Suporte básico', 'Validade de 6 meses']
        },
        {
          id: '2',
          name: 'Popular',
          credits: 25,
          price: 199.90,
          originalPrice: 224.75,
          discount: 10,
          isPopular: true,
          description: 'Melhor custo-benefício',
          features: ['25 créditos', 'Suporte prioritário', 'Validade de 8 meses', '10% de desconto']
        },
        {
          id: '3',
          name: 'Premium',
          credits: 50,
          price: 349.90,
          originalPrice: 449.50,
          discount: 20,
          description: 'Para uso intensivo',
          features: ['50 créditos', 'Suporte VIP', 'Validade de 12 meses', '20% de desconto']
        },
        {
          id: '4',
          name: 'Empresarial',
          credits: 100,
          price: 599.90,
          originalPrice: 899.00,
          discount: 30,
          description: 'Para empresas',
          features: ['100 créditos', 'Suporte dedicado', 'Validade de 18 meses', '30% de desconto', 'Relatórios avançados']
        }
      ]);
      
      setUserCredits({
        balance: 150,
        totalPurchased: 200,
        totalUsed: 50,
        expirationDate: '2025-06-15'
      });
      
      setTransactions([
        {
          id: '1',
          type: 'purchase',
          amount: 199.90,
          credits: 25,
          description: 'Compra de pacote Popular',
          date: '2025-01-05T10:30:00Z',
          status: 'completed'
        },
        {
          id: '2',
          type: 'usage',
          amount: 0,
          credits: -1,
          description: 'Sessão com João Silva - Elétrica',
          date: '2025-01-07T14:15:00Z',
          status: 'completed'
        },
        {
          id: '3',
          type: 'usage',
          amount: 0,
          credits: -2,
          description: 'Sessão com Maria Santos - Hidráulica',
          date: '2025-01-06T09:45:00Z',
          status: 'completed'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId);
    
    try {
      const response = await api.post('/api/credits/purchase', {
        packageId
      });
      
      // Simular redirecionamento para pagamento
      if (response.data.data.paymentUrl) {
        window.open(response.data.data.paymentUrl, '_blank');
        toast.info('Redirecionando para pagamento...');
      } else {
        // Simular compra bem-sucedida
        toast.success('Compra realizada com sucesso!');
        fetchData(); // Recarregar dados
      }
    } catch (error: any) {
      console.error('Erro ao comprar créditos:', error);
      toast.error(error.response?.data?.message || 'Erro ao processar compra');
    } finally {
      setPurchasing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return (
          <div className="bg-green-500 p-2 rounded-full">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'usage':
        return (
          <div className="bg-blue-500 p-2 rounded-full">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        );
      case 'refund':
        return (
          <div className="bg-yellow-500 p-2 rounded-full">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Créditos</h1>
        <p className="text-gray-400">
          Compre créditos para usar nas sessões com especialistas
        </p>
      </div>

      {/* Saldo Atual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Saldo Atual</p>
              <p className="text-2xl font-bold text-white">{userCredits.balance}</p>
              <p className="text-gray-500 text-xs">créditos</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Comprado</p>
              <p className="text-2xl font-bold text-white">{userCredits.totalPurchased}</p>
              <p className="text-gray-500 text-xs">créditos</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Usado</p>
              <p className="text-2xl font-bold text-white">{userCredits.totalUsed}</p>
              <p className="text-gray-500 text-xs">créditos</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Validade</p>
              <p className="text-lg font-bold text-white">
                {userCredits.expirationDate ? formatDate(userCredits.expirationDate) : 'N/A'}
              </p>
              <p className="text-gray-500 text-xs">próxima expiração</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pacotes de Créditos */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Pacotes de Créditos</h2>
          <div className="text-sm text-gray-400">
            1 crédito = R$ 10,00 em sessões
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-gray-800 rounded-lg p-6 border-2 transition-all hover:scale-105 ${
                pkg.isPopular 
                  ? 'border-primary-500 relative' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>
                
                <div className="mb-4">
                  <div className="text-3xl font-bold text-white">
                    R$ {pkg.price.toFixed(2)}
                  </div>
                  {pkg.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      R$ {pkg.originalPrice.toFixed(2)}
                    </div>
                  )}
                  {pkg.discount && (
                    <div className="text-green-400 text-sm font-medium">
                      {pkg.discount}% de desconto
                    </div>
                  )}
                </div>

                <div className="bg-primary-500/20 rounded-lg p-3 mb-4">
                  <div className="text-2xl font-bold text-primary-400">{pkg.credits}</div>
                  <div className="text-primary-300 text-sm">créditos</div>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={purchasing === pkg.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  pkg.isPopular
                    ? 'bg-primary-500 hover:bg-primary-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                } ${purchasing === pkg.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {purchasing === pkg.id ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </span>
                ) : (
                  'Comprar Agora'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de Transações */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Histórico de Transações</h2>
            <button
              onClick={() => setShowTransactions(!showTransactions)}
              className="text-primary-400 hover:text-primary-300 text-sm"
            >
              {showTransactions ? 'Ocultar' : 'Ver histórico'}
            </button>
          </div>
        </div>

        {showTransactions && (
          <div className="p-6">
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <h3 className="text-white font-medium">{transaction.description}</h3>
                        <p className="text-gray-400 text-sm">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {transaction.credits > 0 ? '+' : ''}{transaction.credits} créditos
                      </div>
                      {transaction.amount > 0 && (
                        <div className="text-gray-400 text-sm">
                          R$ {transaction.amount.toFixed(2)}
                        </div>
                      )}
                      <div className={`text-xs ${getStatusColor(transaction.status)}`}>
                        {transaction.status === 'completed' ? 'Concluído' : 
                         transaction.status === 'pending' ? 'Pendente' : 'Falhou'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">Nenhuma transação encontrada</div>
                <p className="text-gray-500 text-sm">Suas transações aparecerão aqui</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Informações Adicionais */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Como Funcionam os Créditos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-2">💳 Sistema de Pagamento</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• 1 crédito = R$ 10,00 em sessões</li>
              <li>• Pagamento seguro via PIX, cartão ou boleto</li>
              <li>• Créditos são creditados instantaneamente</li>
              <li>• Sem taxa de manutenção ou mensalidade</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">⏰ Validade e Uso</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Créditos têm validade de 6 a 18 meses</li>
              <li>• Use quando precisar, sem pressa</li>
              <li>• Débito automático ao iniciar sessão</li>
              <li>• Reembolso em caso de problema técnico</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;