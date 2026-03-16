/**
 * Cadastro de Cliente - Form Engine
 * LENS Partner | Disney-level UX implementation
 */

// --- Configuration & State ---
const ACCESS_CODE = '12345';
const IBGE_API_BASE = 'https://servicodados.ibge.gov.br/api/v1/localidades';
const BACKEND_URL = 'http://localhost:3000'; // Update this if hosted online

let currentStep = 0;
let formData = {};
let states = [];
let userNickname = '';

// Questions definition
const questions = [
    {
        id: 'nome',
        label: 'Qual o seu nome completo?',
        type: 'text',
        placeholder: 'Digite seu nome aqui...',
        validate: (val) => val.trim().length > 3
    },
    {
        id: 'email',
        label: 'Qual o seu melhor e-mail?',
        type: 'email',
        placeholder: 'exemplo@email.com',
        validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    },
    {
        id: 'estado',
        label: 'Em qual Estado você mora?',
        type: 'select',
        options: [], // Populated by IBGE
        placeholder: 'Selecione um estado',
        validate: (val) => val !== ''
    },
    {
        id: 'cidade',
        label: 'E qual a sua Cidade?',
        type: 'select',
        options: [], // Populated based on Estado
        placeholder: 'Selecione uma cidade',
        validate: (val) => val !== ''
    },
    {
        id: 'profissao',
        label: 'Finalmente, qual a sua Profissão?',
        type: 'select',
        options: [
            'Empresário(a)',
            'Autônomo(a)',
            'CLT',
            'Estudante',
            'Aposentado(a)',
            'Outros'
        ],
        placeholder: 'Selecione sua profissão',
        validate: (val) => val !== ''
    }
];

// --- DOM Elements ---
const cards = {
    welcome: document.getElementById('welcome-section'),
    auth: document.getElementById('auth-section'),
    form: document.getElementById('form-section'),
    success: document.getElementById('success-section')
};

const welcomeBtn = document.getElementById('welcome-btn');
const welcomeInput = document.getElementById('nickname');
const welcomeTextElement = document.getElementById('welcome-text');

const authTitle = document.querySelector('#auth-section .title');
const authSubtitle = document.querySelector('#auth-section .subtitle');
const authInput = document.getElementById('access-code');
const authBtn = document.getElementById('auth-btn');
const authError = document.getElementById('auth-error');

const progressBar = document.getElementById('progress-bar-inner');
const questionContainer = document.getElementById('question-container');
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');
const finishBtn = document.getElementById('finish-btn');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initPersonalization();
    initAuth();
    loadStates();
});

// --- Typewriter Effect ---
function typeWriter(text, element, speed = 50) {
    element.innerHTML = '';
    let i = 0;
    return new Promise(resolve => {
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

function initPersonalization() {
    const welcomeMsg = "Olá, te damos as boas vindas! Como você gostaria de ser chamado?";
    typeWriter(welcomeMsg, welcomeTextElement);

    welcomeBtn.addEventListener('click', startPersonalizedFlow);
    welcomeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startPersonalizedFlow();
    });
}

function startPersonalizedFlow() {
    const name = welcomeInput.value.trim();
    if (name.length > 1) {
        userNickname = name;
        // Personalize Auth Screen
        authTitle.innerText = `Olá, ${userNickname}!`;
        authSubtitle.innerText = `${userNickname}, por favor, insira o código de acesso que foi fornecido a você.`;
        showSection('auth');
    } else {
        welcomeInput.style.borderColor = '#ff4f4f';
        setTimeout(() => welcomeInput.style.borderColor = 'var(--glass-border)', 1000);
    }
}

// --- Authentication Logic ---
function initAuth() {
    authBtn.addEventListener('click', validateAuth);
    authInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') validateAuth();
    });
}

function validateAuth() {
    if (authInput.value === ACCESS_CODE) {
        showSection('form');
        renderQuestion();
    } else {
        authError.style.display = 'block';
        authInput.style.borderColor = '#ff4f4f';
        setTimeout(() => {
            authError.style.display = 'none';
            authInput.style.borderColor = 'var(--glass-border)';
        }, 3000);
    }
}

// --- Navigation Logic ---
function showSection(sectionKey) {
    Object.values(cards).forEach(card => card.classList.remove('active'));
    cards[sectionKey].classList.add('active');
}

function updateProgress() {
    const percentage = ((currentStep + 1) / questions.length) * 100;
    progressBar.style.width = `${percentage}%`;
}

function renderQuestion() {
    const question = questions[currentStep];
    questionContainer.innerHTML = '';

    const block = document.createElement('div');
    block.className = 'question-block';

    const label = document.createElement('label');
    label.className = 'subtitle';

    // Personalize specific questions
    const personalizedLabels = {
        'nome': `${userNickname}, qual o seu nome completo?`,
        'profissao': `Finalmente ${userNickname}, qual a sua Profissão?`
    };

    label.innerText = personalizedLabels[question.id] || question.label;
    block.appendChild(label);

    let input;
    if (question.type === 'select') {
        input = document.createElement('select');
        input.id = `input-${question.id}`;

        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.text = question.placeholder;
        defaultOpt.disabled = true;
        defaultOpt.selected = !formData[question.id];
        input.appendChild(defaultOpt);

        question.options.forEach(opt => {
            const o = document.createElement('option');
            o.value = typeof opt === 'object' ? opt.sigla || opt.id : opt;
            o.text = typeof opt === 'object' ? opt.nome : opt;
            o.selected = formData[question.id] === o.value;
            input.appendChild(o);
        });

        // Special handling for dynamic loading
        input.addEventListener('change', (e) => {
            formData[question.id] = e.target.value;
            if (question.id === 'estado') loadCities(e.target.value);
        });
    } else {
        input = document.createElement('input');
        input.type = question.type;
        input.id = `input-${question.id}`;
        input.placeholder = question.placeholder;
        input.value = formData[question.id] || '';

        input.addEventListener('input', (e) => {
            formData[question.id] = e.target.value;
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') nextStep();
        });
    }

    block.appendChild(input);
    questionContainer.appendChild(block);

    // UI state updates
    backBtn.classList.toggle('hidden', currentStep === 0);
    const isLast = currentStep === questions.length - 1;
    nextBtn.classList.toggle('hidden', isLast);
    finishBtn.classList.toggle('hidden', !isLast);

    updateProgress();
    input.focus();
}

async function nextStep() {
    const question = questions[currentStep];
    const input = document.getElementById(`input-${question.id}`);
    const value = input.value;

    if (question.validate(value)) {
        // --- NEW: Duplicate Check for Name ---
        if (question.id === 'nome') {
            input.disabled = true;
            const originalText = nextBtn.innerText;
            nextBtn.innerText = 'Verificando...';
            nextBtn.disabled = true;

            try {
                const response = await fetch(`${BACKEND_URL}/api/check-name/${encodeURIComponent(value)}`);
                const data = await response.json();

                if (data.exists) {
                    showInputError(input, 'Este nome já respondeu ao formulário.');
                    input.disabled = false;
                    nextBtn.innerText = originalText;
                    nextBtn.disabled = false;
                    return; // Prevent advancing
                }
            } catch (error) {
                console.error('Erro ao verificar duplicidade:', error);
                // If server is down/error, we let it pass but log it
            }

            input.disabled = false;
            nextBtn.innerText = originalText;
            nextBtn.disabled = false;
        }
        // -------------------------------------

        formData[question.id] = value;
        if (currentStep < questions.length - 1) {
            currentStep++;
            renderQuestion();
        }
    } else {
        showInputError(input);
    }
}

function showInputError(input, message = null) {
    input.style.borderColor = '#ff4f4f';
    if (message) {
        const originalPlaceholder = input.placeholder;
        input.value = '';
        input.placeholder = message;
        setTimeout(() => {
            input.style.borderColor = 'var(--glass-border)';
            input.placeholder = originalPlaceholder;
        }, 3000);
    } else {
        setTimeout(() => input.style.borderColor = 'var(--glass-border)', 1000);
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        renderQuestion();
    }
}

nextBtn.addEventListener('click', nextStep);
backBtn.addEventListener('click', prevStep);
finishBtn.addEventListener('click', finishForm);

// --- IBGE API Integration ---
async function loadStates() {
    try {
        const response = await fetch(`${IBGE_API_BASE}/estados?orderBy=nome`);
        states = await response.json();
        const estadoQuestion = questions.find(q => q.id === 'estado');
        estadoQuestion.options = states;
    } catch (error) {
        console.error('Erro ao buscar estados:', error);
    }
}

async function loadCities(stateSigla) {
    const cidadeQuestion = questions.find(q => q.id === 'cidade');

    // Clear previous city selection if state changes
    formData['cidade'] = '';

    // If we are currently on the city question, show loading
    if (questions[currentStep].id === 'cidade') {
        cidadeQuestion.options = [{ nome: 'Carregando...', id: '' }];
        renderQuestion();
    }

    try {
        const response = await fetch(`${IBGE_API_BASE}/estados/${stateSigla}/municipios`);
        const cities = await response.json();
        cidadeQuestion.options = cities.map(c => ({ nome: c.nome, id: c.nome }));

        // Only re-render if the user is actually looking at the city question
        if (questions[currentStep].id === 'cidade') {
            renderQuestion();
        }
    } catch (error) {
        console.error('Erro ao buscar cidades:', error);
    }
}

// --- Backend Communication & Finalization ---
async function finishForm() {
    // Validate last field
    const lastQ = questions[questions.length - 1];
    const val = document.getElementById(`input-${lastQ.id}`).value;
    if (!lastQ.validate(val)) return;
    formData[lastQ.id] = val;

    // Show loading state on button
    finishBtn.disabled = true;
    finishBtn.innerText = 'Salvando...';

    const timestamp = new Date();
    const payload = {
        respondentId: Math.floor(Math.random() * 1000000),
        date: timestamp.toLocaleDateString('pt-BR'),
        time: timestamp.toLocaleTimeString('pt-BR'),
        answers: questions.map(q => ({
            field: q.id,
            value: formData[q.id]
        }))
    };

    try {
        const response = await fetch(`${BACKEND_URL}/api/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showSection('success');
        } else {
            throw new Error('Erro ao salvar no servidor');
        }
    } catch (error) {
        console.error('Erro na submissão:', error);
        alert('Ocorreu um erro ao salvar suas respostas. Verifique se o servidor está rodando.');
        finishBtn.disabled = false;
        finishBtn.innerText = 'Finalizar e Enviar';
    }
}

