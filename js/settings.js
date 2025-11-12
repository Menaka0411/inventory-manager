// ---------- Shop settings ----------

const settingsTabs = $$(".settings-tab");
const settingsContents = $$(".settings-content");

settingsTabs.forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;

    settingsTabs.forEach(t => t.classList.remove("active"));
    btn.classList.add("active");

    settingsContents.forEach(c => {
      c.id === tab ? c.classList.add("active") : c.classList.remove("active");
      c.id === tab ? c.classList.remove("hidden") : c.classList.add("hidden");
    });
  });
});

// ----- LOAD SHOP PROFILE -----
function loadShopInfo() {
  $("#shopName").value = shopInfo.name || "";
  $("#shopTag").value = shopInfo.tag || "";
  $("#shopFooter").value = shopInfo.footerMsg || "";
  $("#shopAddress").value = shopInfo.address || "";
  $("#shopPhone").value = shopInfo.phone || "";
  $("#shopEmail").value = shopInfo.email || "";
}


// ----- SAVE SHOP PROFILE -----
$("#saveShopInfo").onclick = () => {
  shopInfo = {
    name: $("#shopName").value.trim() || "My Shop",
    tag: $("#shopTag").value.trim() || "",
    footerMsg: $("#shopFooter").value.trim() || "Thank you! Visit Again",
    address: $("#shopAddress").value.trim() || "",
    phone: $("#shopPhone").value.trim() || "",
    email: $("#shopEmail").value.trim() || ""
  };

  localStorage.setItem(KEY_SHOP, JSON.stringify(shopInfo));
  $("#shopNameDisplay").textContent = shopInfo.name;
  alert("✅ Shop profile updated.");
};



// ================= INVOICE HISTORY TAB ================= //
const historyBody = $("#invoiceHistoryTable tbody");

function renderInvoiceHistory(){
  historyBody.innerHTML = "";

  sales.slice().reverse().forEach((s,i) => {
    const d = new Date(s.date);
    const date = d.toLocaleDateString();
    const time = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const discount = s.discount ? `${s.discount}%` : "-";
    const itemsCount = s.items.reduce((sum, x) => sum + x.qty, 0);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="text-align:center;">${i+1}</td>
      <td>${date}</td>
      <td>${time}</td>
      <td>${escapeHtml(s.customerName || "-")}</td>
      <td style="text-align:center;">${escapeHtml(s.customerMobile || "-")}</td>
      <td style="text-align:center;">${discount}</td>
      <td style="text-align:center;">${itemsCount}</td>
      <td style="text-align:right;">Rs. ${s.total.toFixed(2)}</td>`;
    historyBody.appendChild(tr);
  });
}

$("#historySearch").addEventListener("input", (e)=>{
  const q = e.target.value.trim().toLowerCase();
  const rows = historyBody.querySelectorAll("tr");
  rows.forEach(r=>{
    const txt = r.textContent.toLowerCase();
    r.style.display = txt.includes(q) ? "" : "none";
  });
});

// Print History 
$("#printHistory").onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Invoice History", 105, 12, { align: "center" });

  const table = document.getElementById("invoiceHistoryTable");
  const rows = [...table.querySelectorAll("tbody tr")].map(r =>
    [...r.querySelectorAll("td")].map(td => td.innerText.trim())
  );

  const header = [...table.querySelectorAll("thead th")].map(th => th.innerText.trim());

  // Generate PDF Table with Borders
  doc.autoTable({
    head: [header],
    body: rows,
    theme: "grid",
    startY: 20,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      halign: "center",
      valign: "middle",
      overflow: 'linebreak'
    },
    margin: { left: 5, right: 5 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 24 },
      2: { cellWidth: 21 },
      3: { cellWidth: 45, halign: "left" },
      4: { cellWidth: 28 }, 
      5: { cellWidth: 22 },
      6: { cellWidth: 15 },
      7: { cellWidth: 30, halign: "right" }
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: 0,
      fontStyle: "bold",
      lineWidth: 0.3,
    },
    tableLineColor: 0,
    tableLineWidth: 0.3,
  });

  doc.save("Invoice_History.pdf");
};

// ================= WITHDRAW TAB ================= //

let withdrawals = JSON.parse(localStorage.getItem("withdrawals") || "[]");

function updateExpenseCards(){
  const salesNow = JSON.parse(localStorage.getItem(KEY_SALES) || "[]");
  const withdrawals = JSON.parse(localStorage.getItem("withdrawals") || "[]");

  const totalRevenue = salesNow.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
  const availableBalance = totalRevenue - totalWithdrawn;

  $("#expTotalRevenue").textContent = "₹" + totalRevenue.toFixed(2);
  $("#expTotalWithdrawn").textContent = "₹" + totalWithdrawn.toFixed(2);
  $("#expWithdrawCount").textContent = withdrawals.length;
  $("#expAvailableBalance").textContent = "₹" + availableBalance.toFixed(2);
}

updateExpenseCards();

$("#withdrawBtn").onclick = () => {
  const f = $("#withdrawForm");
  f.style.display = (getComputedStyle(f).display === "none") ? "block" : "none";
};

$("#confirmWithdraw").onclick = () => {
  const amount = parseFloat($("#withdrawAmount").value);
  const note = $("#withdrawNote").value.trim() || "No note";

  if(!amount || amount <= 0) return alert("Enter valid amount");

  withdrawals.push({
    amount,
    note,
    date: new Date().toISOString()
  });

  localStorage.setItem("withdrawals", JSON.stringify(withdrawals));

  alert(`₹${amount.toFixed(2)} withdrawn successfully!`);

  $("#withdrawAmount").value = "";
  $("#withdrawNote").value = "";
  $("#withdrawForm").style.display = "none";

  updateExpenseCards();
  renderWithdrawHistory();
};

$("#cancelWithdraw").onclick = () => {
  $("#withdrawForm").classList.add("hidden");
  $("#withdrawAmount").value = "";
  $("#withdrawNote").value = "";
};

// ================= WITHDRAW HISTORY TAB ================= //
function renderWithdrawHistory() {
  const historyBody = $("#withdrawHistoryTable tbody");
  const withdrawals = JSON.parse(localStorage.getItem("withdrawals") || "[]");
  historyBody.innerHTML = "";

  withdrawals.slice().reverse().forEach((w, i) => {
    const d = new Date(w.date);
    const date = d.toLocaleDateString();
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="text-align:center;">${i + 1}</td>
      <td>${date}</td>
      <td>${time}</td>
      <td>${escapeHtml(w.note || "—")}</td>
      <td style="text-align:right;">Rs. ${w.amount.toFixed(2)}</td>
    `;
    historyBody.appendChild(tr);
  });
}

// search in withdraw history
$("#withdrawSearch").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  const rows = $("#withdrawHistoryTable tbody").querySelectorAll("tr");
  rows.forEach(r => {
    const txt = r.textContent.toLowerCase();
    r.style.display = txt.includes(q) ? "" : "none";
  });
});

// Print Withdraw History
$("#printWithdrawHistory").onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Withdraw History", 105, 12, { align: "center" });

  const table = document.getElementById("withdrawHistoryTable");
  const rows = [...table.querySelectorAll("tbody tr")].map(r =>
    [...r.querySelectorAll("td")].map(td => td.innerText.trim())
  );
  const header = [...table.querySelectorAll("thead th")].map(th => th.innerText.trim());

  // Generate the table
  doc.autoTable({
    head: [header],
    body: rows,
    theme: "grid",
    startY: 20,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: [0, 0, 0], 
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [245, 245, 245], 
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    margin: { left: 5, right: 5 },
  });

  doc.save("Withdraw_History.pdf");
};


function onOpenSettings(){
  loadShopInfo();
  renderInvoiceHistory();
  updateExpenseCards();
  renderWithdrawHistory();
}
