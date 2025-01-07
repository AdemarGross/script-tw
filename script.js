// Verifica a URL atual e redireciona para a aba correta, se necessário
(function verifyURL() {
    const currentURL = window.location.href;
    const expectedURL = "&screen=ally&mode=members";
    const excludedURL = "&screen=ally&mode=members_troops";

    if (!currentURL.includes(expectedURL) || currentURL.includes(excludedURL)) {
        const newURL = game_data.link_base_pure + "ally&mode=members";
        window.location.assign(newURL);
    }
})();

// Carrega configurações do localStorage ou define padrões
function loadSettings(key, defaultValue) {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        return JSON.parse(storedValue);
    } else {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
    }
}

// Salva configurações no localStorage
function saveSettings(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Inicializa configurações padrão
const defaultSettings = [
    { id: 0, label: "Incluir pontos", active: true },
    { id: 1, label: "Incluir vilas", active: true },
    { id: 2, label: "Incluir última atividade", active: true }
];
const settings = loadSettings("settingsTribeMembers", defaultSettings);

// Adiciona estilos personalizados ao documento
function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .progress-bar {
            width: 100%;
            background-color: #ddd;
        }
        .progress-bar-inner {
            width: 0%;
            height: 20px;
            background-color: #4caf50;
            text-align: center;
            line-height: 20px;
            color: white;
        }
    `;
    document.head.appendChild(style);
}

// Cria barra de progresso no DOM
function createProgressBar(container) {
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";

    const progressBarInner = document.createElement("div");
    progressBarInner.className = "progress-bar-inner";

    progressBar.appendChild(progressBarInner);
    container.appendChild(progressBar);

    return progressBarInner;
}

// Atualiza a barra de progresso
function updateProgressBar(progressBarInner, percentage) {
    progressBarInner.style.width = `${percentage}%`;
    progressBarInner.textContent = `${percentage}%`;
}

// Coleta dados dos jogadores
function collectPlayerData(baseURL) {
    const playerURLs = [];
    const players = [];

    $('input:radio[name=player]').each(function () {
        const playerID = $(this).val();
        const playerName = $(this).parent().text().trim();

        playerURLs.push(`${baseURL}${playerID}`);
        players.push({ id: playerID, name: playerName });
    });

    return { playerURLs, players };
}

// Faz múltiplas requisições assíncronas
async function fetchAll(urls) {
    const responses = [];

    for (const url of urls) {
        try {
            const response = await $.get(url);
            responses.push(response);
        } catch (error) {
            console.error(`Erro ao buscar URL: ${url}`, error);
            responses.push(null); // Adiciona um valor nulo para a URL com erro
        }
    }

    return responses;
}

// Exemplo de uso principal
(async function main() {
    injectStyles();

    const container = document.querySelector("#contentContainer");
    if (!container) {
        console.error("Elemento #contentContainer não encontrado.");
        return;
    }

    const progressBarInner = createProgressBar(container);

    const baseURL = "https://example.com/player?id="; // Substitua pela URL real
    const { playerURLs, players } = collectPlayerData(baseURL);

    const totalPlayers = playerURLs.length;
    if (totalPlayers === 0) {
        console.error("Nenhum jogador encontrado.");
        return;
    }

    const responses = await fetchAll(playerURLs);

    responses.forEach((data, index) => {
        const percentage = Math.round(((index + 1) / totalPlayers) * 100);
        updateProgressBar(progressBarInner, percentage);

        if (data) {
            console.log(`Dados do jogador ${players[index].name}:`, data);
        } else {
            console.log(`Erro ao coletar dados do jogador ${players[index].name}.`);
        }
    });

    console.log("Coleta de dados concluída.");
})();
