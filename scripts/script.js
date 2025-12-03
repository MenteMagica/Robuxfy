// --- 1. LÓGICA PARA O SLIDE DESKTOP ---

const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const authFeedback = document.getElementById('authFeedback');
const signUpForm = document.getElementById('signUpForm');
const signInForm = document.getElementById('signInForm');
const signUpNickname = document.getElementById('signUpNickname');
const signUpEmail = document.getElementById('signUpEmail');
const signUpBirthdate = document.getElementById('signUpBirthdate');
const signInEmail = document.getElementById('signInEmail');
const rememberMeCheckbox = document.getElementById('rememberMe');

// Adiciona a classe 'active' quando o botão 'Sign Up' (registrar) é clicado
if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        container.classList.add('active');
    });
}

// Remove a classe 'active' quando o botão 'Sign In' (login) é clicado
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        container.classList.remove('active');
    });
}


// --- 2. LÓGICA PARA O TOGGLE MOBILE ---
// (Adicionados novos seletores para os botões mobile)

const registerMobileBtn = document.getElementById('registerMobile');
const loginMobileBtn = document.getElementById('loginMobile');

// O 'e.preventDefault()' impede a página de rolar para o topo
// quando o link '#' é clicado.

if (registerMobileBtn) {
    registerMobileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        container.classList.add('active');
    });
}

if (loginMobileBtn) {
    loginMobileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        container.classList.remove('active');
    });
}


// --- 3. CÓDIGO REUTILIZÁVEL PARA "MOSTRAR SENHA" ---
// (Seu código original, que já estava ótimo!)

/**
 * Função que ativa o botão de "mostrar/ocultar" senha para um campo.
 * @param {string} toggleId - O ID do ícone (botão)
 * @param {string} passwordId - O ID do campo (input)
 */
function setupPasswordToggle(toggleId, passwordId) {
    const toggleButton = document.getElementById(toggleId);
    const passwordInput = document.getElementById(passwordId);

    // Só executa se os dois elementos existirem
    if (toggleButton && passwordInput) {
        toggleButton.addEventListener('click', () => {
            
            // Verifica o tipo atual e define o novo tipo
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Alterna as classes do ícone (olho aberto/fechado)
            toggleButton.classList.toggle('fa-eye');
            toggleButton.classList.toggle('fa-eye-slash');
        });
    } else {
        // Isso ajuda a depurar se os IDs estiverem errados
        console.warn("Não foi possível encontrar o botão ou o input da senha:", toggleId, passwordId);
    }
}

// Chamamos a função para ambos os formulários:
setupPasswordToggle('togglePassword', 'signInPassword');
setupPasswordToggle('toggleSignUpPassword', 'signUpPassword');

function setAuthFeedback(message, variant = 'info') {
    if (!authFeedback) return;
    authFeedback.textContent = message;
    authFeedback.dataset.variant = variant;
}

async function handleSignUp(event) {
    event.preventDefault();
    if (!window.apiClient) return;

    const passwordInput = document.getElementById('signUpPassword');

    try {
        setAuthFeedback('Creating your account...', 'info');
        await window.apiClient.registerUser({
            username: signUpNickname.value.trim(),
            email: signUpEmail.value.trim(),
            password: passwordInput.value,
            dateOfBirth: signUpBirthdate.value,
        });

        setAuthFeedback('Account created! You can sign in now.', 'success');
        container.classList.remove('active');
        passwordInput.value = '';
    } catch (error) {
        setAuthFeedback(`Sign up failed: ${error.message}`, 'error');
        console.error('Sign up failed', error);
    }
}

async function handleSignIn(event) {
    event.preventDefault();
    if (!window.apiClient) return;

    const passwordInput = document.getElementById('signInPassword');

    try {
        setAuthFeedback('Signing you in...', 'info');
        const result = await window.apiClient.loginUser({
            email: signInEmail.value.trim(),
            password: passwordInput.value,
        });

        if (result?.token) {
            const storage = rememberMeCheckbox?.checked ? localStorage : sessionStorage;
            storage.setItem('robuxfyToken', result.token);
        }

        setAuthFeedback('Login successful! Redirecting to home...', 'success');
        window.location.href = './home.html';
    } catch (error) {
        setAuthFeedback(`Login failed: ${error.message}`, 'error');
        console.error('Login failed', error);
    }
}

if (signUpForm) {
    signUpForm.addEventListener('submit', handleSignUp);
}

if (signInForm) {
    signInForm.addEventListener('submit', handleSignIn);
}


// --- 4. CÓDIGO PARA VALIDAR O CHECKBOX DE TERMOS ---
// (Seu código original, também ótimo!)

// 1. Seleciona os elementos
const termsCheckbox = document.getElementById('termsAgreement');
const signUpButton = document.getElementById('signUpButton');

// 2. Adiciona um "ouvinte" de evento ao checkbox
// Só executa se os dois elementos existirem
if (termsCheckbox && signUpButton) {
    
    termsCheckbox.addEventListener('change', () => {
        // Habilita/Desabilita o botão baseado no estado do checkbox
        // Se 'checked' for true, 'disabled' será false.
        // Se 'checked' for false, 'disabled' será true.
        signUpButton.disabled = !termsCheckbox.checked;
    });

} else {
    // Ajuda a depurar se os IDs estiverem errados no HTML
    console.warn("Não foi possível encontrar o checkbox de termos ou o botão de Sign Up.");
}