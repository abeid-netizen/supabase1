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