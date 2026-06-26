const STORAGE_KEY = 'ccbt-todos';
const FILTER_LABELS = { all: 'すべて', active: '未完了', done: '完了' };

let todos = load();
let filter = 'all';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// --- mutations ---

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  todos.push({ id: Date.now(), text: trimmed, done: false });
  save();
  render();
  return true;
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.done = !todo.done;
  save();
  render();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

function clearDone() {
  todos = todos.filter(t => !t.done);
  save();
  render();
}

// --- render ---

function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function render() {
  const visible = todos.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done')   return t.done;
    return true;
  });

  const list = document.getElementById('todo-list');

  if (visible.length === 0) {
    const msg = todos.length === 0 ? 'タスクを追加してみましょう' : 'タスクはありません';
    list.innerHTML = `<li class="empty">${msg}</li>`;
  } else {
    list.innerHTML = visible.map(t => `
      <li class="todo-item" data-id="${t.id}">
        <input type="checkbox" ${t.done ? 'checked' : ''}>
        <span class="todo-text ${t.done ? 'done' : ''}">${esc(t.text)}</span>
        <button class="del-btn" title="削除">✕</button>
      </li>`).join('');
  }

  const activeCount = todos.filter(t => !t.done).length;
  document.getElementById('count').textContent =
    todos.length === 0 ? '' : `${activeCount} 件残り`;

  document.getElementById('filters').innerHTML =
    Object.keys(FILTER_LABELS).map(f => `
      <button class="filter-btn ${filter === f ? 'active' : ''}" data-filter="${f}">
        ${FILTER_LABELS[f]}
      </button>`).join('');

  document.getElementById('clear-btn').disabled = !todos.some(t => t.done);
}

// --- events ---

document.getElementById('todo-list').addEventListener('click', e => {
  const item = e.target.closest('.todo-item');
  if (!item) return;
  const id = Number(item.dataset.id);
  if (e.target.matches('input[type="checkbox"]')) toggleTodo(id);
  if (e.target.matches('.del-btn'))               deleteTodo(id);
});

document.getElementById('add-btn').addEventListener('click', () => {
  const input = document.getElementById('new-todo');
  if (addTodo(input.value)) input.value = '';
});

document.getElementById('new-todo').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (addTodo(e.target.value)) e.target.value = '';
});

document.getElementById('clear-btn').addEventListener('click', clearDone);

document.getElementById('filters').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  filter = btn.dataset.filter;
  render();
});

render();
