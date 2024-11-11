// Constantes para pontuação, precisão e combo
const scoreDisplay = document.getElementById('score');
const precisaoDisplay = document.getElementById('precisao');
const hiddenModeEnabled = localStorage.getItem("hiddenMode") === "true";
const comboDisplay = document.getElementById('combo');

// Variáveis gerais para as funcionalidades do jogo
let score = 0;
let notaTotal = 0;
let notaErrada = 0;
let notaAcertada = 0;
let audio;
let notesData = [];
let notesCreated = new Set();
let animationDuration = 1.0;
let startTime;
let combo = 0;
let highestCombo = 0;

window.addEventListener('load', function() {
    // Carregar os atributos salvos no localStorage
    const savedNoteColor = localStorage.getItem('noteColor');
    const savedLineColor = localStorage.getItem('lineColor');
    const savedScoreColor = localStorage.getItem('scoreColor');
    const savedComboColor = localStorage.getItem('comboColor');
    const savedAccuracyColor = localStorage.getItem('accuracyColor');
    
    // Aplicar as cores salvas, se existirem
    if (savedNoteColor) {
        document.documentElement.style.setProperty('--note-color', savedNoteColor);
    }
    if (savedLineColor) {
        document.documentElement.style.setProperty('--hit-line-color', savedLineColor);
    }
    if (savedScoreColor) {
        document.documentElement.style.setProperty('--score-color', savedScoreColor);
    }
    if (savedComboColor) {
        document.documentElement.style.setProperty('--combo-color', savedComboColor);
    }
    if (savedAccuracyColor) {
        document.documentElement.style.setProperty('--accuracy-color', savedAccuracyColor);
    }
});

function processNotes(data) {
    notesData = [];
    const lines = data.split('\n');

    // Obtém as dimensões da área de jogo e da linha de acerto para o cálculo do tempo de aparição
    const gameAreaHeight = document.getElementById('game').offsetHeight;
    const hitBarPosition = document.getElementById('line').offsetTop;

    // Calcula o ajuste de tempo com base na posição da linha de acerto e na altura da área de jogo
    const appearTimeAdjustment = animationDuration * (hitBarPosition / gameAreaHeight);

    // Processa as linhas do arquivo de notas
    lines.forEach((line, index) => {
        if (index === 0) { 
            const parts = line.trim().split(' ');
            if (parts.length === 2 && parts[0] === "animation_duration") {
                animationDuration = parseFloat(parts[1]);
                document.documentElement.style.setProperty('--animation-duration', `${animationDuration}s`);
            }
        } else if (index === 1) {
            const notes = line.trim().split(',').flatMap(noteGroup => {
                const [time, keys] = noteGroup.trim().split(' ');
                const timeFloat = parseFloat(time);
                if (isNaN(timeFloat)) return [];

                // Para cada tecla, ajusta o tempo de aparecimento considerando a altura da área de jogo
                const adjustedTime = timeFloat - appearTimeAdjustment;

                // Adiciona a nota com o tempo ajustado
                return keys.split(';').map(key => ({
                    time: adjustedTime,
                    key: key.trim()
                }));
            });
            notesData.push(...notes);
        }
    });
    notaTotal = notesData.length;
    scheduleNotes();
}

// Função para agendar as notas
function scheduleNotes() {
    notesData.forEach(note => {
        const delay = (note.time * 1000) - (Date.now() - startTime);
        if (delay > 0 && !notesCreated.has(note.key + note.time)) {
            setTimeout(() => {
                createNoteOnScreen(note.key);
                notesCreated.add(note.key + note.time);
            }, delay);
        }
    });
}

const urlParams = new URLSearchParams(window.location.search);
const musica = urlParams.get('music');
if (musica) {
    startGame(musica); // Chama a função com o arquivo da música
}

function loadSyncFile(nomeArquivo) {
    fetch(`./assets/noteFiles/${nomeArquivo}.txt`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar arquivo:' , `${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            processNotes(data);
        })
        .catch(error => {
            console.error("Erro ao carregar o arquivo de notas:", error);
        });
}

// Função para iniciar a música e sincronizar notas com atraso inicial
function startGame(musica) {
    let countdown = 3;
    const countdownDisplay = document.getElementById('countdown');
    countdownDisplay.textContent = countdown;

    const anticipationTime = animationDuration * 0.8; // Ajusta a antecipação com base na duração da animação

    const countdownInterval = setInterval(() => {
        countdown--;
        countdownDisplay.textContent = countdown;
        if (countdown === 0) {
            clearInterval(countdownInterval);
            countdownDisplay.style.display = 'none'; // Oculta a contagem regressiva

            loadSyncFile(musica);
            audio = new Audio(`./assets/sounds/${musica}.mp3`);

            const savedVolume = localStorage.getItem("volume");
            audio.volume = savedVolume !== null ? savedVolume : 0.5;

            // Define o tempo de início um pouco antes de zero
            audio.currentTime = -anticipationTime;

            audio.addEventListener('canplaythrough', () => {
                const lastNoteTime = notesData[notesData.length - 1]?.time || 0;
                const finalTime = Math.min(audio.duration, lastNoteTime + animationDuration);

                // Adiciona um ouvinte para iniciar a música exatamente no tempo zero
                const startPlaybackInterval = setInterval(() => {
                    if (audio.currentTime >= 0) {
                        clearInterval(startPlaybackInterval);
                        audio.play().catch(error => {
                            console.error("Erro ao reproduzir o áudio:", error);
                        });
                    }
                }, 10); // Checa a cada 10ms para iniciar exatamente no tempo zero

                startTime = Date.now();

                const progressInterval = setInterval(() => {
                    updateProgressBar(audio, finalTime);

                    if (audio.currentTime >= finalTime) {
                        clearInterval(progressInterval);
                        showPerformanceScreen();
                    }
                }, 100);

                scheduleNotes();
            });
        }
    }, 1000);
}

// Função para criar uma nota na tela
function createNoteElement(key) {
    const note = document.createElement('div');
    note.classList.add('note');
    note.dataset.key = key;

    // Mapeia a posição das teclas na tela
    const positions = {
        'D': '4%',
        'F': '29%',
        'J': '54%',
        'K': '79%',
    };

    if (positions[key]) {
        note.style.left = positions[key]; // Posiciona a nota na linha correta
    }

    document.getElementById('game').appendChild(note);
    return note;
}

function animateNote(note) {
    note.style.transition = `bottom ${animationDuration}s linear`;

    setTimeout(() => {
        note.style.bottom = '0';
    }, 100);

    setTimeout(() => {
        if (note.parentNode) {
            note.remove();
            notaErrada++;
            updatePrecisao();
            combo = 0;
            updateCombo();
        }
    }, animationDuration * 1100);
}



// Função para criar e animar a nota na tela
function createNoteOnScreen(key) {
    const note = createNoteElement(key);
    if (note) {
        if (hiddenModeEnabled) {
            note.classList.add("hidden-mode");
        }
        animateNote(note);
    }
}

// Atualiza a pontuação
function updateScore() {
    let adjustedScore = Math.floor(score * (hiddenModeEnabled ? 1.1 : 1));
    scoreDisplay.textContent = `Pontuação: ${adjustedScore}`;
}


// Atualiza a precisão
function updatePrecisao() {
    const totalVerificado = notaAcertada + notaErrada;
    const precisao = totalVerificado > 0 ? (notaAcertada / totalVerificado) * 100 : 0;
    precisaoDisplay.textContent = `Precisão: ${precisao.toFixed(2)}%`;
}

// Função para atualizar o combo
function updateCombo() {
    const totalVerificado = notaAcertada + notaErrada;
    if (totalVerificado > 0) {
        if (combo > highestCombo) {
            highestCombo = combo;
        }
    } else {
        combo = 0;
    }

    comboDisplay.textContent = `Combo: ${combo} / Maior Combo: ${highestCombo}`;
}

// Atualiza a barra de progresso
function updateProgressBar(audio, finalTime) {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;

    const progress = (audio.currentTime / finalTime) * 100;
    progressBar.style.width = `${progress}%`;
}

// Função para lidar com a remoção de notas ao pressionar a tecla
function removeNoteByKey(key) {
    // Encontra a nota correspondente à tecla pressionada
    const note = document.querySelector(`.note[data-key='${key}']`);

    if (!note) return;

    // Verifica a posição da nota e da linha de acerto
    const line = document.getElementById('line');
    const noteRect = note.getBoundingClientRect();
    const lineRect = line.getBoundingClientRect();

    // Se a nota estiver dentro da linha de acerto
    if (
        noteRect.bottom >= lineRect.top &&
        noteRect.top <= lineRect.bottom &&
        noteRect.left >= lineRect.left &&
        noteRect.right <= lineRect.right
    ) {
        score += 10;
        notaAcertada++;
        updateScore();
        updatePrecisao();
        combo++;
        updateCombo();
    } else {
        notaErrada++;
        updatePrecisao();
        combo = 0;
        updateCombo();
    }
    note.remove();
}

// Evento para capturar a tecla pressionada
document.addEventListener('keydown', (event) => {
    const key = event.key.toUpperCase(); // Converte para maiúsculas
    removeNoteByKey(key);
});

// Função para reiniciar o jogo
function restartGame() {
    score = 0;
    notaAcertada = 0;
    notaErrada = 0;
    notesCreated.clear();
    updateScore();
    updatePrecisao();
    const notes = document.querySelectorAll('.note');
    notes.forEach(note => note.remove());
}

function showPerformanceScreen() {
    console.log("Exibindo tela de desempenho...");

    const performanceScreen = document.getElementById('performanceScreen');
    const finalScoreDisplay = document.getElementById('finalScore');
    const finalPrecisionDisplay = document.getElementById('finalPrecision');
    const maxComboDisplay = document.getElementById('maxCombo');
    const hiddenModeDisplay = document.getElementById('hiddenModeStatus');

    // Exibe a pontuação
    finalScoreDisplay.textContent = `Pontuação: ${score}`;
    
    // Calcula a precisão
    const totalVerificado = notaAcertada + notaErrada;
    const precisao = totalVerificado > 0 ? (notaAcertada / totalVerificado) * 100 : 0;
    finalPrecisionDisplay.textContent = `Precisão: ${precisao.toFixed(2)}%`;    

    // Exibe o máximo de combo
    maxComboDisplay.textContent = `Combo Máximo: ${highestCombo}`;
    
    // Exibe se o Hidden Mode estava ativo
    hiddenModeDisplay.textContent = hiddenModeEnabled ? "Hidden mode: Ativado" : "Hidden mode: Desativado";
    
    // Exibe a tela de desempenho 
    performanceScreen.classList.remove('hidden');
}