document.addEventListener("DOMContentLoaded", () => {
    const musicList = document.getElementById("music-list");

    // Exemplo de lista de músicas
    const musicas = [
        { nome: "C418 - Beginning", arquivo: "minecraft" },
        { nome: "UNDEAD CORPORATION - Everything Will Freeze", arquivo: "everything_will_freeze"},
        { nome: "rejection - Night Walk", arquivo: "night_walk"},
        { nome: "Linkin Park - In Pieces", arquivo: "in_pieces"},
    ];

    // Carrega as músicas na lista
    musicas.forEach(musica => {
        const listItem = document.createElement("li");
        listItem.textContent = musica.nome;
        listItem.addEventListener("click", () => {
            window.location.href = `game.html?music=${musica.arquivo}`;
        });
        musicList.appendChild(listItem);
    });
});
