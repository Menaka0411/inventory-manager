//---------- Calendar ----------
let currentDate = new Date();
let calendarNotes = JSON.parse(localStorage.getItem("calendarNotes") || "{}");

function renderCalendar() {
  const grid = $("#calendarGrid");
  const monthSpan = $("#calendarMonth");
  const yearSpan = $("#calendarYear");
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  monthSpan.textContent = currentDate.toLocaleString('default', { month: 'long' });
  yearSpan.textContent = year;

  const firstDay = new Date(year, month, 1).getDay(); 
  const lastDate = new Date(year, month + 1, 0).getDate();

  let daysHtml = "";
  let dayCounter = 1;

  for(let row=0; row<6; row++){
    for(let col=0; col<7; col++){
      if(row === 0 && col < firstDay || dayCounter > lastDate){
        daysHtml += `<div></div>`;
      } else {
        const key = `${year}-${month+1}-${dayCounter}`;
        const note = calendarNotes[key];
        const noteClass = note ? note.type : "";
        const todayClass = (dayCounter === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) ? "today" : "";
        daysHtml += `<div class="day ${todayClass} ${noteClass}" data-day="${dayCounter}" data-key="${key}">${dayCounter}</div>`;
        dayCounter++;
      }
    }
  }

  grid.innerHTML = daysHtml;

  $$(".calendar-grid .day").forEach(day => {
    if(day.dataset.key){
      day.onclick = () => openModal(day.dataset.key);
    }
  });
}

// Open Modal
let selectedDayKey = null;

function openModal(key){
  selectedDayKey = key;
  $("#calendarModal").classList.remove("hidden");
  $("#eventDate").value = key;
  const noteData = calendarNotes[key];
  $("#eventTitle").value = noteData ? noteData.title : "";
  $("#eventContent").value = noteData ? noteData.content : "";
  $("#eventType").value = noteData ? noteData.type : "red";
}

// Save Event
$("#calendarForm").onsubmit = (e) => {
  e.preventDefault();
  const title = $("#eventTitle").value.trim();
  const content = $("#eventContent").value.trim();
  const type = $("#eventType").value;

  if(title && content){
    calendarNotes[selectedDayKey] = { title, content, type };
    localStorage.setItem("calendarNotes", JSON.stringify(calendarNotes));
    $("#calendarModal").classList.add("hidden");
    renderCalendar();
  }
}

//edit date from cal modal
const editDateBtn = $("#editDateBtn");
let editingDate = false;

editDateBtn.onclick = () => {
  const dateInput = $("#eventDate");

  if (!editingDate) {
    editingDate = true;
    dateInput.readOnly = false;
    dateInput.focus();
    editDateBtn.textContent = "✔"; 
    editDateBtn.classList.add("save-mode");
  } else {
    editingDate = false;
    dateInput.readOnly = true;

    const newKey = dateInput.value.trim();
    if (newKey !== selectedDayKey) {
      calendarNotes[newKey] = calendarNotes[selectedDayKey];
      delete calendarNotes[selectedDayKey];
      selectedDayKey = newKey;
      localStorage.setItem("calendarNotes", JSON.stringify(calendarNotes));
      renderCalendar();
    }

    editDateBtn.textContent = "✎";
    editDateBtn.classList.remove("save-mode");
  }
};


$("#prevMonth").onclick = () => { currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); }
$("#nextMonth").onclick = () => { currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); }

// Month dropdown
$("#calendarMonth").onclick = () => {
  const dropdown = $("#monthDropdown");
  dropdown.innerHTML = "";
  for(let m=0;m<12;m++){
    const monthName = new Date(0,m).toLocaleString('default',{month:'long'});
    const div = document.createElement("div");
    div.textContent = monthName;
    div.onclick = () => { currentDate.setMonth(m); dropdown.classList.add("hidden"); renderCalendar(); }
    dropdown.appendChild(div);
  }
  dropdown.classList.toggle("hidden");
  dropdown.style.top = $("#calendarMonth").offsetTop + 25 + "px";
  dropdown.style.left = $("#calendarMonth").offsetLeft + "px";
}

// Year dropdown
$("#calendarYear").onclick = () => {
  const dropdown = $("#yearDropdown");
  dropdown.innerHTML = "";
  for(let y=1970;y<=2050;y++){
    const div = document.createElement("div");
    div.textContent = y;
    div.onclick = () => { currentDate.setFullYear(y); dropdown.classList.add("hidden"); renderCalendar(); }
    dropdown.appendChild(div);
  }
  dropdown.classList.toggle("hidden");
  dropdown.style.top = $("#calendarYear").offsetTop + 25 + "px";
  dropdown.style.left = $("#calendarYear").offsetLeft + "px";
}

document.addEventListener("click", (e) => {
  const monthDropdown = $("#monthDropdown");
  const yearDropdown = $("#yearDropdown");
  const monthSpan = $("#calendarMonth");
  const yearSpan = $("#calendarYear");

  if (!monthSpan.contains(e.target) && !monthDropdown.contains(e.target)) {
    monthDropdown.classList.add("hidden");
  }

  if (!yearSpan.contains(e.target) && !yearDropdown.contains(e.target)) {
    yearDropdown.classList.add("hidden");
  }
});


renderCalendar();
