/**
 * Report Generator Utility for Financial Reports
 * This module provides functions to generate financial reports in various formats
 */

import { formatCurrency } from "@/lib/currency";

// Types for our financial data
interface FinancialData {
  period: string;
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  taxPaid: number;
  drawings: number;
}

interface BalanceSheetData {
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

interface CashFlowData {
  operations: number;
  investing: number;
  financing: number;
  closingCash: number;
}

/**
 * Generate a simple text-based financial report
 * @param financialData - The financial data to include in the report
 * @param balanceSheetData - The balance sheet data
 * @param cashFlowData - The cash flow data
 * @returns A formatted text report
 */
export const generateTextReport = (
  financialData: FinancialData[],
  balanceSheetData: BalanceSheetData,
  cashFlowData: CashFlowData
): string => {
  // Calculate totals
  const totals = financialData.reduce((acc, curr) => {
    acc.revenue += curr.revenue;
    acc.costOfSales += curr.costOfSales;
    acc.grossProfit += curr.grossProfit;
    acc.operatingExpenses += curr.operatingExpenses;
    acc.netProfit += curr.netProfit;
    acc.taxPaid += curr.taxPaid;
    acc.drawings += curr.drawings;
    return acc;
  }, {
    revenue: 0,
    costOfSales: 0,
    grossProfit: 0,
    operatingExpenses: 0,
    netProfit: 0,
    taxPaid: 0,
    drawings: 0
  });

  // Calculate financial ratios
  const grossProfitMargin = totals.revenue ? (totals.grossProfit / totals.revenue) * 100 : 0;
  const netProfitMargin = totals.revenue ? (totals.netProfit / totals.revenue) * 100 : 0;

  const report = `
FINANCIAL REPORT
================

INCOME STATEMENT
----------------
Revenue:                    ${formatCurrency(totals.revenue)}
Cost of Sales:             (${formatCurrency(totals.costOfSales)})
                           ------------------
Gross Profit:               ${formatCurrency(totals.grossProfit)} (${grossProfitMargin.toFixed(2)}% of revenue)
Operating Expenses:        (${formatCurrency(totals.operatingExpenses)})
                           ------------------
Net Profit:                 ${formatCurrency(totals.netProfit)} (${netProfitMargin.toFixed(2)}% of revenue)
Tax Paid:                  (${formatCurrency(totals.taxPaid)})
Drawings:                  (${formatCurrency(Math.abs(totals.drawings))})
                           ------------------
Retained Earnings:          ${formatCurrency(totals.netProfit - totals.taxPaid - Math.abs(totals.drawings))}

BALANCE SHEET
-------------
ASSETS
Non-Current Assets:         ${formatCurrency(balanceSheetData.assets.nonCurrent)}
Current Assets:             ${formatCurrency(balanceSheetData.assets.current)}
                           ------------------
Total Assets:               ${formatCurrency(balanceSheetData.assets.total)}

EQUITY AND LIABILITIES
Owner's Capital:            ${formatCurrency(balanceSheetData.equityLiabilities.ownersCapital)}
Retained Earnings:          ${formatCurrency(balanceSheetData.equityLiabilities.retainedEarnings)}
Current Liabilities:        ${formatCurrency(balanceSheetData.equityLiabilities.currentLiabilities)}
                           ------------------
Total Equity and Liabilities: ${formatCurrency(balanceSheetData.equityLiabilities.total)}

CASH FLOW
---------
Net Cash from Operations:   ${formatCurrency(cashFlowData.operations)}
Net Cash from Investing:    ${formatCurrency(cashFlowData.investing)}
Net Cash from Financing:    ${formatCurrency(cashFlowData.financing)}
                           ------------------
Closing Cash:               ${formatCurrency(cashFlowData.closingCash)}

FINANCIAL RATIOS
----------------
Gross Profit Margin:        ${grossProfitMargin.toFixed(2)}%
Net Profit Margin:          ${netProfitMargin.toFixed(2)}%
  `;

  return report;
};

/**
 * Generate an HTML report that can be printed or converted to PDF
 * @param financialData - The financial data to include in the report
 * @param balanceSheetData - The balance sheet data
 * @param cashFlowData - The cash flow data
 * @returns An HTML string for the report
 */
export const generateHTMLReport = (
  financialData: FinancialData[],
  balanceSheetData: BalanceSheetData,
  cashFlowData: CashFlowData
): string => {
  // Calculate totals
  const totals = financialData.reduce((acc, curr) => {
    acc.revenue += curr.revenue;
    acc.costOfSales += curr.costOfSales;
    acc.grossProfit += curr.grossProfit;
    acc.operatingExpenses += curr.operatingExpenses;
    acc.netProfit += curr.netProfit;
    acc.taxPaid += curr.taxPaid;
    acc.drawings += curr.drawings;
    return acc;
  }, {
    revenue: 0,
    costOfSales: 0,
    grossProfit: 0,
    operatingExpenses: 0,
    netProfit: 0,
    taxPaid: 0,
    drawings: 0
  });

  // Calculate financial ratios
  const grossProfitMargin = totals.revenue ? (totals.grossProfit / totals.revenue) * 100 : 0;
  const netProfitMargin = totals.revenue ? (totals.netProfit / totals.revenue) * 100 : 0;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Financial Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; }
      h1, h2 { color: #333; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .number { text-align: right; }
      .total { font-weight: bold; }
      .section { margin-bottom: 30px; }
      .ratio { margin-top: 20px; }
    </style>
  </head>
  <body>
    <h1>Financial Report</h1>
    
    <div class="section">
      <h2>Income Statement</h2>
      <table>
        <tr>
          <td>Revenue</td>
          <td class="number">${formatCurrency(totals.revenue)}</td>
        </tr>
        <tr>
          <td>Cost of Sales</td>
          <td class="number">(${formatCurrency(totals.costOfSales)})</td>
        </tr>
        <tr>
          <td class="total">Gross Profit</td>
          <td class="number total">${formatCurrency(totals.grossProfit)} (${grossProfitMargin.toFixed(2)}% of revenue)</td>
        </tr>
        <tr>
          <td>Operating Expenses</td>
          <td class="number">(${formatCurrency(totals.operatingExpenses)})</td>
        </tr>
        <tr>
          <td class="total">Net Profit</td>
          <td class="number total">${formatCurrency(totals.netProfit)} (${netProfitMargin.toFixed(2)}% of revenue)</td>
        </tr>
        <tr>
          <td>Tax Paid</td>
          <td class="number">(${formatCurrency(totals.taxPaid)})</td>
        </tr>
        <tr>
          <td>Drawings</td>
          <td class="number">(${formatCurrency(Math.abs(totals.drawings))})</td>
        </tr>
        <tr>
          <td class="total">Retained Earnings</td>
          <td class="number total">${formatCurrency(totals.netProfit - totals.taxPaid - Math.abs(totals.drawings))}</td>
        </tr>
      </table>
    </div>
    
    <div class="section">
      <h2>Balance Sheet</h2>
      <table>
        <tr>
          <th colspan="2">ASSETS</th>
        </tr>
        <tr>
          <td>Non-Current Assets</td>
          <td class="number">${formatCurrency(balanceSheetData.assets.nonCurrent)}</td>
        </tr>
        <tr>
          <td>Current Assets</td>
          <td class="number">${formatCurrency(balanceSheetData.assets.current)}</td>
        </tr>
        <tr>
          <td class="total">Total Assets</td>
          <td class="number total">${formatCurrency(balanceSheetData.assets.total)}</td>
        </tr>
        <tr>
          <th colspan="2">EQUITY AND LIABILITIES</th>
        </tr>
        <tr>
          <td>Owner's Capital</td>
          <td class="number">${formatCurrency(balanceSheetData.equityLiabilities.ownersCapital)}</td>
        </tr>
        <tr>
          <td>Retained Earnings</td>
          <td class="number">${formatCurrency(balanceSheetData.equityLiabilities.retainedEarnings)}</td>
        </tr>
        <tr>
          <td>Current Liabilities</td>
          <td class="number">${formatCurrency(balanceSheetData.equityLiabilities.currentLiabilities)}</td>
        </tr>
        <tr>
          <td class="total">Total Equity and Liabilities</td>
          <td class="number total">${formatCurrency(balanceSheetData.equityLiabilities.total)}</td>
        </tr>
      </table>
    </div>
    
    <div class="section">
      <h2>Cash Flow</h2>
      <table>
        <tr>
          <td>Net Cash from Operations</td>
          <td class="number">${formatCurrency(cashFlowData.operations)}</td>
        </tr>
        <tr>
          <td>Net Cash from Investing</td>
          <td class="number">${formatCurrency(cashFlowData.investing)}</td>
        </tr>
        <tr>
          <td>Net Cash from Financing</td>
          <td class="number">${formatCurrency(cashFlowData.financing)}</td>
        </tr>
        <tr>
          <td class="total">Closing Cash</td>
          <td class="number total">${formatCurrency(cashFlowData.closingCash)}</td>
        </tr>
      </table>
    </div>
    
    <div class="ratio">
      <h2>Financial Ratios</h2>
      <p>Gross Profit Margin: ${grossProfitMargin.toFixed(2)}%</p>
      <p>Net Profit Margin: ${netProfitMargin.toFixed(2)}%</p>
    </div>
  </body>
  </html>
  `;
};

/**
 * Print the current financial report
 * @param htmlContent - The HTML content to print
 */
export const printReport = (htmlContent: string): void => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
};