document.getElementById('processImage').addEventListener('click', () => {
    const fileInput = document.getElementById('imageUpload');
    const output = document.getElementById('output');
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');

    if (!fileInput.files[0]) {
        alert('Por favor, selecione uma imagem.');
        return;
    }

    const file = fileInput.files[0];
    const img = new Image();

    img.onload = () => {
        // Define as dimensões do canvas iguais à da imagem
        canvas.width = img.width;
        canvas.height = img.height;

        // Desenha a imagem no canvas
        ctx.drawImage(img, 0, 0);

        // Usa o Tesseract.js para extrair o texto da imagem, incluindo posições e estilos
        Tesseract.recognize(canvas, 'eng', {
            logger: (info) => console.log(info), // Log para depuração
        }).then(({ data: { words } }) => {
            renderTextWithStyles(words, ctx, output); // Renderiza texto com estilos
        }).catch((err) => {
            console.error(err);
            alert('Erro ao processar a imagem.');
        });
    };

    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

/**
 * Renderiza o texto com as posições, tamanhos e cores originais
 * @param {Array} words - Palavras extraídas pelo Tesseract.js com metadados
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas para análise de cores
 * @param {HTMLElement} output - Elemento onde o texto será exibido
 */
function renderTextWithStyles(words, ctx, output) {
    output.innerHTML = ''; // Limpa o conteúdo atual

    words.forEach((word) => {
        const { text, bbox } = word; // Caixa delimitadora e texto da palavra
        const { x0, y0, x1, y1 } = bbox; // Coordenadas da palavra

        // Calcula o tamanho da fonte
        const fontSize = y1 - y0;

        // Captura a cor média da área do texto no canvas
        const imageData = ctx.getImageData(x0, y0, x1 - x0, y1 - y0);
        const avgColor = getAverageColor(imageData);

        // Cria um elemento <span> para cada palavra
        const span = document.createElement('span');
        span.textContent = text;
        span.style.position = 'absolute';
        span.style.left = `${x0}px`;
        span.style.top = `${y0}px`;
        span.style.fontSize = `${fontSize}px`;
        span.style.color = avgColor;
        span.style.fontFamily = 'Arial, sans-serif';

        // Adiciona o <span> ao container de saída
        output.appendChild(span);
    });
}

/**
 * Calcula a cor média de uma área da imagem
 * @param {ImageData} imageData - Dados da imagem do canvas
 * @returns {string} - Cor média em formato RGB
 */
function getAverageColor(imageData) {
    let r = 0, g = 0, b = 0;
    const length = imageData.data.length / 4;

    for (let i = 0; i < imageData.data.length; i += 4) {
        r += imageData.data[i];     // Red
        g += imageData.data[i + 1]; // Green
        b += imageData.data[i + 2]; // Blue
    }

    r = Math.floor(r / length);
    g = Math.floor(g / length);
    b = Math.floor(b / length);

    return `rgb(${r}, ${g}, ${b})`;
}
// Função para aplicar a animação de digitação no texto
function typeTextWithAnimation(text, elementId, delay = 100) {
    const output = document.getElementById(elementId);
    output.textContent = ''; // Limpa o conteúdo anterior

    let index = 0;
    let typingInterval = setInterval(() => {
        if (index < text.length) {
            // Adiciona um caractere ao conteúdo do output
            output.textContent += text[index];
            index++;
        } else {
            clearInterval(typingInterval); // Para a animação quando o texto for todo exibido
        }
    }, delay);
}

// Função que extrai o texto da imagem (supondo que você já tenha feito isso)
function handleImageTextExtraction(imageText) {
    // Aqui podemos chamar a função de animação de digitação com o texto extraído
    typeTextWithAnimation(imageText, 'output');
}

// Teste da função com um exemplo de texto
const extractedText = "Este é o texto extraído da imagem!"; // Texto extraído da imagem
handleImageTextExtraction(extractedText);
