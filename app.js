let problems = JSON.parse(localStorage.getItem('dsa-problems') || '[]');
let currentFilter = 'All';
let selectedDiff = '';

function selectDiff(btn) {
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedDiff = btn.dataset.diff;
}

function addProblem() {
  const name = document.getElementById('prob-name').value.trim();
  const link = document.getElementById('prob-link').value.trim();
  const topic = document.getElementById('prob-topic').value;
  const notes = document.getElementById('prob-notes').value.trim();

  if (!name) { alert('Enter a problem name.'); return; }
  if (!selectedDiff) { alert('Select a difficulty.'); return; }

  const problem = {
    id: Date.now(),
    name,
    link,
    topic,
    difficulty: selectedDiff,
    notes,
    date: new Date().toISOString().split('T')[0]
  };

  problems.unshift(problem);
  save();
  resetForm();
  renderAll();
}

function deleteProblem(id) {
  problems = problems.filter(p => p.id !== id);
  save();
  renderAll();
}

function save() {
  localStorage.setItem('dsa-problems', JSON.stringify(problems));
}

function resetForm() {
  document.getElementById('prob-name').value = '';
  document.getElementById('prob-link').value = '';
  document.getElementById('prob-topic').value = '';
  document.getElementById('prob-notes').value = '';
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
  selectedDiff = '';
}

function filter(diff, btn) {
  currentFilter = diff;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderList();
}

function getFiltered() {
  const search = document.getElementById('search').value.toLowerCase();
  return problems.filter(p => {
    const matchDiff = currentFilter === 'All' || p.difficulty === currentFilter;
    const matchSearch = p.name.toLowerCase().includes(search) ||
      (p.topic && p.topic.toLowerCase().includes(search));
    return matchDiff && matchSearch;
  });
}

function calcStreak() {
  if (!problems.length) return 0;
  const dates = [...new Set(problems.map(p => p.date))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev - curr) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function renderStats() {
  document.getElementById('total').textContent = problems.length;
  document.getElementById('streak').textContent = calcStreak() + '🔥';
  document.getElementById('easy-count').textContent = problems.filter(p => p.difficulty === 'Easy').length;
  document.getElementById('med-count').textContent = problems.filter(p => p.difficulty === 'Medium').length;
  document.getElementById('hard-count').textContent = problems.filter(p => p.difficulty === 'Hard').length;
}

function renderList() {
  const filtered = getFiltered();
  const list = document.getElementById('problem-list');
  const empty = document.getElementById('empty-state');
  const count = document.getElementById('prob-count');

  count.textContent = `(${filtered.length})`;

  if (!filtered.length) {
    list.innerHTML = '';
    empty.classList.add('show');
    return;
  }

  empty.classList.remove('show');

  list.innerHTML = filtered.map(p => `
    <div class="problem-card">
      <div class="diff-dot dot-${p.difficulty}"></div>
      <div class="card-body">
        <div class="card-top">
          ${p.link
            ? `<a class="card-name" href="${p.link}" target="_blank" rel="noopener">${p.name}</a>`
            : `<span class="card-name">${p.name}</span>`
          }
          <span class="tag tag-${p.difficulty}">${p.difficulty}</span>
          ${p.topic ? `<span class="tag tag-topic">${p.topic}</span>` : ''}
        </div>
        <div class="card-meta">${formatDate(p.date)}</div>
        ${p.notes ? `<div class="card-notes">${p.notes}</div>` : ''}
      </div>
      <button class="delete-btn" onclick="deleteProblem(${p.id})" title="Delete">✕</button>
    </div>
  `).join('');
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderAll() {
  renderStats();
  renderList();
}

renderAll();
