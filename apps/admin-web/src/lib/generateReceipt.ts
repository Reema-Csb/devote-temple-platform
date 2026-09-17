import { Transaction } from "@/types/transaction.type";

export function downloadReceipt(tx: Transaction) {
  const userName =
    typeof window !== "undefined"
      ? (() => {
          try {
            const stored = localStorage.getItem("devoteUser");
            if (!stored) return "Devotee";
            const parsed = JSON.parse(stored);
            return (
              parsed.displayName ||
              [parsed.firstName, parsed.lastName].filter(Boolean).join(" ") ||
              "Devotee"
            );
          } catch {
            return "Devotee";
          }
        })()
      : "Devotee";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt – ${tx.transactionId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #1a0f00;
      background: #fff;
      padding: 40px;
      max-width: 680px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .header {
      text-align: center;
      margin-bottom: 28px;
    }
    .header .brand {
      font-size: 22px;
      font-style: italic;
      font-weight: 700;
      color: #7b2b0a;
      letter-spacing: 0.5px;
    }
    .header h1 {
      font-size: 18px;
      font-weight: 700;
      color: #1a0f00;
      margin-top: 4px;
    }

    /* ── Meta row ── */
    .meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 14px;
      border-bottom: 2px solid #1a0f00;
    }
    .meta-item label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #7b4f2a;
    }
    .meta-item p {
      font-size: 13px;
      font-weight: 600;
      margin-top: 3px;
    }

    /* ── From / To ── */
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .party {
      width: 48%;
    }
    .party h3 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #7b4f2a;
      margin-bottom: 6px;
    }
    .party p {
      font-size: 13px;
      line-height: 1.6;
      color: #1a0f00;
    }

    /* ── Table ── */
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #7b4f2a;
      margin-bottom: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    thead tr {
      background: #7b2b0a;
      color: #fff;
    }
    thead th {
      padding: 9px 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }
    thead th:last-child { text-align: right; }

    tbody tr {
      border-bottom: 1px solid #ede8df;
    }
    tbody tr:last-child { border-bottom: none; }
    tbody td {
      padding: 10px 12px;
      font-size: 13px;
      color: #1a0f00;
    }
    tbody td:last-child { text-align: right; font-weight: 600; }

    /* ── Summary ── */
    .summary {
      margin-left: auto;
      width: 260px;
      margin-top: 8px;
      border-top: 1px solid #ccc;
      padding-top: 10px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 13px;
    }
    .summary-row.total {
      border-top: 2px solid #1a0f00;
      margin-top: 6px;
      padding-top: 8px;
      font-weight: 700;
      font-size: 14px;
    }
    .summary-row.total td {
      background: #f0e9dc;
    }
    .total-box {
      background: #f0e9dc;
      border: 1px solid #cbb99a;
      border-radius: 4px;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 14px;
      margin-top: 6px;
    }

    /* ── Payment method ── */
    .payment {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0d5c5;
    }
    .payment h3 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #7b4f2a;
      margin-bottom: 6px;
    }
    .payment p { font-size: 13px; line-height: 1.7; }

    /* ── Status badge ── */
    .status {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .status-Completed { background: #dcfce7; color: #166534; }
    .status-Pending   { background: #fef9c3; color: #854d0e; }
    .status-Failed    { background: #fee2e2; color: #991b1b; }

    /* ── Footer ── */
    .footer {
      margin-top: 28px;
      text-align: center;
      font-size: 12px;
      color: #7b4f2a;
      line-height: 1.7;
    }
    .footer strong { color: #1a0f00; }

    @media print {
      body { padding: 20px; }
      @page { margin: 1cm; size: A4; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="brand">Devote</div>
    <h1>Payment Receipt</h1>
  </div>

  <!-- Meta row -->
  <div class="meta">
    <div class="meta-item">
      <label>Receipt No.</label>
      <p>${tx.transactionId}</p>
    </div>
    <div class="meta-item">
      <label>Date</label>
      <p>${tx.date}</p>
    </div>
    <div class="meta-item">
      <label>Time</label>
      <p>${tx.time}</p>
    </div>
    <div class="meta-item">
      <label>Status</label>
      <p><span class="status status-${tx.status}">${tx.status}</span></p>
    </div>
  </div>

  <!-- From / To -->
  <div class="parties">
    <div class="party">
      <h3>From</h3>
      <p>
        <strong>${userName}</strong><br />
        Devotee
      </p>
    </div>
    <div class="party" style="text-align:right">
      <h3>To</h3>
      <p>
        <strong>Devote Platform</strong><br />
        Digital Temple Offerings<br />
        support@devote.app
      </p>
    </div>
  </div>

  <!-- Description table -->
  <p class="section-title">Description of Offering</p>
  <table>
    <thead>
      <tr>
        <th>Item No.</th>
        <th>Temple</th>
        <th>Seva / Offering</th>
        <th>Qty</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${tx.templeName}</td>
        <td>${tx.sevaName}</td>
        <td>1</td>
        <td>₹${tx.amount.toLocaleString("en-IN")}</td>
      </tr>
    </tbody>
  </table>

  <!-- Summary -->
  <div class="summary">
    <div class="summary-row">
      <span>Subtotal</span>
      <span>₹${tx.amount.toLocaleString("en-IN")}</span>
    </div>
    <div class="summary-row">
      <span>Platform Fee</span>
      <span>₹0.00</span>
    </div>
    <div class="summary-row">
      <span>Tax</span>
      <span>₹0.00</span>
    </div>
    <div class="total-box">
      <span>Total Amount</span>
      <span>₹${tx.amount.toLocaleString("en-IN")}</span>
    </div>
  </div>

  <!-- Payment method -->
  <div class="payment">
    <h3>Payment Method</h3>
    <p>Online Payment Gateway (Razorpay)</p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Thank you for your offering! 🙏</p>
    <p>
      Please retain this receipt for your records.<br />
      For queries, contact <strong>support@devote.app</strong>
    </p>
    <p style="margin-top:10px; font-size:11px; color:#aaa;">
      © ${new Date().getFullYear()} Devote. All rights reserved.
    </p>
  </div>

</body>
</html>`;

  const win = window.open("", "_blank", "width=720,height=900");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
