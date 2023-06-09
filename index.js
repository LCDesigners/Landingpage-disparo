const venom = require('venom-bot');

// Array com os nomes dos arquivos a serem executados
const arquivos = ['disparo-landingpages.js', 'disparo-lembretes-NOTION.js'];

// Função para executar um arquivo usando a biblioteca venom-bot
function executarArquivo(nomeArquivo) {
  return new Promise((resolve, reject) => {
    venom.create(nomeArquivo)
      .then((client) => {
        // Faça o que deseja com o client, como enviar mensagens, etc.
        console.log(`Arquivo ${nomeArquivo} executado com sucesso.`);
        resolve();
      })
      .catch((err) => {
        console.log(`Erro ao executar o arquivo ${nomeArquivo}: ${err}`);
        reject(err);
      });
  });
}

// Array para armazenar as Promises de execução dos arquivos
const promises = [];

// Executa todos os arquivos simultaneamente
arquivos.forEach((arquivo) => {
  promises.push(executarArquivo(arquivo));
});

// Executa todas as Promises e espera que todas sejam concluídas
Promise.all(promises)
  .then(() => {
    console.log('Todos os arquivos foram executados com sucesso.');
  })
  .catch((err) => {
    console.log(`Erro ao executar os arquivos: ${err}`);
  });
