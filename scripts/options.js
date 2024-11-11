document.addEventListener("DOMContentLoaded", () => {
    const volumeControl = document.getElementById("volumeControl");
    const volumePercentage = document.getElementById("volumePercentage");
    const hiddenModeToggle = document.getElementById("hiddenModeToggle");


    // Atualiza a porcentagem ao lado da barra de volume
    volumeControl.addEventListener("input", () => {
        localStorage.setItem("volume", volumeControl.value);
        volumePercentage.textContent = `${Math.round(volumeControl.value * 100)}%`; // Atualiza a porcentagem
    });

    // Carregar volume salvo ao abrir a página
    const savedVolume = localStorage.getItem("volume");
    if (savedVolume !== null) {
        volumeControl.value = savedVolume;
        volumePercentage.textContent = `${Math.round(savedVolume * 100)}%`; // Exibe a porcentagem salva
    }

    // Carrega se a opção do hidden mode está ativa ou não
    const savedHiddenMode = localStorage.getItem("hiddenMode") === "true";
    hiddenModeToggle.checked = savedHiddenMode;

    hiddenModeToggle.addEventListener("change", () => {
        localStorage.setItem("hiddenMode", hiddenModeToggle.checked);
    });

    document.getElementById('noteColor').addEventListener('change', function(event) {
        document.documentElement.style.setProperty('--note-color', event.target.value);
        localStorage.setItem('noteColor', event.target.value);  // Salva a cor no localStorage
    });
    
    document.getElementById('lineColor').addEventListener('change', function(event) {
        document.documentElement.style.setProperty('--hit-line-color', event.target.value);
        localStorage.setItem('lineColor', event.target.value);  // Salva a cor no localStorage
    });
    
    document.getElementById('scoreColor').addEventListener('change', function(event) {
        document.documentElement.style.setProperty('--score-color', event.target.value);
        localStorage.setItem('scoreColor', event.target.value);  // Salva a cor no localStorage
    });
    
    document.getElementById('comboColor').addEventListener('change', function(event) {
        document.documentElement.style.setProperty('--combo-color', event.target.value);
        localStorage.setItem('comboColor', event.target.value);  // Salva a cor no localStorage
    });
    
    document.getElementById('accuracyColor').addEventListener('change', function(event) {
        document.documentElement.style.setProperty('--accuracy-color', event.target.value);
        localStorage.setItem('accuracyColor', event.target.value);  // Salva a cor no localStorage
    });
    
    // Carregar as cores salvas ao inicializar a página
    window.addEventListener('load', function() {
        const savedNoteColor = localStorage.getItem('noteColor');
        const savedLineColor = localStorage.getItem('lineColor');
        const savedScoreColor = localStorage.getItem('scoreColor');
        const savedComboColor = localStorage.getItem('comboColor');
        const savedAccuracyColor = localStorage.getItem('accuracyColor');
        
        if (savedNoteColor) {
            document.documentElement.style.setProperty('--note-color', savedNoteColor);
            document.getElementById('noteColor').value = savedNoteColor;
        }
        if (savedLineColor) {
            document.documentElement.style.setProperty('--hit-line-color', savedLineColor);
            document.getElementById('lineColor').value = savedLineColor;
        }
        if (savedScoreColor) {
            document.documentElement.style.setProperty('--score-color', savedScoreColor);
            document.getElementById('scoreColor').value = savedScoreColor;
        }
        if (savedComboColor) {
            document.documentElement.style.setProperty('--combo-color', savedComboColor);
            document.getElementById('comboColor').value = savedComboColor;
        }
        if (savedAccuracyColor) {
            document.documentElement.style.setProperty('--accuracy-color', savedAccuracyColor);
            document.getElementById('accuracyColor').value = savedAccuracyColor;
        }
    });

    document.getElementById("saveButton").addEventListener("click", () => {
        window.location.href = "index.html";
    });
});