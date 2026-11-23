const fs = require('fs');
const path = require('path');

function paraCamelCase(str) {
    return str
        .trim()
        .split(/\s+/)
        .map((palavra, index) => {
            if (index === 0) return palavra.toLowerCase();
            return palavra.charAt(0).toLowerCase() + palavra.slice(1).toLowerCase();
        })
        .join('-');
}

// Captura tudo o que for digitado após o nome do script (funciona com ou sem aspas)
const textoEntrada = process.argv.slice(2).join(' ');

if (!textoEntrada) {
    console.error('❌ Erro: Informe o nome da adr. Ex: node create-adr.js "Minha Nova Feature"');
    process.exit(1);
}

const nomeArquivo = `${paraCamelCase(textoEntrada)}.md`;
const pastaDestino = path.join(__dirname, 'adrs');
const caminhoCompleto = path.join(pastaDestino, nomeArquivo);

// Cria a pasta "adrs" caso ela ainda não exista
if (!fs.existsSync(pastaDestino)) {
    fs.mkdirSync(pastaDestino, { recursive: true });
}

// Cria o arquivo .md com um título inicial (opcional)
const conteudoInicial = `# ${textoEntrada}\n\n`;
fs.writeFileSync(caminhoCompleto, conteudoInicial, 'utf8');

console.log(`✅ Arquivo criado em: adrs/${nomeArquivo}`);
