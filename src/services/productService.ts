import { supabase } from '@/lib/supabase'

export interface Product {
  id?: string
  name: string
  price: number
  quantity: number
  created_at?: string
}

export interface Transaction {
  id?: string
  customer_name: string
  total_amount: number
  items: TransactionItem[]
  created_at?: string
}

export interface TransactionItem {
  product_id: string
  quantity: number
  price: number
}

// Financial reporting interfaces
export interface FinancialReportData {
  period: string;
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  taxPaid: number;
  drawings: number;
}

export interface BalanceSheetData {
  assets: {
    nonCurrent: number;
    current: number;
    total: number;
  };
  equityLiabilities: {
    ownersCapital: number;
    retainedEarnings: number;
    currentLiabilities: number;
    total: number;
  };
}

export interface CashFlowData {
  operations: number;
  investing: number;
  financing: number;
  closingCash: number;
}

export const productService = {
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  async addProduct(product: Omit<Product, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  async deleteProduct(id: string) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }
}

export const transactionService = {
  async getTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  },

  async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
    try {
      // Insert the main transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          customer_name: transaction.customer_name,
          total_amount: transaction.total_amount
        }])
        .select()

      if (transactionError) throw transactionError

      const transactionId = transactionData[0].id

      // Insert transaction items
      const itemsWithTransactionId = transaction.items.map(item => ({
        transaction_id: transactionId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(itemsWithTransactionId)

      if (itemsError) throw itemsError

      return transactionData[0]
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }
}

export const financialService = {
  async getFinancialReport(timeRange: 'day' | 'week' | 'month' | 'year'): Promise<FinancialReportData[]> {
    try {
      // Calculate date range based on timeRange
      const endDate = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case 'day':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      // Fetch transactions within the date range
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items(*)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');
      
      if (error) throw error;
      
      // Process transactions to generate financial data
      const financialData: FinancialReportData[] = [];
      
      // Group transactions by period (day, week, month, year)
      const groupedTransactions: Record<string, any[]> = {};
      
      transactions.forEach(transaction => {
        const date = new Date(transaction.created_at);
        let periodKey: string;
        
        switch (timeRange) {
          case 'day':
            periodKey = date.toISOString().split('T')[0];
            break;
          case 'week':
            // Get week number
            const weekNumber = Math.ceil(date.getDate() / 7);
            periodKey = `${date.getFullYear()}-W${weekNumber}`;
            break;
          case 'month':
            periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            break;
          case 'year':
            periodKey = date.getFullYear().toString();
            break;
          default:
            periodKey = date.toISOString().split('T')[0];
        }
        
        if (!groupedTransactions[periodKey]) {
          groupedTransactions[periodKey] = [];
        }
        groupedTransactions[periodKey].push(transaction);
      });
      
      // Calculate financial metrics for each period
      Object.entries(groupedTransactions).forEach(([period, periodTransactions]) => {
        let revenue = 0;
        let costOfSales = 0;
        let grossProfit = 0;
        let operatingExpenses = 0;
        let netProfit = 0;
        let taxPaid = 0;
        let drawings = 0;
        
        periodTransactions.forEach(transaction => {
          // Revenue is the total amount of the transaction
          revenue += transaction.total_amount;
          
          // Calculate cost of sales from transaction items
          if (transaction.transaction_items) {
            transaction.transaction_items.forEach((item: any) => {
              costOfSales += item.quantity * item.price;
            });
          }
        });
        
        // Calculate gross profit
        grossProfit = revenue - costOfSales;
        
        // For a real implementation, you would fetch actual operating expenses, taxes, and drawings
        // from the database. For now, we'll use placeholder calculations.
        operatingExpenses = grossProfit * 0.1; // 10% operating expenses
        taxPaid = grossProfit * 0.05; // 5% tax
        drawings = grossProfit * 0.2; // 20% drawings
        netProfit = grossProfit - operatingExpenses - taxPaid - drawings;
        
        financialData.push({
          period,
          revenue,
          costOfSales,
          grossProfit,
          operatingExpenses,
          netProfit,
          taxPaid,
          drawings
        });
      });
      
      return financialData;
    } catch (error) {
      console.error('Error fetching financial report:', error);
      throw error;
    }
  },
  
  async getBalanceSheet(): Promise<BalanceSheetData> {
    try {
      // Fetch current assets (cash from recent transactions)
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('total_amount');
      
      if (transactionsError) throw transactionsError;
      
      // Calculate current assets (simplified as cash balance)
      const currentAssets = transactions.reduce((sum, transaction) => sum + transaction.total_amount, 0);
      
      // For a real implementation, you would fetch actual asset values from the database
      const nonCurrentAssets = 1759375; // From the example data
      const ownersCapital = 19875000; // From the example data
      const currentLiabilities = 3250000; // From the example data
      const retainedEarnings = -2215225; // From the example data
      
      return {
        assets: {
          nonCurrent: nonCurrentAssets,
          current: currentAssets,
          total: nonCurrentAssets + currentAssets
        },
        equityLiabilities: {
          ownersCapital,
          retainedEarnings,
          currentLiabilities,
          total: ownersCapital + retainedEarnings + currentLiabilities
        }
      };
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      throw error;
    }
  },
  
  async getCashFlow(): Promise<CashFlowData> {
    try {
      // Fetch recent transactions to calculate cash flow
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('total_amount');
      
      if (error) throw error;
      
      // Calculate cash flow from operations (simplified)
      const operations = transactions.reduce((sum, transaction) => sum + transaction.total_amount, 0);
      
      // For a real implementation, you would fetch actual investing and financing activities
      const investing = 0;
      const financing = 0;
      const closingCash = operations + investing + financing;
      
      return {
        operations,
        investing,
        financing,
        closingCash
      };
    } catch (error) {
      console.error('Error fetching cash flow:', error);
      throw error;
    }
  }
}
