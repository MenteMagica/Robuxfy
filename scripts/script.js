// --- 1. LÓGICA PARA O SLIDE DESKTOP ---

const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

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