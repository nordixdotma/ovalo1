// PDF generation utility functions
import { formatCurrency, formatDate } from "./utils"

// This function creates a proper PDF using the browser's built-in PDF generation capabilities
export const generateInvoicePDF = (invoice) => {
  try {
    // Create a new window for the PDF content
    const printWindow = window.open("", "_blank", "width=800,height=600")

    if (!printWindow) {
      console.error("Failed to open print window")
      return false
    }

    // Write the HTML content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture ${invoice.number}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
          }
          .company {
            font-size: 24px;
            font-weight: bold;
            color: #9c2d40;
          }
          .invoice-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #9c2d40;
          }
          .invoice-details {
            margin-bottom: 30px;
          }
          .invoice-details div {
            margin-bottom: 10px;
          }
          .label {
            font-weight: bold;
            display: inline-block;
            width: 150px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #f3f4f6;
            text-align: left;
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          .text-right {
            text-align: right;
          }
          .total-row {
            font-weight: bold;
          }
          .total-row td {
            border-top: 2px solid #9c2d40;
          }
          .footer {
            margin-top: 50px;
            font-size: 12px;
            text-align: center;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">OVALO</div>
          <div>
            <div style="font-weight: bold;">FACTURE</div>
            <div>${invoice.number}</div>
          </div>
        </div>
        
        <div class="invoice-title">Facture</div>
        
        <div class="invoice-details">
          <div><span class="label">Client:</span> ${invoice.clientName}</div>
          <div><span class="label">Date:</span> ${formatDate(invoice.date)}</div>
          <div><span class="label">Statut:</span> ${invoice.status}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Produit/Service</th>
              <th class="text-right">Prix unitaire</th>
              <th class="text-right">Quantité</th>
              <th class="text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item) => `
              <tr>
                <td>${item.productName}</td>
                <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.totalHT)}</td>
              </tr>
            `,
              )
              .join("")}
            <tr>
              <td colspan="3" class="text-right">Total HT</td>
              <td class="text-right">${formatCurrency(invoice.totalHT)}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-right">TVA (20%)</td>
              <td class="text-right">${formatCurrency(invoice.totalTTC - invoice.totalHT)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" class="text-right">Total TTC</td>
              <td class="text-right">${formatCurrency(invoice.totalTTC)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="invoice-details">
          <div><span class="label">Montant payé:</span> ${formatCurrency(invoice.paidAmount)}</div>
          <div><span class="label">Reste à payer:</span> ${formatCurrency(invoice.totalTTC - invoice.paidAmount)}</div>
        </div>
        
        <div class="footer">
          OVALO - 123 Rue du Commerce, 75000 Paris - SIRET: 123 456 789 00010
        </div>
      </body>
      </html>
    `)

    // Wait for content to load
    printWindow.document.close()

    // Print the window as PDF
    setTimeout(() => {
      printWindow.print()
    }, 500)

    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    return false
  }
}

export const generateDevisPDF = (devis) => {
  try {
    // Create a new window for the PDF content
    const printWindow = window.open("", "_blank", "width=800,height=600")

    if (!printWindow) {
      console.error("Failed to open print window")
      return false
    }

    // Write the HTML content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Devis ${devis.number}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
          }
          .company {
            font-size: 24px;
            font-weight: bold;
            color: #9c2d40;
          }
          .devis-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #9c2d40;
          }
          .devis-details {
            margin-bottom: 30px;
          }
          .devis-details div {
            margin-bottom: 10px;
          }
          .label {
            font-weight: bold;
            display: inline-block;
            width: 150px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #f3f4f6;
            text-align: left;
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          .text-right {
            text-align: right;
          }
          .total-row {
            font-weight: bold;
          }
          .total-row td {
            border-top: 2px solid #9c2d40;
          }
          .footer {
            margin-top: 50px;
            font-size: 12px;
            text-align: center;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">OVALO</div>
          <div>
            <div style="font-weight: bold;">DEVIS</div>
            <div>${devis.number}</div>
          </div>
        </div>
        
        <div class="devis-title">Devis</div>
        
        <div class="devis-details">
          <div><span class="label">Client:</span> ${devis.clientName}</div>
          <div><span class="label">Date:</span> ${formatDate(devis.date)}</div>
          <div><span class="label">Statut:</span> ${devis.status}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Produit/Service</th>
              <th class="text-right">Prix unitaire</th>
              <th class="text-right">Quantité</th>
              <th class="text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            ${devis.items
              .map(
                (item) => `
              <tr>
                <td>${item.productName}</td>
                <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.totalHT)}</td>
              </tr>
            `,
              )
              .join("")}
            <tr>
              <td colspan="3" class="text-right">Total HT</td>
              <td class="text-right">${formatCurrency(devis.totalHT)}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-right">TVA (20%)</td>
              <td class="text-right">${formatCurrency(devis.totalTTC - devis.totalHT)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" class="text-right">Total TTC</td>
              <td class="text-right">${formatCurrency(devis.totalTTC)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          OVALO - 123 Rue du Commerce, 75000 Paris - SIRET: 123 456 789 00010
        </div>
      </body>
      </html>
    `)

    // Wait for content to load
    printWindow.document.close()

    // Print the window as PDF
    setTimeout(() => {
      printWindow.print()
    }, 500)

    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    return false
  }
}
