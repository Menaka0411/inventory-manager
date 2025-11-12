// === ANALYTICS DASHBOARD === //

function renderAnalytics(){
  calculateAnalyticsKPIs();
  renderAnalyticsCharts();
}

// ---- KPI CALCULATIONS ---- //
function calculateAnalyticsKPIs() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthSales = sales.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = monthSales.reduce((sum, s) => {
    return sum + s.items.reduce((x, i) => {
      const product = inventory.find(p => p.name === i.name);
      const cost = product?.cost || 0;
      return x + (cost * i.qty);
    }, 0);
  }, 0);

  const profit = totalRevenue - totalCost;
  const invoiceCount = monthSales.length;
  const avgOrder = invoiceCount ? (totalRevenue / invoiceCount) : 0;

  $("#kpiMonthRevenue").textContent = "₹" + totalRevenue.toFixed(0);
  $("#kpiMonthProfit").textContent = "₹" + profit.toFixed(0);
  $("#kpiInvoiceCount").textContent = invoiceCount;
  $("#kpiAverageOrder").textContent = "₹" + avgOrder.toFixed(0);
}

// ---- CHART HELPERS ---- //
let charts = []; // to destroy old charts before redrawing

function renderAnalyticsCharts() {
  charts.forEach(c => c.destroy());
  charts = [];

  charts.push(drawRevenueTrend());
  charts.push(drawProfitExpense());
  charts.push(drawCategoryPie());
  charts.push(drawTopProducts());
  charts.push(drawDailyRevenue());
}

// ---- 1) Monthly Revenue Trend ---- //
function drawRevenueTrend() {
  const months = [];
  const revenueData = [];

  for(let i=11;i>=0;i--){
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth(), y = d.getFullYear();

    const monthSales = sales.filter(s => {
      const sd = new Date(s.date);
      return sd.getMonth() === m && sd.getFullYear() === y;
    });

    months.push(d.toLocaleString("en", { month:"short" }));
    revenueData.push(monthSales.reduce((sum, s)=> sum + s.total, 0));
  }

  return new Chart($("#chartRevenueTrend"), {
    type: "line",
    data: { labels: months, datasets: [{ data: revenueData }] },
    options: { responsive:true, plugins:{ legend:{ display:false } } }
  });
}

// ---- 2) Profit vs Expense ---- //
function drawProfitExpense(){
  const now = new Date();
  const m = now.getMonth(), y = now.getFullYear();

  const monthSales = sales.filter(s => {
    const sd = new Date(s.date);
    return sd.getMonth() === m && sd.getFullYear() === y;
  });

  let revenue = 0, cost = 0;
  monthSales.forEach(s => {
    revenue += s.total;
    s.items.forEach(i=>{
      const prod = inventory.find(p=>p.name===i.name);
      cost += (prod?.cost || 0) * i.qty;
    });
  });

  const profit = revenue - cost;

  return new Chart($("#chartProfitExpense"), {
    type:"bar",
    data:{
      labels:["Expense","Profit"],
      datasets:[{ data:[cost, profit] }]
    },
    options:{ plugins:{ legend:{ display:false } } }
  });
}

// ---- 3) Top Category Pie ---- //
function drawCategoryPie(){
  const categoryTotals = {};

  sales.forEach(s => {
    s.items.forEach(i => {
      const p = inventory.find(x=>x.name===i.name);
      const cat = p?.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (i.rate*i.qty);
    });
  });

  return new Chart($("#chartCategoryPie"), {
    type:"pie",
    data:{
      labels:Object.keys(categoryTotals),
      datasets:[{ data:Object.values(categoryTotals) }]
    }
  });
}

// ---- 4) Top 10 Products ---- //
function drawTopProducts(){
  const totals = {};

  sales.forEach(s => {
    s.items.forEach(i => {
      totals[i.name] = (totals[i.name] || 0) + i.qty;
    });
  });

  const sorted = Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const labels = sorted.map(x=>x[0]);
  const data = sorted.map(x=>x[1]);

  return new Chart($("#chartTopProducts"), {
    type:"bar",
    data:{ labels, datasets:[{ data }] },
    options:{ plugins:{ legend:{ display:false } } }
  });
}

// ---- 5) Daily Revenue (Last 30 Days) ---- //
function drawDailyRevenue(){
  const days = [];
  const values = [];

  for(let i=29;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();

    const daySales = sales.filter(s => {
      const sd = new Date(s.date);
      return sd.toDateString() === key;
    });

    days.push(d.getDate());
    values.push(daySales.reduce((sum, s)=> sum+s.total,0));
  }

  return new Chart($("#chartDailyRevenue"), {
    type:"line",
    data:{ labels:days, datasets:[{ data:values }] },
    options:{ plugins:{ legend:{ display:false } } }
  });
}

