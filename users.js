// Supabase init
const SUPABASE_URL = "https://wpsjgygdbkvdjkikvzws.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwc2pneWdkYmt2ZGpraWt2endzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNDMzMDQsImV4cCI6MjA3MTkxOTMwNH0.m1DFironTn3qT9aNNnCafYs81pTPQlsCVzw79Ss1QOg";

// Ensure Supabase SDK is present
if (typeof window !== 'undefined' && !window.supabase) {
    console.error('Supabase SDK not loaded.');
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tbody = document.getElementById('users-tbody');
const errorEl = document.getElementById('users-error');
const addBtn = document.getElementById('add-user-btn');
const nicknameInput = document.getElementById('nickname-input');
const groupInput = document.getElementById('group-input');

function setError(message) {
    if (!errorEl) return;
    if (!message) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
    } else {
        errorEl.style.display = 'block';
        errorEl.textContent = message;
    }
}

function renderRows(rows) {
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!rows || rows.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 2;
        td.style.padding = '12px 16px';
        td.style.color = 'var(--text-secondary)';
        td.textContent = 'Пока нет пользователей';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    for (const row of rows) {
        const tr = document.createElement('tr');
        const tdNick = document.createElement('td');
        tdNick.style.padding = '12px 16px';
        tdNick.textContent = row.nickname ?? '';
        const tdGroup = document.createElement('td');
        tdGroup.style.padding = '12px 16px';
        tdGroup.textContent = row.group_name ?? '';
        tr.appendChild(tdNick);
        tr.appendChild(tdGroup);
        tbody.appendChild(tr);
    }
}

async function fetchUsers() {
    setError(null);
    const { data, error } = await supabase
        .from('users')
        .select('nickname, group_name')
        .order('nickname', { ascending: true });
    if (error) {
        console.error(error);
        setError('Ошибка загрузки пользователей: ' + error.message);
        return;
    }
    renderRows(data);
}

async function insertUser(nickname, groupName) {
    setError(null);
    if (!nickname || !groupName) {
        setError('Введите никнейм и группу');
        return;
    }
    const { error } = await supabase
        .from('users')
        .insert([{ nickname, group_name: groupName }]);
    if (error) {
        console.error(error);
        setError('Ошибка добавления: ' + error.message);
        return;
    }
    nicknameInput.value = '';
    groupInput.value = '';
}

function setupRealtime() {
    // Realtime on table 'users'
    supabase
        .channel('public:users')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
            await fetchUsers();
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                // initial fetch
                fetchUsers();
            }
        });
}

if (addBtn) {
    addBtn.addEventListener('click', async () => {
        await insertUser(nicknameInput.value.trim(), groupInput.value.trim());
    });
}

// Initial load
fetchUsers();
setupRealtime();


