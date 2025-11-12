// ---------- Inventory Table & search ----------
const invTbody = $("#inventoryTable tbody");
$("#globalSearch").addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase();
  if(!$("#billing").classList.contains("hidden")) {
    filterCatalog(q);
  } else {
    renderInventoryTable(q);
  }
});

function renderInventoryTable(filter = "") {
  invTbody.innerHTML = "";

  const rows = inventory.filter(item => {
    if (!filter) return true;
    return (item.name || "").toLowerCase().includes(filter) ||
           (item.category || "").toLowerCase().includes(filter);
  });

  rows.forEach((it, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(it.name)}</td>
      <td>${escapeHtml(it.category || "")}</td>
      <td>${formatCurrency(it.mrp || 0)}</td>
      <td>${escapeHtml(it.unit || "")}</td>
      <td>${formatCurrency(it.rate || 0)}</td>
      <td class="${it.stock <= (it.reorder || 5) ? "low-stock-text" : ""}">${it.stock}</td>
      <td>
        <button class="btn-edit" data-i="${index}">Edit</button>
        <button class="btn-delete" data-i="${index}">Delete</button>
      </td>
    `;
    invTbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-edit").forEach(btn =>
    btn.addEventListener("click", () => editInventoryItem(+btn.dataset.i))
  );

  document.querySelectorAll(".btn-delete").forEach(btn =>
    btn.addEventListener("click", () => deleteInventoryItem(+btn.dataset.i))
  );
}


// Escape helper
function escapeHtml(s){ return String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

//Add Items in inventory
const addItemsBtn = $("#addItemsBtn");
const addItemsModal = $("#addItemsModal");
const addItemsBody = $("#addItemsBody");

addItemsBtn.onclick = () => {
  editingIndex = null;
  addItemsBody.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    addItemsBody.insertAdjacentHTML("beforeend", `
      <tr class="itemRow">
        <td><input></td>
        <td><input></td>
        <td><input type="number"></td>
        <td>
          <select>
            <option value="pcs">pcs</option>
            <option value="pack">pack</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="L">L</option>
            <option value="ml">ml</option>
            <option value="bottle">bottle</option>
          </select>
        </td>
        <td><input type="number"></td>
        <td><input type="number"></td>
      </tr>
    `);
  }

  addItemsModal.classList.remove("hidden");
};

$$(".modal-close").forEach(btn => {
  btn.onclick = () => {
    const target = btn.dataset.target;
    $("#" + target).classList.add("hidden");
  }
});

function toTitle(s){
  return String(s||"")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

$("#saveModalItems").onclick = () => {
  const rows = addItemsBody.querySelectorAll("tr");
  let added = 0;

  rows.forEach(row => {
    const inputs = row.querySelectorAll("input, select");
    const name = toTitle(inputs[0].value);
    if(!name) return;

    const category = toTitle(inputs[1].value);
    const mrp = parseFloat(inputs[2].value) || 0;
    const unit = inputs[3].value;
    const rate = parseFloat(inputs[4].value) || 0;
    const stock = parseInt(inputs[5].value) || 0;

    if (editingIndex !== null && added === 0) {
      inventory[editingIndex] = { ...inventory[editingIndex], name, category, mrp, unit, rate, stock };
      editingIndex = null;
    } else {
      inventory.push({ name, category, mrp, unit, rate, stock, reorder: 5 });
    }
    added++;
  });

  if(added === 0) return; 

  persistInventory();
  renderInventoryTable();
  addItemsModal.classList.add("hidden");
  addItemsModal.querySelector("h3").textContent = "Add Items";
  alert(`Imported ${added} products successfully.`);

};



let editingIndex = null;

// Edit item
function editInventoryItem(i) {
  const p = inventory[i];
  if (!p) return;

  editingIndex = i;

  addItemsBody.innerHTML = `
    <tr class="itemRow">
      <td><input value="${escapeAttr(p.name)}"></td>
      <td><input value="${escapeAttr(p.category)}"></td>
      <td><input type="number" value="${p.mrp || 0}"></td>
      <td>
        <select>
          <option value="pcs" ${p.unit==="pcs"?"selected":""}>pcs</option>
          <option value="pack" ${p.unit==="pack"?"selected":""}>pack</option>
          <option value="kg" ${p.unit==="kg"?"selected":""}>kg</option>
          <option value="g" ${p.unit==="g"?"selected":""}>g</option>
          <option value="L" ${p.unit==="L"?"selected":""}>L</option>
          <option value="ml" ${p.unit==="ml"?"selected":""}>ml</option>
          <option value="bottle" ${p.unit==="bottle"?"selected":""}>bottle</option>
        </select>
      </td>
      <td><input type="number" value="${p.rate || 0}"></td>
      <td><input type="number" value="${p.stock || 0}"></td>
    </tr>
  `;

  addItemsModal.querySelector("h3").textContent = "Edit Item";
  addItemsModal.classList.remove("hidden");
}

// Delete
function deleteInventoryItem(i){
  const item = inventory[i];
  if(!item) return;

  const ok = confirm(`Do you want to delete " ${item.name} " from inventory?`);
  if(!ok) return;

  inventory.splice(i,1);
  persistInventory();
  renderInventoryTable();
}


function persistInventory(){ localStorage.setItem(KEY_INVENTORY, JSON.stringify(inventory)); }


// ---------- Bulk Page (full-page Excel-like) ----------
const bulkTbody = $("#bulkTable tbody");
$("#backInventory").addEventListener("click", ()=> showSection("inventory"));
$("#addBulkRow").addEventListener("click", () => addBulkRow());
$("#clearBulk").addEventListener("click", ()=> { bulkTbody.innerHTML=""; for(let i=0; i<100; i++) addBulkRow(); });

function addBulkRow(name="", category="", mrp="", unit="pcs", rate="", stock=""){
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input value="${escapeAttr(name)}"></td>
    <td><input value="${escapeAttr(category)}"></td>
    <td><input type="number" value="${escapeAttr(mrp)}"></td>
    <td>
      <select>
        <option value="pcs" ${unit==="pcs"?"selected":""}>pcs</option>
        <option value="pack" ${unit==="pack"?"selected":""}>pack</option>
        <option value="kg" ${unit==="kg"?"selected":""}>kg</option>
        <option value="g" ${unit==="g"?"selected":""}>g</option>
        <option value="L" ${unit==="L"?"selected":""}>L</option>
        <option value="ml" ${unit==="ml"?"selected":""}>ml</option>
        <option value="bottle" ${unit==="bottle"?"selected":""}>bottle</option>
      </select>
    </td>
    <td><input type="number" value="${escapeAttr(rate)}"></td>
    <td><input type="number" value="${escapeAttr(stock)}"></td>
  `;
  bulkTbody.appendChild(tr);
}

function escapeAttr(s){ return String(s||"").replaceAll('"','&quot;'); }

$("#saveBulkAll").addEventListener("click", ()=>{
  const rows = [...bulkTbody.querySelectorAll("tr")];
  let added = 0;

  rows.forEach(r=>{
    const inputs = r.querySelectorAll("input, select");
    const name = toTitle(inputs[0].value);
    if(!name) return;

    const category = toTitle(inputs[1].value) || "General";
    const mrp = parseFloat(inputs[2].value) || 0;
    const unit = inputs[3].value;
    const rate = parseFloat(inputs[4].value) || 0;
    const stock = parseInt(inputs[5].value) || 0;

    inventory.push({ name, category, mrp, unit, rate, stock, reorder: 5 });
    added++;
  });

  persistInventory();
  renderInventoryTable();
  alert(`Imported ${added} products successfully.`);
  showSection("inventory");
});