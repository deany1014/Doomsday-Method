const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

let correct = 0, wrong = 0, streak = 0;
let currentAnswer = 0;
let answered = false;

// Practice options
let weekStart = 1; // 0 = Sunday, 1 = Monday
let yearMode = 'random'; // 'random' or 'fixed'
let fixedYear = 2026;
let showMonthNum = true;

function setOption(option, value) {
  if (option === 'weekStart') {
    weekStart = value;
  } else if (option === 'yearMode') {
    yearMode = value;
    const input = document.getElementById('year-input');
    if (value === 'fixed') {
      input.style.display = 'block';
      fixedYear = parseInt(input.value) || 2026;
    } else {
      input.style.display = 'none';
    }
  } else if (option === 'showMonthNum') {
    showMonthNum = value;
  }
  
  // Update button states
  updateOptionButtons(option, value);
  
  // Reset practice if already started
  if (document.getElementById('practice-date-display').dataset.set) {
    newQuestion();
  }
}

function updateOptionButtons(option, value) {
  // Find all option groups and update the appropriate one
  const optionGroups = document.querySelectorAll('.option-group');
  
  if (option === 'weekStart') {
    const weekBtns = optionGroups[0].querySelectorAll('.option-btn');
    weekBtns.forEach(btn => btn.classList.remove('active'));
    weekBtns[value === 1 ? 0 : 1].classList.add('active');
  } else if (option === 'yearMode') {
    const yearBtns = optionGroups[1].querySelectorAll('.option-btn');
    yearBtns.forEach(btn => btn.classList.remove('active'));
    yearBtns[value === 'random' ? 0 : 1].classList.add('active');
  } else if (option === 'showMonthNum') {
    const monthBtns = optionGroups[2].querySelectorAll('.option-btn');
    monthBtns.forEach(btn => btn.classList.remove('active'));
    monthBtns[value ? 1 : 0].classList.add('active');
  }
}

let yearInputListenerAdded = false;

function showTab(name) {
  ['learn','ref','practice'].forEach(t => {
    document.getElementById('tab-'+t).classList.add('hidden');
    document.querySelectorAll('.tab')[['learn','ref','practice'].indexOf(t)].classList.remove('active');
  });
  document.getElementById('tab-'+name).classList.remove('hidden');
  document.querySelectorAll('.tab')[['learn','ref','practice'].indexOf(name)].classList.add('active');
  if (name === 'practice') {
    if (!document.getElementById('practice-date-display').dataset.set) {
      newQuestion();
    }
    // Set up year input listener (only once)
    if (!yearInputListenerAdded) {
      const yearInput = document.getElementById('year-input');
      yearInput.addEventListener('change', function() {
        fixedYear = parseInt(this.value) || 2026;
        if (yearMode === 'fixed' && document.getElementById('practice-date-display').dataset.set) {
          newQuestion();
        }
      });
      yearInputListenerAdded = true;
    }
  }
}

function isLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function doomsday(year) {
  const centuryAnchors = {18:5, 19:3, 20:2, 21:0};
  const c = Math.floor(year / 100);
  const anchor = centuryAnchors[c] ?? 2;
  const y = year % 100;
  const a = Math.floor(y/12) + (y%12) + Math.floor((y%12)/4);
  return (anchor + a) % 7;
}

function getDayOfWeek(year, month, day) {
  const d = new Date(year, month-1, day);
  return d.getDay();
}

function doomsdayDatesForMonth(month, year) {
  const leap = isLeap(year);
  const map = {
    1: leap ? 4 : 3,
    2: leap ? 29 : 28,
    3: 7, 4: 4, 5: 9, 6: 6,
    7: 11, 8: 8, 9: 5, 10: 10,
    11: 7, 12: 12
  };
  return map[month];
}

function monthName(m) {
  const shortName = MONTHS_SHORT[m-1];
  return showMonthNum ? `${shortName} (${m})` : shortName;
}

function randomDate() {
  const year = yearMode === 'fixed' ? fixedYear : 2000 + Math.floor(Math.random() * 200);
  const month = 1 + Math.floor(Math.random() * 12);
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = 1 + Math.floor(Math.random() * daysInMonth);
  return {year, month, day};
}

function newQuestion() {
  answered = false;
  document.getElementById('solution').classList.remove('show');
  const {year, month, day} = randomDate();
  currentAnswer = getDayOfWeek(year, month, day);
  const display = `${day} ${monthName(month)} ${year}`;
  const el = document.getElementById('practice-date-display');
  el.textContent = display;
  el.dataset.set = '1';
  el.dataset.year = year;
  el.dataset.month = month;
  el.dataset.day = day;

  // build buttons
  const btns = document.getElementById('day-buttons');
  btns.innerHTML = '';
  
  // Create day order based on weekStart setting
  let dayOrder = [];
  if (weekStart === 0) {
    // Sunday first
    dayOrder = Array.from(DAYS_SHORT);
  } else {
    // Monday first
    dayOrder = DAYS_SHORT.slice(1).concat(DAYS_SHORT.slice(0, 1));
  }
  
  dayOrder.forEach((d, i) => {
    const b = document.createElement('button');
    b.className = 'day-btn';
    b.textContent = d;
    // Map to actual day index (0-6)
    const actualDayIndex = weekStart === 0 ? i : (i + 1) % 7;
    b.onclick = () => guess(actualDayIndex, b);
    btns.appendChild(b);
  });
}

function guess(dayIndex, btn) {
  if (answered) return;
  answered = true;

  const btns = document.querySelectorAll('.day-btn');
  if (dayIndex === currentAnswer) {
    btn.classList.add('correct');
    correct++; streak++;
  } else {
    btn.classList.add('wrong');
    btns[currentAnswer].classList.add('correct');
    wrong++; streak = 0;
  }

  document.getElementById('correct-count').textContent = correct;
  document.getElementById('wrong-count').textContent = wrong;
  document.getElementById('streak-count').textContent = streak;

  // Show solution
  showSolution();
}

function showSolution() {
  const el = document.getElementById('practice-date-display');
  const year = +el.dataset.year;
  const month = +el.dataset.month;
  const day = +el.dataset.day;

  const leap = isLeap(year);
  const centuryAnchors = {18:5, 19:3, 20:2, 21:0};
  const c = Math.floor(year / 100);
  const anchor = centuryAnchors[c] ?? 2;
  const anchorDay = DAYS[anchor];
  const y = year % 100;
  const p1 = Math.floor(y/12);
  const p2 = y%12;
  const p3 = Math.floor(p2/4);
  const dd = (anchor + p1 + p2 + p3) % 7;
  const ddDay = DAYS[dd];
  const nearestDD = doomsdayDatesForMonth(month, year);
  const diff = day - nearestDD;
  const answer = ((dd + diff) % 7 + 7) % 7;

  const html = `
    <div class="sol-step">
      <div class="sol-label">Century anchor</div>
      <div class="sol-val">${year < 2000 ? '1900s' : year < 2100 ? '2000s' : '2100s'} → <span class="accent">${anchorDay} (${anchor})</span></div>
    </div>
    <div class="sol-step">
      <div class="sol-label">Year calc (y=${y})</div>
      <div class="sol-val">⌊${y}/12⌋ + ${y}%12 + ⌊${p2}/4⌋ = <span class="accent">${p1} + ${p2} + ${p3} = ${p1+p2+p3}</span></div>
    </div>
    <div class="sol-step">
      <div class="sol-label">Doomsday ${year}</div>
      <div class="sol-val">(${anchor} + ${p1+p2+p3}) mod 7 = <span class="accent">${dd} → ${ddDay}</span></div>
    </div>
    <div class="sol-step">
      <div class="sol-label">Nearest anchor</div>
      <div class="sol-val">${monthName(month)} ${nearestDD} = Doomsday = <span class="accent">${ddDay}</span></div>
    </div>
    <div class="sol-step">
      <div class="sol-label">Count to ${day}</div>
      <div class="sol-val">${day} − ${nearestDD} = ${diff > 0 ? '+' : ''}${diff} → <span class="accent">${DAYS[answer]}</span></div>
    </div>
  `;

  document.getElementById('sol-content').innerHTML = html;
  document.getElementById('solution').classList.add('show');
}
