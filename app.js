// ===== P1: Date & Data Utilities =====

const MS_PER_DAY = 86400000;
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function today() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function weekOfDate(d) {
  const start = parseDate(SEMESTER.startMonday);
  const diff = Math.floor((d - start) / MS_PER_DAY);
  if (diff < 0) return null;
  const w = Math.floor(diff / 7) + 1;
  return w <= SEMESTER.totalWeeks ? w : null;
}

function weekdayOf(d) {
  return (d.getDay() + 6) % 7 + 1; // 1=Mon .. 7=Sun
}

function weekdayName(wd) {
  return '星期' + WEEKDAYS[wd];
}

function mondayOfWeek(w) {
  return addDays(parseDate(SEMESTER.startMonday), (w - 1) * 7);
}

function isHoliday(d) {
  return HOLIDAYS[fmtDate(d)] || null;
}

function isExamWeek(w) {
  return SEMESTER.examWeeks.includes(w);
}

function periodRange(start, end) {
  const s = PERIODS.find(p => p.n === start);
  const e = PERIODS.find(p => p.n === end);
  return s && e ? `${s.start}-${e.end}` : '';
}

const COURSE_PALETTE = [
  { bg: '#e3f2fd', border: '#1976d2', text: '#0d47a1' },
  { bg: '#e8f5e9', border: '#388e3c', text: '#1b5e20' },
  { bg: '#fff3e0', border: '#f57c00', text: '#e65100' },
  { bg: '#f3e5f5', border: '#7b1fa2', text: '#4a148c' },
  { bg: '#e0f7fa', border: '#0097a7', text: '#006064' },
  { bg: '#fce4ec', border: '#c2185b', text: '#880e4f' },
  { bg: '#fff8e1', border: '#f9a825', text: '#f57f17' },
  { bg: '#e8eaf6', border: '#3949ab', text: '#1a237e' },
  { bg: '#e0f2f1', border: '#00796b', text: '#004d40' },
  { bg: '#fbe9e7', border: '#e64a19', text: '#bf360c' },
  { bg: '#f1f8e9', border: '#689f38', text: '#33691e' },
  { bg: '#ede7f6', border: '#512da8', text: '#311b92' },
  { bg: '#e1f5fe', border: '#0288d1', text: '#01579b' },
];

const _uniqueCourseNames = [...new Set(COURSES.map(c => c.name))];

function courseColor(name) {
  const idx = _uniqueCourseNames.indexOf(name);
  return COURSE_PALETTE[idx >= 0 ? idx % COURSE_PALETTE.length : 0];
}

function coursesOn(d) {
  const w = weekOfDate(d);
  if (w === null) return [];
  if (isHoliday(d)) return [];
  const wd = weekdayOf(d);
  return COURSES
    .filter(c => c.day === wd && w >= c.weeks[0] && w <= c.weeks[1])
    .sort((a, b) => a.start - b.start);
}

// ===== P2: Navigation & Tab Switching =====

let currentTab = 'home';

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + tab);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  if (tab === 'home') renderHome();
  else if (tab === 'timetable') renderTimetable();
  else if (tab === 'todo') renderTodoList();
}

function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

// ===== P3: Todo Store & Modal =====

const TODO_KEY = 'buaa-schedule-todos-v1';

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
  } catch { return []; }
}

function saveTodos(list) {
  localStorage.setItem(TODO_KEY, JSON.stringify(list));
}

function addTodo(obj) {
  const list = loadTodos();
  obj.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  obj.done = false;
  obj.createdAt = new Date().toISOString();
  list.push(obj);
  saveTodos(list);
  return obj;
}

function updateTodo(id, changes) {
  const list = loadTodos();
  const idx = list.findIndex(t => t.id === id);
  if (idx < 0) return null;
  Object.assign(list[idx], changes);
  saveTodos(list);
  return list[idx];
}

function deleteTodo(id) {
  let list = loadTodos();
  list = list.filter(t => t.id !== id);
  saveTodos(list);
}

function toggleTodo(id) {
  const list = loadTodos();
  const t = list.find(t => t.id === id);
  if (t) { t.done = !t.done; saveTodos(list); }
  return t;
}

let editingTodoId = null;

function openModal(todo) {
  editingTodoId = todo ? todo.id : null;
  document.getElementById('modal-title').textContent = todo ? '编辑待办' : '新建待办';
  document.getElementById('f-title').value = todo ? todo.title : '';
  document.getElementById('f-date').value = todo ? todo.date : fmtDate(today());
  document.getElementById('f-time').value = todo ? (todo.time || '') : '';
  document.getElementById('f-loc').value = todo ? (todo.loc || '') : '';
  document.getElementById('f-note').value = todo ? (todo.note || '') : '';
  const delBtn = document.getElementById('f-delete');
  if (todo) {
    delBtn.classList.remove('hidden');
    delBtn.textContent = '删除';
  } else {
    delBtn.classList.add('hidden');
  }
  document.getElementById('modal-mask').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-mask').classList.add('hidden');
  editingTodoId = null;
}

function collectForm() {
  const title = document.getElementById('f-title').value.trim();
  const date = document.getElementById('f-date').value;
  if (!title || !date) return null;
  return {
    title,
    date,
    time: document.getElementById('f-time').value || null,
    loc: document.getElementById('f-loc').value.trim() || null,
    note: document.getElementById('f-note').value.trim() || null,
  };
}

function initModal() {
  document.getElementById('todo-form').addEventListener('submit', e => {
    e.preventDefault();
    const data = collectForm();
    if (!data) return;
    if (editingTodoId) {
      updateTodo(editingTodoId, data);
    } else {
      addTodo(data);
    }
    closeModal();
    refreshCurrentView();
  });
  document.getElementById('f-cancel').addEventListener('click', closeModal);
  
  let deleteConfirmTimer = null;
  const deleteBtn = document.getElementById('f-delete');
  deleteBtn.addEventListener('click', () => {
    if (!editingTodoId) return;
    if (deleteBtn.textContent === '确认删除？') {
      deleteTodo(editingTodoId);
      closeModal();
      refreshCurrentView();
      clearTimeout(deleteConfirmTimer);
      deleteBtn.textContent = '删除';
    } else {
      deleteBtn.textContent = '确认删除？';
      deleteConfirmTimer = setTimeout(() => {
        deleteBtn.textContent = '删除';
      }, 3000);
    }
  });
  
  document.getElementById('modal-mask').addEventListener('click', e => {
    if (e.target.id === 'modal-mask') closeModal();
  });
  document.getElementById('todo-add').addEventListener('click', () => openModal(null));
}

function refreshCurrentView() {
  if (currentTab === 'home') renderHome();
  else if (currentTab === 'timetable') renderTimetable();
  else if (currentTab === 'todo') renderTodoList();
}

// ===== P4: Home View =====

function renderHome() {
  const d = today();
  const w = weekOfDate(d);
  const wd = weekdayOf(d);

  document.getElementById('home-date').textContent =
    (d.getMonth() + 1) + '月' + d.getDate() + '日';
  document.getElementById('home-sub').textContent =
    d.getFullYear() + '年 · ' + weekdayName(wd);

  const weekEl = document.getElementById('home-week');
  if (w !== null) {
    weekEl.textContent = '第 ' + w + ' 周';
    weekEl.style.display = '';
  } else {
    weekEl.textContent = '假期';
    weekEl.style.display = '';
  }

  renderBanner(d, w);
  renderHomeCourses(d);
  renderHomeTodos(d);
}

function renderBanner(d, w) {
  const el = document.getElementById('home-banner');
  const hol = isHoliday(d);
  if (hol) {
    el.innerHTML = '<div class="banner holiday">今天是' + hol + '假期</div>';
    return;
  }
  if (w !== null && isExamWeek(w)) {
    el.innerHTML = '<div class="banner exam">第' + w + '周为考试周</div>';
    return;
  }
  if (w === null) {
    el.innerHTML = '<div class="banner off">当前为非教学周</div>';
    return;
  }
  el.innerHTML = '';
}

function renderHomeCourses(d) {
  const el = document.getElementById('home-courses');
  const courses = coursesOn(d);
  if (courses.length === 0) {
    el.innerHTML = '<div class="empty">今天没有课</div>';
    return;
  }
  el.innerHTML = courses.map(c => {
    const color = courseColor(c.name);
    const time = periodRange(c.start, c.end);
    return '<div class="card course-card" style="border-left:3px solid ' + color.border + '">' +
      '<div class="course-time">' + time + '<div class="period">第' + c.start + '-' + c.end + '节</div></div>' +
      '<div class="course-info"><div class="course-name">' + c.name + '</div>' +
      '<div class="course-meta">' + c.teacher + ' · ' + c.loc + '</div></div></div>';
  }).join('');
}

function renderHomeTodos(d) {
  const el = document.getElementById('home-todos');
  const ds = fmtDate(d);
  const todos = loadTodos().filter(t => t.date === ds);
  if (todos.length === 0) {
    el.innerHTML = '<div class="empty">今天没有待办<div class="btn-wrap"><button class="primary-btn" onclick="openModal(null)">＋新建</button></div></div>';
    return;
  }
  el.innerHTML = todos.map(t => {
    const cls = 'todo-row' + (t.done ? ' done' : '');
    const timeStr = t.time ? '<span class="todo-time">' + t.time + '</span>' : '';
    return '<div class="card ' + cls + '" data-id="' + t.id + '">' +
      '<div class="todo-check" data-toggle="' + t.id + '">' + (t.done ? '✓' : '') + '</div>' +
      '<div class="todo-content" data-edit="' + t.id + '"><div class="todo-title">' + t.title + '</div></div>' +
      timeStr + '</div>';
  }).join('');

  attachTodoEventListeners(el);
}

// ===== P5: Timetable View =====

let ttWeek = null;

function renderTimetable() {
  if (ttWeek === null) {
    const w = weekOfDate(today());
    ttWeek = w !== null ? w : 1;
  }
  updateTtLabel();
  buildGrid();

  document.getElementById('tt-prev').onclick = () => { if (ttWeek > 1) { ttWeek--; renderTimetable(); } };
  document.getElementById('tt-next').onclick = () => { if (ttWeek < SEMESTER.totalWeeks) { ttWeek++; renderTimetable(); } };
  document.getElementById('tt-today').onclick = () => {
    const w = weekOfDate(today());
    ttWeek = w !== null ? w : 1;
    renderTimetable();
  };
}

function updateTtLabel() {
  const mon = mondayOfWeek(ttWeek);
  const sun = addDays(mon, 6);
  const label = (mon.getMonth() + 1) + '/' + mon.getDate() + ' — ' +
    (sun.getMonth() + 1) + '/' + sun.getDate() + ' · 第' + ttWeek + '周';
  document.getElementById('tt-label').textContent = label;
  document.getElementById('tt-prev').disabled = ttWeek <= 1;
  document.getElementById('tt-next').disabled = ttWeek >= SEMESTER.totalWeeks;
}

function buildGrid() {
  const grid = document.getElementById('tt-grid');
  const mon = mondayOfWeek(ttWeek);
  const todayStr = fmtDate(today());
  const dayNames = ['一', '二', '三', '四', '五', '六', '日'];

  let html = '<div class="tt-header"></div>';
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i);
    const ds = fmtDate(d);
    const isToday = ds === todayStr;
    const hol = isHoliday(d);
    const cls = 'tt-header' + (isToday ? ' today' : '');
    let inner = '周' + dayNames[i] + '<br>' + (d.getMonth() + 1) + '/' + d.getDate();
    if (hol) inner += '<span class="holiday-tag">' + hol + '</span>';
    html += '<div class="' + cls + '">' + inner + '</div>';
  }

  for (let p = 1; p <= 14; p++) {
    const pInfo = PERIODS.find(x => x.n === p);
    html += '<div class="tt-period">' + p + '<br><span style="font-size:10px">' + pInfo.start + '</span></div>';
    for (let di = 0; di < 7; di++) {
      const d = addDays(mon, di);
      const ds = fmtDate(d);
      const isToday = ds === todayStr;
      html += '<div class="tt-cell' + (isToday ? ' today-col' : '') + '" data-day="' + (di + 1) + '" data-period="' + p + '"></div>';
    }
  }
  grid.innerHTML = html;

  const courses = COURSES.filter(c => ttWeek >= c.weeks[0] && ttWeek <= c.weeks[1]);
  courses.forEach(c => {
    const cell = grid.querySelector('[data-day="' + c.day + '"][data-period="' + c.start + '"]');
    if (!cell) return;
    const d = addDays(mon, c.day - 1);
    if (isHoliday(d)) return;
    const color = courseColor(c.name);
    const span = c.end - c.start + 1;
    const rowH = 44;
    const block = document.createElement('div');
    block.className = 'course-block';
    block.style.cssText = 'top:2px;height:' + (span * rowH - 4) + 'px;background:' + color.bg +
      ';border-left-color:' + color.border + ';color:' + color.text;
    block.innerHTML = '<div class="cb-name">' + c.name + '</div>' +
      (span > 1 ? '<div class="cb-loc">' + c.loc + '</div>' : '');
    block.addEventListener('click', () => showCoursePopover(c));
    cell.style.position = 'relative';
    cell.appendChild(block);
  });
}

function showCoursePopover(c) {
  hidePopover();
  const mask = document.createElement('div');
  mask.className = 'popover-mask';
  mask.id = 'popover-mask';
  mask.innerHTML = '<div class="popover">' +
    '<div class="popover-title">' + c.name + '</div>' +
    '<div class="popover-row">👤 ' + c.teacher + '</div>' +
    '<div class="popover-row">📍 ' + c.loc + '</div>' +
    '<div class="popover-row">🕐 第' + c.start + '-' + c.end + '节 · ' + periodRange(c.start, c.end) + '</div>' +
    '<div class="popover-row">📅 第' + c.weeks[0] + '-' + c.weeks[1] + '周 · 周' + '一二三四五六日'[c.day - 1] + '</div>' +
    '<button class="popover-close" id="popover-close">关闭</button></div>';
  document.body.appendChild(mask);
  mask.addEventListener('click', e => {
    if (e.target === mask || e.target.id === 'popover-close') hidePopover();
  });
}

function hidePopover() {
  const el = document.getElementById('popover-mask');
  if (el) el.remove();
}

// ===== P6: Todo List View =====

function renderTodoList() {
  const el = document.getElementById('todo-list');
  const todos = loadTodos();

  if (todos.length === 0) {
    el.innerHTML = '<div class="empty">暂无待办事项<div class="btn-wrap"><button class="primary-btn" onclick="openModal(null)">＋ 新建待办</button></div></div>';
    return;
  }

  const ds = fmtDate(today());
  todos.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (a.time && b.time) return a.time < b.time ? -1 : 1;
    return 0;
  });

  const groups = {};
  todos.forEach(t => {
    let label;
    if (t.date < ds) label = '已过期';
    else if (t.date === ds) label = '今天';
    else label = t.date;
    if (!groups[label]) groups[label] = [];
    groups[label].push(t);
  });

  let html = '';
  Object.keys(groups).forEach(label => {
    const items = groups[label];
    const isOverdue = label === '已过期';
    html += '<div class="todo-group-header' + (isOverdue ? ' overdue' : '') + '">' +
      groupLabel(label) + ' <span class="count">' + items.length + '</span></div>';
    items.forEach(t => {
      const cls = 'todo-row' + (t.done ? ' done' : '') + (isOverdue && !t.done ? ' overdue-item' : '');
      const timeStr = t.time ? '<span class="todo-time">' + t.time + '</span>' : '';
      const redDot = (isOverdue && !t.done) ? '<span class="overdue-dot"></span>' : '';
      html += '<div class="card ' + cls + '" data-id="' + t.id + '">' +
        redDot +
        '<div class="todo-check" data-toggle="' + t.id + '">' + (t.done ? '✓' : '') + '</div>' +
        '<div class="todo-content" data-edit="' + t.id + '"><div class="todo-title">' + t.title + '</div>' +
        '<div class="course-meta">' + t.date + (t.loc ? ' · ' + t.loc : '') + '</div></div>' +
        timeStr + '</div>';
    });
  });
  el.innerHTML = html;

  attachTodoEventListeners(el);
}

function attachTodoEventListeners(container) {
  container.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      toggleTodo(el.dataset.toggle);
      renderTodoList();
    });
  });
  container.querySelectorAll('[data-edit]').forEach(el => {
    el.addEventListener('click', () => {
      const t = loadTodos().find(x => x.id === el.dataset.edit);
      if (t) openModal(t);
    });
  });
}

function groupLabel(label) {
  if (label === '已过期') return '⚠️ 已过期';
  if (label === '今天') return '📌 今天';
  const d = parseDate(label);
  return '📅 ' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + weekdayName(weekdayOf(d));
}

// ===== Init =====

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initModal();
  renderHome();
});
