import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Wallet {
  id: string;
  balance: number;
  currency: string;
  stats: {
    sent: number;
    received: number;
  };
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description?: string;
  createdAt: string;
  senderUserId?: string;
  receiverUserId?: string;
}

const Payments: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'send' | 'receive' | 'history'>('send');
  
  // Send money form
  const [sendForm, setSendForm] = useState({
    receiverPhone: '',
    amount: '',
    description: ''
  });
  const [sending, setSending] = useState(false);
  
  // Receive money form
  const [receiveForm, setReceiveForm] = useState({
    amount: '',
    description: ''
  });
  const [depositing, setDepositing] = useState(false);
  
  // Withdraw form
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    description: ''
  });
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchWallet = async () => {
    try {
      const response = await apiService.getWallet();
      if (response.success) {
        setWallet(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await apiService.getTransactions({ page: 1, limit: 20 });
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchWallet(), fetchTransactions()]);
      } catch (err) {
        setError('Failed to load payment data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendForm.receiverPhone || !sendForm.amount) return;

    setSending(true);
    try {
      const response = await apiService.transfer(
        sendForm.receiverPhone,
        parseFloat(sendForm.amount),
        sendForm.description || 'Payment'
      );
      
      if (response.success) {
        setSendForm({ receiverPhone: '', amount: '', description: '' });
        await Promise.all([fetchWallet(), fetchTransactions()]);
        alert('Money sent successfully!');
      } else {
        alert(response.error || 'Failed to send money');
      }
    } catch (err: any) {
      const message = err?.message || 'Failed to send money';
      alert(message);
    } finally {
      setSending(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveForm.amount) return;

    setDepositing(true);
    try {
      const response = await apiService.deposit(
        parseFloat(receiveForm.amount),
        receiveForm.description || 'Deposit'
      );
      
      if (response.success) {
        setReceiveForm({ amount: '', description: '' });
        await Promise.all([fetchWallet(), fetchTransactions()]);
        alert('Deposit successful!');
      } else {
        alert(response.error || 'Failed to deposit');
      }
    } catch (err) {
      alert('Failed to deposit');
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawForm.amount) return;

    setWithdrawing(true);
    try {
      const response = await apiService.withdraw(
        parseFloat(withdrawForm.amount),
        withdrawForm.description || 'Withdrawal'
      );
      
      if (response.success) {
        setWithdrawForm({ amount: '', description: '' });
        await Promise.all([fetchWallet(), fetchTransactions()]);
        alert('Withdrawal successful!');
      } else {
        alert(response.error || 'Failed to withdraw');
      }
    } catch (err) {
      alert('Failed to withdraw');
    } finally {
      setWithdrawing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'TRANSFER': return '↔️';
      case 'DEPOSIT': return '⬇️';
      case 'WITHDRAWAL': return '⬆️';
      default: return '💰';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'TRANSFER': return 'text-blue-600';
      case 'DEPOSIT': return 'text-green-600';
      case 'WITHDRAWAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💳 Payments</h1>
          <p className="text-gray-600">Send, receive, and manage your money</p>
        </div>

        {/* Wallet Balance Card */}
        {wallet && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium mb-2">Wallet Balance</h2>
                <p className="text-4xl font-bold">{formatAmount(wallet.balance)}</p>
                <p className="text-blue-100 mt-2">
                  {wallet.stats.sent} sent • {wallet.stats.received} received
                </p>
              </div>
              <div className="text-6xl opacity-20">💳</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'send', label: 'Send Money', icon: '📤' },
                { id: 'receive', label: 'Receive Money', icon: '📥' },
                { id: 'history', label: 'Transaction History', icon: '📋' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Send Money Tab */}
            {activeTab === 'send' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Send Money</h3>
                <form onSubmit={handleSendMoney} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Receiver Phone Number
                    </label>
                    <input
                      type="tel"
                      value={sendForm.receiverPhone}
                      onChange={(e) => setSendForm({ ...sendForm, receiverPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter receiver's phone number"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={sendForm.amount}
                        onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={sendForm.description}
                      onChange={(e) => setSendForm({ ...sendForm, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What's this for?"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={sending || !sendForm.receiverPhone || !sendForm.amount}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sending...' : 'Send Money'}
                  </button>
                </form>
              </div>
            )}

            {/* Receive Money Tab */}
            {activeTab === 'receive' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Receive Money</h3>
                
                {/* Deposit Form */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">💳 Deposit to Wallet</h4>
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={receiveForm.amount}
                          onChange={(e) => setReceiveForm({ ...receiveForm, amount: e.target.value })}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={receiveForm.description}
                        onChange={(e) => setReceiveForm({ ...receiveForm, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Deposit description"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={depositing || !receiveForm.amount}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {depositing ? 'Depositing...' : 'Deposit Money'}
                    </button>
                  </form>
                </div>

                {/* Withdraw Form */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">💸 Withdraw from Wallet</h4>
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={withdrawForm.amount}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={withdrawForm.description}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Withdrawal description"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={withdrawing || !withdrawForm.amount}
                      className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {withdrawing ? 'Withdrawing...' : 'Withdraw Money'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Transaction History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Transaction History</h3>
                
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h4>
                    <p className="text-gray-600">Your transaction history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">
                            {getTransactionTypeIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.description || `${transaction.type} Transaction`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                            {transaction.type === 'WITHDRAWAL' ? '-' : '+'}
                            {formatAmount(transaction.amount)}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">
                            {transaction.status.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
