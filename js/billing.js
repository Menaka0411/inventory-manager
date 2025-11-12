// ---------- Catalog & Billing ----------
function renderCatalog(filter=""){
  const cont = $("#catalogList");

  const filtered = inventory.filter(p =>
    !filter ||
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    (p.category||"").toLowerCase().includes(filter.toLowerCase())
  );

  cont.innerHTML = filtered.map(p => `
    <div class="catalog-item" onclick="addToCartByIndex(${inventory.indexOf(p)})">
      <div class="catalog-item-name">${escapeHtml(p.name)}</div>
      <div class="catalog-item-rate">₹${p.rate}</div>
      <button class="catalog-add-btn">Add</button>
    </div>
  `).join("");
}

function addToCartByIndex(i){
  const prod = inventory[i];
  if(!prod) return;
  addToCart(prod);
}


// Cart operations
let cart = [];
const cartTbody = $("#cartTable tbody");
function addToCart(prod){
  const existing = cart.find(c => c.name === prod.name);
  if(existing) existing.qty++;
  else cart.push({ name: prod.name, mrp: prod.mrp, rate: prod.rate, qty: 1 });
  renderCart();
}
function renderCart(){
  cartTbody.innerHTML = "";
  cart.forEach((c, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td>${escapeHtml(c.name)}</td>
    <td>${formatCurrency(c.mrp)}</td>
    <td><input type="number" min="1" value="${c.qty}" data-i="${idx}" class="qty-input" /></td>
    <td>${formatCurrency(c.rate)}</td>
    <td>${formatCurrency(c.rate * c.qty)}</td>
    <td><button class="remove" data-i="${idx}">✖</button></td>`;
    cartTbody.appendChild(tr);
  });

  // qty change
    $$(".qty-input").forEach(q => q.oninput = e => {
    const i = +e.target.dataset.i;
    cart[i].qty = Math.max(1, parseInt(e.target.value) || 1);
    updateCartTotals(); 
    const row = e.target.closest("tr");
    row.children[4].textContent = formatCurrency(cart[i].rate * cart[i].qty);
    });

  $$(".remove").forEach(b => b.onclick = e => {
    cart.splice(+e.target.dataset.i,1);
    renderCart();
  });
  updateCartTotals();
}

function updateCartTotals(){
  const subtotal = cart.reduce((s,c)=> s + (c.rate * c.qty), 0);
  const tax = +(subtotal * 0.05).toFixed(2); // 5% GST sample
  const discount = parseFloat($("#discountInput").value) || 0;
  const grand = Math.max(0, subtotal + tax - discount);
  $("#subtotal").textContent = formatCurrency(subtotal);
  $("#tax").textContent = formatCurrency(tax);
  $("#grandTotal").textContent = formatCurrency(grand);
}
$("#discountInput").addEventListener("input", updateCartTotals);
$("#clearCart").addEventListener("click", () => {
  cart = [];
  renderCart();
  $("#customerName").value = "";
  $("#customerMobile").value = "";
  $("#discountInput").value = 0;
  $("#subtotal").textContent = "₹0";
  $("#tax").textContent = "₹0";
  $("#grandTotal").textContent = "₹0";
});

// Save sale & print
document.getElementById("saveSale").addEventListener("click", () => {
  if (cart.length === 0) return alert("Cart is empty!");

    const { jsPDF } = window.jspdf;

    let minHeight = 120; 
    let lineHeight = 6; 
    let dynamicHeight = minHeight + (cart.length * lineHeight);

    if(dynamicHeight < 120) dynamicHeight = 120; 
    if(dynamicHeight > 400) dynamicHeight = 400; 

    const doc = new jsPDF({
    unit: "mm",
    format: [80, dynamicHeight]
    });

  // Use Arial (Unicode safe, shows ₹ correctly)
  doc.setFont("Helvetica", "normal");

  const invoiceNumber = "INV-" + Date.now();
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});

  // ===== HEADER =====
  doc.setFontSize(14);
  doc.setFont("Helvetica", "bold");
  doc.text((shopInfo.name || "MY SHOP").toUpperCase(), 40, 8, { align: "center" });
  
  doc.setFontSize(9);
  doc.setFont("Helvetica", "normal");
  if (shopInfo.address) doc.text(shopInfo.address, 40, 13, { align: "center" });
  if (shopInfo.phone) doc.text("Ph: " + shopInfo.phone, 40, 18, { align: "center" });

  // ===== DATE / TIME =====
  doc.text(`Date: ${date}`, 5, 26);
  doc.text(`Time: ${time}`, 55, 26);

  // ===== CUSTOMER INFO =====
  const custName = $("#customerName").value || "Walk-in";
  const custMobile = $("#customerMobile").value || "-";

  doc.text(`Customer: ${custName}`, 5, 31);
  doc.text(`Mobile: ${custMobile}`, 49, 31);

  doc.text(`Bill No: ${invoiceNumber}`, 5, 36);

  // Divider
  doc.line(5, 39, 75, 39);

  // ===== TABLE =====
  let y = 45;
  doc.setFont("Helvetica", "bold");
  doc.text("Item", 5, y);
  doc.text("MRP", 28, y);
  doc.text("Rate", 42, y);
  doc.text("Qty", 55, y);
  doc.text("Amt", 75, y, { align: "right" });
  y += 4;
  doc.line(5, y, 75, y);
  y += 4;
  doc.setFont("Helvetica", "normal");

  cart.forEach(p => {
    doc.text(p.name.substring(0,14), 5, y);
    doc.text(String(p.mrp), 28, y);
    doc.text(String(p.rate), 42, y);
    doc.text(String(p.qty), 55, y);
    doc.text(String((p.rate * p.qty).toFixed(2)), 75, y, { align: "right" });
    y += 6;
  });

  doc.line(5, y, 75, y);
  y += 8;

  // ===== TOTALS (Correct spacing / no power symbol) =====
  const subtotal = Number($("#subtotal").textContent.replace("₹",""));
  const tax = Number($("#tax").textContent.replace("₹",""));
  const discount = Number($("#discountInput").value) || 0;
  const total = Number($("#grandTotal").textContent.replace("₹",""));

  doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, 5, y); y += 5;
  doc.text(`GST (5%): Rs. ${tax.toFixed(2)}`, 5, y); y += 5;
  doc.text(`Discount: ${discount.toFixed(2)} %`, 5, y); y += 6;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`TOTAL: Rs. ${total.toFixed(2)}`, 5, y); 
  y += 10;

  // ===== FOOTER =====
  doc.setFontSize(10);
  doc.setFont("Helvetica", "bold");
  doc.text((shopInfo.footerMsg || "THANK YOU! VISIT AGAIN"), 40, y, { align: "center" });

  doc.save(`${invoiceNumber}.pdf`);

  // SAVE PURCHASE HISTORY
  const saleEntry = {
    id: invoiceNumber,
    date: new Date().toISOString(),
    customerName: custName,
    customerMobile: custMobile,
    discount,
    items: cart.map(c => ({ name: c.name, qty: c.qty, mrp: c.mrp, rate: c.rate })),
    total
  };
  sales.push(saleEntry);
  localStorage.setItem(KEY_SALES, JSON.stringify(sales));

  cart = [];
  renderCart();
  $("#customerName").value = "";
  $("#customerMobile").value = "";
  $("#discountInput").value = 0;    
  $("#subtotal").textContent = "₹0";    
  $("#tax").textContent = "₹0";
  $("#grandTotal").textContent = "₹0";

});



// create printable invoice
function createInvoicePrint(record){
  const inv = $("#invoicePrint");
  const header = `<div style="padding:18px;font-family:Poppins"><div style="display:flex;justify-content:space-between;align-items:center">
    <div><h2>${escapeHtml(shopInfo.name)}</h2><div>${escapeHtml(shopInfo.tag)}</div><div>${escapeHtml(shopInfo.contact)}</div></div>
    <div>Invoice #: ${record.id}<br>${new Date(record.date).toLocaleString()}</div>
  </div><hr/></div>`;
  const itemsHtml = record.items.map(it => `<tr><td>${escapeHtml(it.name)}</td><td>${it.qty}</td><td>${formatCurrency(it.rate)}</td><td>${formatCurrency(it.rate*it.qty)}</td></tr>`).join("");
  const body = `<div style="padding:18px"><table style="width:100%;border-collapse:collapse"><thead><tr><th align="left">Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${itemsHtml}</tbody></table>
    <div style="margin-top:12px;display:flex;justify-content:flex-end">
      <div style="width:300px">
        <div style="display:flex;justify-content:space-between"><div>Subtotal</div><div>${formatCurrency(record.subtotal)}</div></div>
        <div style="display:flex;justify-content:space-between"><div>Tax</div><div>${formatCurrency(record.tax)}</div></div>
        <div style="display:flex;justify-content:space-between"><div>Discount</div><div>${formatCurrency(record.discount)}</div></div>
        <hr/>
        <div style="display:flex;justify-content:space-between;font-weight:700"><div>Grand Total</div><div>${formatCurrency(record.total)}</div></div>
      </div>
    </div></div>`;
  inv.innerHTML = `<div style="width:800px;background:#fff">${header}${body}</div>`;
  // print
  const w = window.open("", "_blank");
  w.document.write(`<html><head><title>Invoice ${record.id}</title></head><body>${inv.innerHTML}</body></html>`);
  w.document.close();
  w.print();
  w.close();
}