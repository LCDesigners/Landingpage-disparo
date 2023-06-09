const venom = require('venom-bot');
const mysql = require('mysql');
const moment = require('moment-timezone');

let connection;

function connectToDatabase() {
  connection = mysql.createConnection({
    host: 'db4free.net',
    user: 'pepesolucionati',
    password: 'pepesolucionati',
    database: 'pepesolucionati',
  });

  connection.connect((error) => {
    if (error) {
      console.error('Erro ao conectar ao banco de dados:', error);
      setTimeout(connectToDatabase, 2000); // Tentar reconectar após 2 segundos
      return;
    }
    console.log('Conexão com o banco de dados estabelecida com sucesso!');

    startMessageSending();
  });

  connection.on('error', (error) => {
    console.error('Erro na conexão com o banco de dados:', error);
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      connectToDatabase(); // Reconectar caso a conexão seja perdida
    } else {
      throw error;
    }
  });
}

function startMessageSending() {
  venom
    .create()
    .then((client) => {
      setInterval(() => {
        const currentDate = moment().tz('America/Sao_Paulo').subtract(-1, 'day').format('YYYY-MM-DD HH:mm:ss');
        const twoMinutesAgo = moment().tz('America/Sao_Paulo').subtract(-20, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        const Menos3dias = moment().tz('America/Sao_Paulo').subtract(-2, 'day').format('YYYY-MM-DD HH:mm:ss');
        const Menos5dias = moment().tz('America/Sao_Paulo').subtract(-4, 'day').format('YYYY-MM-DD HH:mm:ss');

        const currentQuery = `SELECT * FROM agendamento_notion WHERE property_status = 'AGENDADO' AND property_periodo = '${currentDate}'`;
        const twoMinutesAgoQuery = `SELECT * FROM agendamento_notion WHERE property_status = 'AGENDADO' AND property_periodo = '${twoMinutesAgo}'`;

        const Menos3diasQuery = `SELECT * FROM agendamento_notion WHERE property_status = 'LEMBRETE' AND property_periodo = '${Menos3dias}'`;

        const Menos5diasQuery = `SELECT * FROM agendamento_notion WHERE property_status = 'LEMBRETE' AND property_periodo = '${Menos5dias}'`;


        //// - 1 dia
        connection.query(currentQuery, (error, currentResults) => {
          if (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            return;
          }

          if (currentResults.length === 0) {
            console.log('NÃO ENCONTRADO PARA 1 DIA ANTES', currentDate);
            return;
          }

          currentResults.forEach((currentRow) => {
            const id_empresa = currentRow.property_empresa;
            const data_hora = currentRow.property_periodo;
            const titulo = currentRow.name;

            // Realize a consulta na tabela "notion" utilizando o id_empresa
            const query = `SELECT * FROM notion WHERE property_empresa = '${id_empresa}'`;

            connection.query(query, (error, results) => {
              if (error) {
                console.error('Erro ao consultar o banco de dados:', error);
                return;
              }

              // Processar os resultados da consulta
              results.forEach((row) => {
                const destinatario = row.property_whatsapp;
                const nome_contato = row.name;

                // Realize as ações desejadas com o destinatário obtido
                console.log('Destinatário encontrado:', destinatario);

                // Formate a data e hora
                const data_hora_formatada = moment(data_hora).format('DD/MM/YYYY [às] HH:mm');

                // Envie a mensagem para o destinatário
                const phoneNumber = destinatario + '@c.us';
                const message = `✅ *Olá ${nome_contato}!* 🔥
                \nEspero que esteja bem. Gostaria de lembrá-lo do nosso agendamento *${titulo}*.\n\n🗓️Data: *${data_hora_formatada}.*`;

                client
                  .sendText(phoneNumber, message)
                  .then((result) => {
                    if (result.fromMe) {
                      console.log('Mensagem de texto enviada com sucesso para', phoneNumber);
                    }
                  })
                  .catch((error) => console.error('Erro ao enviar a mensagem para', phoneNumber, ':', error));
              });
            });
          });
        });

        /////// -20 minutos
        connection.query(twoMinutesAgoQuery, (error, twoMinutesAgoResults) => {
          if (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            return;
          }

          if (twoMinutesAgoResults.length === 0) {
            console.log('NÃO ENCONTRADO PARA 20 MINUTOS', twoMinutesAgo);
            return;
          }

          twoMinutesAgoResults.forEach((twoMinutesAgoRow) => {
            const id_empresa = twoMinutesAgoRow.property_empresa;
            const data_hora = twoMinutesAgoRow.property_periodo;
            const titulo = twoMinutesAgoRow.name;


            // Realize a consulta na tabela "notion" utilizando o id_empresa
            const query = `SELECT * FROM notion WHERE property_empresa = '${id_empresa}'`;

            connection.query(query, (error, results) => {
              if (error) {
                console.error('Erro ao consultar o banco de dados:', error);
                return;
              }

              // Processar os resultados da consulta
              results.forEach((row) => {
                const destinatario = row.property_whatsapp;
                const nome_contato = row.name;

                // Realize as ações desejadas com o destinatário obtido
                console.log('Destinatário encontrado:', destinatario);

                // Formate a data e hora
                const data_hora_formatada = moment(data_hora).format('DD/MM/YYYY [às] HH:mm');

                // Envie a mensagem para o destinatário
                const phoneNumber = destinatario + '@c.us';
                const message = `✅ *Olá ${nome_contato}!* 🔥
                \nEspero que esteja bem. Gostaria de lembrá-lo do nosso agendamento *${titulo}*.\n\n🗓️Data: *${data_hora_formatada}.*`;

                client
                  .sendText(phoneNumber, message)
                  .then((result) => {
                    if (result.fromMe) {
                      console.log('Segunda mensagem de texto enviada com sucesso para', phoneNumber);
                    }
                  })
                  .catch((error) => console.error('Erro ao enviar a segunda mensagem de texto para', phoneNumber, ':', error));
              });
            });
          });
        });

        /////// -3 dias
        connection.query(Menos3diasQuery, (error, Menos3diasResults) => {
          if (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            return;
          }

          if (Menos3diasResults.length === 0) {
            console.log('NÃO ENCONTRADO -2 DIAS', Menos3dias);
            return;
          }

          Menos3diasResults.forEach((Menos3diasRow) => {
            const id_empresa = Menos3diasRow.property_empresa;
            const data_hora = Menos3diasRow.property_periodo;
            const titulo = Menos3diasRow.name;


            // Realize a consulta na tabela "notion" utilizando o id_empresa
            const query = `SELECT * FROM notion WHERE property_empresa = '${id_empresa}'`;

            connection.query(query, (error, results) => {
              if (error) {
                console.error('Erro ao consultar o banco de dados:', error);
                return;
              }

              // Processar os resultados da consulta
              results.forEach((row) => {
                const destinatario = row.property_whatsapp;
                const nome_contato = row.name;

                // Realize as ações desejadas com o destinatário obtido
                console.log('Destinatário encontrado:', destinatario);

                // Formate a data e hora
                const data_hora_formatada = moment(data_hora).format('DD/MM/YYYY [às] HH:mm');

                // Envie a mensagem para o destinatário
                const phoneNumber = destinatario + '@c.us';
                const message = `💡 *Olá ${nome_contato}!* 👊🏻
                \n✅Faltam *2 dias* para o nosso compromisso! Gostaria de lembrá-lo de fazer *${titulo}*, que será entregue dia *${data_hora_formatada}.* 🔥`;

                client
                  .sendText(phoneNumber, message)
                  .then((result) => {
                    if (result.fromMe) {
                      console.log('Segunda mensagem de texto enviada com sucesso para', phoneNumber);
                    }
                  })
                  .catch((error) => console.error('Erro ao enviar a segunda mensagem de texto para', phoneNumber, ':', error));
              });
            });
          });
        });


        /////// -5 dias
        connection.query(Menos5diasQuery, (error, Menos5diasResults) => {
          if (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            return;
          }

          if (Menos5diasResults.length === 0) {
            console.log('NÃO ENCONTRADO -4 DIAS', Menos5dias);
            return;
          }

          Menos5diasResults.forEach((Menos5diasRow) => {
            const id_empresa = Menos5diasRow.property_empresa;
            const data_hora = Menos5diasRow.property_periodo;
            const titulo = Menos5diasRow.name;


            // Realize a consulta na tabela "notion" utilizando o id_empresa
            const query = `SELECT * FROM notion WHERE property_empresa = '${id_empresa}'`;

            connection.query(query, (error, results) => {
              if (error) {
                console.error('Erro ao consultar o banco de dados:', error);
                return;
              }

              // Processar os resultados da consulta
              results.forEach((row) => {
                const destinatario = row.property_whatsapp;
                const nome_contato = row.name;

                // Realize as ações desejadas com o destinatário obtido
                console.log('Destinatário encontrado:', destinatario);

                // Formate a data e hora
                const data_hora_formatada = moment(data_hora).format('DD/MM/YYYY [às] HH:mm');

                // Envie a mensagem para o destinatário
                const phoneNumber = destinatario + '@c.us';
                const message = `💡 *Olá ${nome_contato}!* 👊🏻
                \n✅Faltam *4 dias* para o nosso compromisso! Gostaria de lembrá-lo de fazer *${titulo}*, que será entregue dia *${data_hora_formatada}.* 🔥`;

                client
                  .sendText(phoneNumber, message)
                  .then((result) => {
                    if (result.fromMe) {
                      console.log('Segunda mensagem de texto enviada com sucesso para', phoneNumber);
                    }
                  })
                  .catch((error) => console.error('Erro ao enviar a segunda mensagem de texto para', phoneNumber, ':', error));
              });
            });
          });
        });
        
      }, 1000); // Verificar a cada 60 segundos (ajuste conforme necessário)

      // Fechar a conexão com o banco de dados quando o script for encerrado
      process.on('SIGINT', () => {
        connection.end();
        process.exit();
      });
    })
    .catch((error) => console.error('Erro ao iniciar o cliente do WhatsApp:', error));
}

connectToDatabase();