const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelectorAll('.nav-links a');
const revealElements = document.querySelectorAll('.reveal');
const form = document.getElementById('discussionForm');
const formNote = document.getElementById('formNote');
const discussionList = document.getElementById('discussionList');
const clearForumBtn = document.getElementById('clearForumBtn');

const STORAGE_KEY = 'digidawForumDiscussions';

const defaultDiscussions = [
  {
    id: crypto.randomUUID(),
    name: 'Arsal',
    topic: 'Coding dan Wiring',
    title: 'Bagaimana cara mengecek sensor IoT kalau data tidak muncul di dashboard?',
    message: 'Coba mulai dari cek wiring, serial monitor, koneksi WiFi, lalu pastikan endpoint dashboard sudah sesuai.',
    createdAt: new Date().toISOString(),
    answers: [
      {
        name: 'Tim DIGIDAW',
        text: 'Biasanya aku cek Serial Monitor dulu. Kalau sensor kebaca di Serial tapi tidak masuk dashboard, berarti masalahnya di koneksi atau API.'
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    name: 'Harsya',
    topic: 'Ide Teknologi',
    title: 'Project apa yang cocok dikembangkan untuk lingkungan sekolah?',
    message: 'Silakan tulis ide kalian. Bisa tentang energi, keamanan, monitoring lingkungan, atau alat bantu pembelajaran.',
    createdAt: new Date().toISOString(),
    answers: []
  }
];

function getDiscussions() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDiscussions));
    return defaultDiscussions;
  }

  try {
    return JSON.parse(savedData);
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDiscussions));
    return defaultDiscussions;
  }
}

function saveDiscussions(discussions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(discussions));
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
}

function escapeHTML(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderDiscussions() {
  const discussions = getDiscussions();

  if (!discussions.length) {
    discussionList.innerHTML = `
      <div class="empty-discussion">
        Belum ada pertanyaan. Jadilah orang pertama yang membuka diskusi di Forum DIGIDAW.
      </div>
    `;
    return;
  }

  discussionList.innerHTML = discussions.map((item) => {
    const answers = item.answers.length
      ? item.answers.map((answer) => `
          <div class="answer-item">
            <strong>${escapeHTML(answer.name)}</strong>
            <span>${escapeHTML(answer.text)}</span>
          </div>
        `).join('')
      : '<div class="empty-discussion">Belum ada jawaban. Kamu bisa bantu jawab pertanyaan ini.</div>';

    return `
      <article class="question-card" data-id="${item.id}">
        <div class="question-meta">
          <span class="question-topic">${escapeHTML(item.topic)}</span>
          <span>oleh ${escapeHTML(item.name)}</span>
          <span>•</span>
          <span>${formatDate(item.createdAt)}</span>
        </div>
        <h4>${escapeHTML(item.title)}</h4>
        <p>${escapeHTML(item.message)}</p>

        <div class="answer-list">
          ${answers}
        </div>

        <form class="answer-form" data-id="${item.id}">
          <input type="text" name="answerName" placeholder="Nama penjawab" required />
          <input type="text" name="answerText" placeholder="Tulis jawaban kamu..." required />
          <button class="btn" type="submit">Jawab</button>
        </form>
      </article>
    `;
  }).join('');
}

menuToggle.addEventListener('click', () => {
  navbar.classList.toggle('open');
  menuToggle.textContent = navbar.classList.contains('open') ? '×' : '☰';
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navbar.classList.remove('open');
    menuToggle.textContent = '☰';
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, { threshold: 0.16 });

revealElements.forEach(element => observer.observe(element));

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const topic = document.getElementById('topic').value;
  const title = document.getElementById('questionTitle').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !topic || !title || !message) {
    formNote.textContent = 'Lengkapi semua data dulu ya.';
    formNote.style.color = '#fca5a5';
    return;
  }

  const discussions = getDiscussions();

  discussions.unshift({
    id: crypto.randomUUID(),
    name,
    topic,
    title,
    message,
    createdAt: new Date().toISOString(),
    answers: []
  });

  saveDiscussions(discussions);
  renderDiscussions();

  formNote.style.color = '#34d399';
  formNote.textContent = `Pertanyaan dari ${name} berhasil ditampilkan di forum.`;
  form.reset();
});

discussionList.addEventListener('submit', (event) => {
  if (!event.target.classList.contains('answer-form')) return;

  event.preventDefault();

  const discussionId = event.target.dataset.id;
  const answerName = event.target.answerName.value.trim();
  const answerText = event.target.answerText.value.trim();

  if (!answerName || !answerText) return;

  const discussions = getDiscussions();
  const selectedDiscussion = discussions.find(item => item.id === discussionId);

  if (!selectedDiscussion) return;

  selectedDiscussion.answers.push({
    name: answerName,
    text: answerText
  });

  saveDiscussions(discussions);
  renderDiscussions();
});

clearForumBtn.addEventListener('click', () => {
  const confirmReset = confirm('Yakin ingin menghapus semua pertanyaan dan mengembalikan forum ke contoh awal?');

  if (!confirmReset) return;

  localStorage.removeItem(STORAGE_KEY);
  renderDiscussions();
});

document.querySelectorAll('.team-photo').forEach((photo, index) => {
  photo.addEventListener('error', () => {
    photo.src = `https://placehold.co/800x900/080b1d/f5f7ff?text=Foto+Tim+${index + 1}`;
  });
});

renderDiscussions();
