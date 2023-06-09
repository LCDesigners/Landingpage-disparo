const mysql = require('mysql');
const { google } = require('googleapis');
const keys = require('./notion-388015-d1fc19332dc3.json');

// Função para buscar e inserir dados
function fetchAndInsertData() {
  // Configurar as credenciais
  const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  // Autenticar e fazer a chamada à API
  client.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      return;
    }
    console.log('Conexão bem-sucedida!');

    // Exemplo de leitura de dados da planilha
    const sheets = google.sheets({ version: 'v4', auth: client });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: '1KSAZmOCuq67STUQ8--y2a6uP3dIE0t-cjBpcok1la6I',
        range: 'Pessoas!A6:D6',
      },
      (err, res) => {
        if (err) {
          console.log(err);
          return;
        }

        const data = res.data.values.map((row) => {
          const property_empresa = row[2].replace(/[\[\]"]/g, ''); // Índice 2 representa a coluna "property_empresa"

          // Retornar uma nova array com os valores atualizados
          return [...row.slice(0, 2), property_empresa, row[3]];
        });

        // Configurar a conexão com o servidor MySQL
        const connection = mysql.createConnection({
          host: 'db4free.net',
          user: 'pepesolucionati',
          password: 'pepesolucionati',
          database: 'pepesolucionati',
        });

        // Conectar ao servidor MySQL
        connection.connect((err) => {
          if (err) {
            console.error('Erro ao conectar ao servidor MySQL:', err);
            return;
          }

          console.log('Conexão ao servidor MySQL estabelecida com sucesso!');

          // Inserir os dados na tabela do MySQL
          const query = 'INSERT INTO notion (id, name, property_empresa, property_whatsapp) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name), property_empresa = VALUES(property_empresa), property_whatsapp = VALUES(property_whatsapp)';
          connection.query(query, [data], (err, results) => {
            if (err) {
              console.error('Erro ao inserir/atualizar dados no MySQL:', err);
            } else {
              console.log('Dados inseridos/atualizados no MySQL com sucesso!');
            }

            // Fechar a conexão com o servidor MySQL
            connection.end();
          });
        });
      }
    );
  });
}

// Executar a função inicialmente
fetchAndInsertData();

// Executar a função a cada 3 minutos
setInterval(fetchAndInsertData, 3 * 60 * 1000);
