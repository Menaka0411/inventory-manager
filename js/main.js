/* ===== Invento App (vanilla JS) ===== */

// ---------- Storage keys ----------
const KEY_INVENTORY = "invento_inventory_v1";
const KEY_SALES = "invento_sales_v1";
const KEY_SHOP = "invento_shop_v1";

// ---------- App state ----------
let inventory = JSON.parse(localStorage.getItem(KEY_INVENTORY) || "[]");
let sales = JSON.parse(localStorage.getItem(KEY_SALES) || "[]");
let shopInfo = JSON.parse(localStorage.getItem(KEY_SHOP) || `{"name":"My Shop","tag":"Track. Bill. Grow.","contact":""}`);

// ---------- Helpers ----------
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const formatCurrency = v => "₹" + Number(v || 0).toLocaleString('en-IN', {maximumFractionDigits:2});

// ---------- Sections & nav ----------
const sections = $$(".page");
const navBtns = $$(".menu button");
navBtns.forEach(b => b.addEventListener("click", () => showSection(b.dataset.section)));
function showSection(id){
  sections.forEach(s => s.id === id ? s.classList.remove("hidden") : s.classList.add("hidden"));
  navBtns.forEach(nb => nb.classList.toggle("active", nb.dataset.section === id));
  if(id === "dashboard") renderDashboard();
  if(id === "inventory") renderInventoryTable();
  if(id === "billing") renderCatalog();
  if(id === "analytics") renderAnalytics();
  if(id === "settings") onOpenSettings();
  if(id === "bulkPage"){
    bulkTbody.innerHTML = "";
    for(let i = 0; i < 100; i++){
      addBulkRow();
    }
  }
}
document.getElementById("goInventory").addEventListener("click", ()=> showSection("inventory"));
document.getElementById("goBilling").addEventListener("click", ()=> showSection("billing"));
document.getElementById("openBulk").addEventListener("click", ()=> showSection("bulkPage"));
document.getElementById("openBulk2").addEventListener("click", ()=> showSection("bulkPage"));

// initialize
$("#shopNameDisplay").textContent = shopInfo.name || "My Shop";
showSection("dashboard");

// ---------- Dashboard ----------
function renderDashboard(){
  // totals
  const totalRevenue = sales.reduce((s, x) => s + (x.total || 0), 0);
  $("#totalRevenue").textContent = formatCurrency(totalRevenue);

  // today's sales
  const today = new Date().toISOString().slice(0,10);
  const todays = sales.filter(s => s.date && s.date.slice(0,10) === today);
  const todayTotal = todays.reduce((s,x)=> s + (x.total||0),0);
  $("#todaysSales").textContent = formatCurrency(todayTotal);

  // low stock
  const low = inventory.filter(i => i.stock <= (i.reorder || 5)).length;
  $("#lowStockCount").textContent = low;
  $("#lowStockBanner").classList.toggle("hidden", low===0);
  if(low) $("#lowStockBanner").textContent = `${low} items low in stock — consider restocking`;

  // total products
  $("#totalProducts").textContent = inventory.length;

  // recent sales
const rs = $("#recentSales");
  rs.innerHTML = "";

  const maxEntries = 20;
  const recent = sales.slice(-maxEntries).reverse();
  const left = recent.slice(0, 8);
  const right = recent.slice(8, 16);

  function block(item){
    const d = new Date(item.date).toLocaleString();
    return `
      <div class="recent-row">
        <div class="recent-amount-row">
          <span class="recent-amount">${formatCurrency(item.total)}</span>
          <span class="recent-name">${item.customerName || "Unknown"}</span>
        </div>

        <div class="recent-date-row">
          <span class="recent-date">${d}</span>
          <span class="recent-mobile">${item.customerMobile || "-"}</span>
        </div>
      </div>
    `;
  }

  const leftColHTML = left.length ? left.map(block).join("") : `<div>No sales yet</div>`;
  const rightColHTML = right.length ? right.map(block).join("") : `<div></div>`;

  rs.innerHTML = `
    <div class="recent-col">${leftColHTML}</div>
    <div class="recent-col">${rightColHTML}</div>`;
}


// ---------- small optimization: filterCatalog used by global search when billing open ----------
function filterCatalog(q){ renderCatalog(q); }

