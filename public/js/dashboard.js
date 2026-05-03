let circles = [];
let selectedCircleFilter = 'all';
let selectedColor = '#2a7c5a';
let selectedMembersCircleId = null;

const colors = ['#2a7c5a','#5b4fd8','#d85b5b','#c47d1a','#1a7fb5','#a854a8'];

function avatarColor(name) {
  const palette = ['#2a7c5a','#5b4fd8','#d85b5b','#c47d1a','#1a7fb5','#a854a8','#6b8f4a','#b84040'];
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % palette.length;
  return palette[h];
}

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

async function loadCircles() {
  const res = await fetch('/circles');
  circles = await res.json();
  renderSidebar();
  renderComposePicker();
  renderFilterPills();
}

function renderSidebar() {
  const list = document.getElementById('circles-list');
  list.innerHTML = `<li class="circle-item ${selectedCircleFilter === 'all' ? 'active' : ''}" data-id="all">
    <div class="circle-item-left"><span class="circle-dot" style="background:#888;"></span> All circles</div>
  </li>`;
  circles.forEach(c => {
    const li = document.createElement('li');
    li.className = 'circle-item' + (selectedCircleFilter === c._id ? ' active' : '');
    li.dataset.id = c._id;
    li.innerHTML = `<div class="circle-item-left"><span class="circle-dot" style="background:${c.color};"></span>${c.name}</div>
      <button class="circle-manage-btn" data-cid="${c._id}" data-cname="${c.name}">manage</button>`;
    list.appendChild(li);
  });

  list.querySelectorAll('.circle-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('circle-manage-btn')) return;
      selectedCircleFilter = item.dataset.id;
      renderSidebar();
      renderFilterPills();
      loadFeed();
    });
  });

  list.querySelectorAll('.circle-manage-btn').forEach(btn => {
    btn.addEventListener('click', () => openMemberModal(btn.dataset.cid, btn.dataset.cname));
  });
}

function renderComposePicker() {
  const container = document.getElementById('circle-checkboxes');
  container.innerHTML = '';
  circles.forEach(c => {
    const label = document.createElement('label');
    label.className = 'circle-checkbox-label';
    label.innerHTML = `<input type="checkbox" value="${c._id}"><span style="width:7px;height:7px;border-radius:50%;background:${c.color};display:inline-block;"></span>${c.name}`;
    label.querySelector('input').addEventListener('change', (e) => {
      label.classList.toggle('checked', e.target.checked);
    });
    container.appendChild(label);
  });
}

function renderFilterPills() {
  const container = document.getElementById('feed-filters');
  container.innerHTML = `<button class="pill ${selectedCircleFilter === 'all' ? 'active' : ''}" data-id="all">All circles</button>`;
  circles.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'pill' + (selectedCircleFilter === c._id ? ' active' : '');
    btn.dataset.id = c._id;
    btn.textContent = c.name;
    container.appendChild(btn);
  });
  container.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      selectedCircleFilter = pill.dataset.id;
      renderSidebar();
      renderFilterPills();
      loadFeed();
    });
  });
}

async function loadFeed() {
  const url = selectedCircleFilter === 'all' ? '/posts/feed' : `/posts/feed?circle=${selectedCircleFilter}`;
  const res = await fetch(url);
  const posts = await res.json();
  renderFeed(posts);
}

function renderFeed(posts) {
  const container = document.getElementById('post-feed');
  if (!posts.length) {
    container.innerHTML = `<div class="empty-feed"><h3>Nothing here yet</h3><p>Create a circle and post something!</p></div>`;
    return;
  }
  container.innerHTML = posts.map(p => `
    <div class="post-card" data-id="${p._id}">
      <div class="post-head">
        <div class="post-avatar" style="background:${avatarColor(p.author.name)}">${initials(p.author.name)}</div>
        <div class="post-meta">
          <div class="post-name">${p.author.name}</div>
          <div class="post-circles-row">${p.circles.map(c => `<span class="post-circle-tag" style="background:${c.color}22;color:${c.color}">${c.name}</span>`).join('')}</div>
        </div>
        <div class="post-time">${timeAgo(p.createdAt)}</div>
      </div>
      <div class="post-body">${p.content}</div>
      <div class="post-actions">
        <button class="post-action like-btn ${p.liked ? 'liked' : ''}" data-id="${p._id}">♥ ${p.likes.length}</button>
        <button class="post-action toggle-comments" data-id="${p._id}">💬 ${p.comments.length}</button>
      </div>
      <div class="comments-section" style="display:none;" id="comments-${p._id}">
        ${p.comments.map(c => `<div class="comment"><strong>${c.author?.name || 'Someone'}</strong>: ${c.text}</div>`).join('')}
        <div class="comment-input">
          <input type="text" placeholder="Add a comment..." id="comment-input-${p._id}"/>
          <button onclick="addComment('${p._id}')">Send</button>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => likePost(btn.dataset.id, btn));
  });
  container.querySelectorAll('.toggle-comments').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = document.getElementById('comments-' + btn.dataset.id);
      section.style.display = section.style.display === 'none' ? 'block' : 'none';
    });
  });
}

async function likePost(postId, btn) {
  const res = await fetch(`/posts/${postId}/like`, { method: 'POST' });
  const data = await res.json();
  btn.textContent = `♥ ${data.likes}`;
  btn.classList.toggle('liked', data.liked);
}

async function addComment(postId) {
  const input = document.getElementById('comment-input-' + postId);
  const text = input.value.trim();
  if (!text) return;
  const res = await fetch(`/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  const comment = await res.json();
  const section = document.getElementById('comments-' + postId);
  const div = document.createElement('div');
  div.className = 'comment';
  div.innerHTML = `<strong>${comment.author.name}</strong>: ${comment.text}`;
  section.insertBefore(div, section.querySelector('.comment-input'));
  input.value = '';
}

// POST
document.getElementById('post-btn').addEventListener('click', async () => {
  const content = document.getElementById('post-content').value.trim();
  const checked = [...document.querySelectorAll('#circle-checkboxes input:checked')].map(i => i.value);
  if (!content) return alert('Write something first!');
  if (!checked.length) return alert('Select at least one circle!');

  const res = await fetch('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, circles: checked })
  });
  const post = await res.json();
  if (post._id) {
    document.getElementById('post-content').value = '';
    document.querySelectorAll('#circle-checkboxes input').forEach(i => { i.checked = false; i.closest('label').classList.remove('checked'); });
    loadFeed();
  }
});

// CIRCLE MODAL
document.getElementById('new-circle-btn').addEventListener('click', () => {
  document.getElementById('circle-modal').style.display = 'flex';
  document.getElementById('circle-name').focus();
});
document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('circle-modal').style.display = 'none';
});
document.querySelectorAll('.color-swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    selectedColor = swatch.dataset.color;
  });
});
document.getElementById('create-circle-btn').addEventListener('click', async () => {
  const name = document.getElementById('circle-name').value.trim();
  if (!name) return;
  const res = await fetch('/circles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color: selectedColor })
  });
  const circle = await res.json();
  if (circle._id) {
    document.getElementById('circle-modal').style.display = 'none';
    document.getElementById('circle-name').value = '';
    await loadCircles();
    loadFeed();
  }
});

// MEMBER MODAL
function openMemberModal(circleId, circleName) {
  selectedMembersCircleId = circleId;
  document.getElementById('modal-circle-name').textContent = circleName;
  document.getElementById('member-email').value = '';
  document.getElementById('member-error').style.display = 'none';
  const circle = circles.find(c => c._id === circleId);
  renderCurrentMembers(circle?.members || []);
  document.getElementById('member-modal').style.display = 'flex';
}
document.getElementById('close-member-modal').addEventListener('click', () => {
  document.getElementById('member-modal').style.display = 'none';
});
function renderCurrentMembers(members) {
  const container = document.getElementById('current-members');
  if (!members.length) { container.innerHTML = '<p style="font-size:0.85rem;color:var(--gray-400);">No members yet.</p>'; return; }
  container.innerHTML = '<p style="font-size:0.8rem;font-weight:500;color:var(--gray-400);margin-bottom:0.5rem;">Members</p>' +
    members.map(m => `<div class="member-row"><span>${m.name} <span style="color:var(--gray-400)">(${m.email})</span></span>
      <button class="remove-member-btn" data-uid="${m._id}">Remove</button></div>`).join('');
  container.querySelectorAll('.remove-member-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await fetch(`/circles/${selectedMembersCircleId}/members/${btn.dataset.uid}`, { method: 'DELETE' });
      await loadCircles();
      const updated = circles.find(c => c._id === selectedMembersCircleId);
      renderCurrentMembers(updated?.members || []);
    });
  });
}
document.getElementById('add-member-btn').addEventListener('click', async () => {
  const email = document.getElementById('member-email').value.trim();
  const errEl = document.getElementById('member-error');
  errEl.style.display = 'none';
  if (!email) return;
  const res = await fetch(`/circles/${selectedMembersCircleId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (data.success) {
    document.getElementById('member-email').value = '';
    await loadCircles();
    const updated = circles.find(c => c._id === selectedMembersCircleId);
    renderCurrentMembers(updated?.members || []);
  } else {
    errEl.textContent = data.error;
    errEl.style.display = 'block';
  }
});

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.style.display = 'none'; });
});

// Init
loadCircles().then(loadFeed);
