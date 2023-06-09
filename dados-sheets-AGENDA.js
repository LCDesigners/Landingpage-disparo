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
        range: 'Agenda!A2:E182',
      },
      (err, res) => {
        if (err) {
          console.log(err);
          return;
        }

        try {
          const data = res.data.values.map((row) => {
            if (row.length < 5) {
              // Linha vazia ou dados incompletos
              return null;
            }

            const property_status = row[2]; // Índice 2 representa a coluna "property_status"
            const property_empresa = row[3].replace(/[\[\]"]/g, ''); // Índice 3 representa a coluna "property_empresa"
            const property_periodo = formatarDataHora(row[4]); // Índice 4 representa a coluna "property_periodo"

            if (!property_status || !property_empresa || !property_periodo) {
              // Dados incorretos ou faltando
              return null;
            }

            // Mapear os valores para um novo array com a property_empresa, property_periodo e property_status formatados
            return [...row.slice(0, 2), property_empresa, property_periodo, property_status];
          });

          // Filtrar linhas inválidas
          const validData = data.filter((row) => row !== null);

          if (validData.length === 0) {
            // Não há dados válidos na planilha
            console.log('Não há dados válidos na planilha.');
            return;
          }

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

            // Inserir ou atualizar os dados na tabela do MySQL
            const query =
              'INSERT INTO agendamento_notion (id, name, property_empresa, property_periodo, property_status) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name), property_empresa = VALUES(property_empresa), property_periodo = VALUES(property_periodo), property_status = VALUES(property_status)';
            connection.query(query, [validData], (err, results) => {
              if (err) {
                console.error('Erro ao inserir/atualizar dados no MySQL:', err);
              } else {
                console.log('Dados inseridos/atualizados no MySQL com sucesso!');
              }

              // Fechar a conexão com o servidor MySQL
              connection.end();
            });
          });
        } catch (error) {
          console.error('Erro durante o processamento dos dados:', error);
        }
      }
    );
  });
}

// Função para formatar a data e hora
const formatarDataHora = (data) => {
  const periodo = JSON.parse(data);
  const start = new Date(periodo.start);

  // Obter a data e hora no fuso horário local
  const localStart = new Date(start.getTime() - start.getTimezoneOffset() * 60000);

  // Formatar a data e hora no padrão YYYY-MM-DD HH:MM:SS
  const formattedDateTime = localStart.toISOString().slice(0, 19).replace('T', ' ');

  return formattedDateTime;
}

// Executar a função inicialmente
fetchAndInsertData();

// Executar a função a cada 3 minutos
setInterval(fetchAndInsertData, 3 * 60 * 1000);
