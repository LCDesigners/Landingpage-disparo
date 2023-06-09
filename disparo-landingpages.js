const venom = require('venom-bot');
const mysql = require('mysql');
const moment = require('moment-timezone');

let connection;

function connectToDatabase() {
  connection = mysql.createConnection({
    host: 'astronautmarketing.com.br',
    user: 'lcdesi08_lucas',
    password: 'luka1709',
    database: 'lcdesi08_solucionatica_ferramentas',
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
        const currentDate = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
        const twoMinutesAgo = moment().tz('America/Sao_Paulo').subtract(2, 'minutes').format('YYYY-MM-DD HH:mm:ss');

        const currentQuery = `SELECT * FROM ferramentas_mkt_leads WHERE data_criacao = '${currentDate}'`;
        const twoMinutesAgoQuery = `SELECT * FROM ferramentas_mkt_leads WHERE data_criacao = '${twoMinutesAgo}'`;
        const currentMessagesQuery = `SELECT id_campanha, mensagem_envio, audio_envio FROM ferramentas_mkt_mensagens WHERE data_envio = '${currentDate}'`;

        connection.query(currentQuery, (error, currentResults) => {
          if (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            return;
          }

          if (currentResults.length === 0) {
            console.log('Nenhum destinatário encontrado para a data', currentDate);
            return;
          }

          currentResults.forEach((currentRow) => {
            const phoneNumber = currentRow.telefone + '@c.us';
            const message = currentRow.mensagem_envio;
            const voiceMessagePath = 'https://especialistas.solucionati.ca/app/solucionatica/empresa/aplicacao/marketing_solucionatica/audios_mensagens/Audio-live-boas-vindas-live-robson-triches.mp3'; // Caminho do arquivo de áudio

            const sendTextPromise = client.sendText(phoneNumber, message);
            const sendVoicePromise = client.sendVoice(phoneNumber, voiceMessagePath);

            Promise.all([sendTextPromise, sendVoicePromise])
              .then(([textResult, voiceResult]) => {
                if (textResult.fromMe) {
                  console.log('Mensagem de texto enviada com sucesso para', phoneNumber);
                }
                if (voiceResult.fromMe) {
                  console.log('Mensagem de voz enviada com sucesso para', phoneNumber);
                }
              })
              .catch((error) => console.error('Erro ao enviar a mensagem para', phoneNumber, ':', error));
          });
        });

        connection.query(twoMinutesAgoQuery, (error, twoMinutesAgoResults) => {
          if (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            return;
          }

          if (twoMinutesAgoResults.length === 0) {
            console.log('Nenhum destinatário encontrado para 2 minutos antes da data', currentDate);
            return;
          }
          // ...
          twoMinutesAgoResults.forEach((twoMinutesAgoRow) => {
            const phoneNumber = twoMinutesAgoRow.telefone + '@c.us';
            const communityMessage = 'Entre na nossa comunidade';
            const linkTitle = 'Entre na nossa comunidade';
            const linkUrl = 'https://bit.ly/comunidadesolucionatica';
          
            client
              .sendLinkPreview(phoneNumber, linkUrl, linkTitle, communityMessage)
              .then((result) => {
                if (result.fromMe) {
                  console.log('Link com visualização enviado com sucesso para', phoneNumber);
                }
              })
              .catch((error) => console.error('Erro ao enviar o link com visualização para', phoneNumber, ':', error));
          });
          // ...


        });

        connection.query(currentMessagesQuery, (error, currentMessagesResults) => {
          if (error) {
            console.error('Erro ao consultar as mensagens no banco de dados:', error);
            return;
          }
        
          if (currentMessagesResults.length === 0) {
            console.log('Nenhuma mensagem encontrada para a data', currentDate);
            return;
          }
        
          currentMessagesResults.forEach((currentMessagesRow) => {
            const idCampanha = currentMessagesRow.id_campanha;
            const mensagemEnvio = currentMessagesRow.mensagem_envio;
            const AudioEnvio = currentMessagesRow.audio_envio;
        
            // Agora você pode usar o "idCampanha" e "mensagemEnvio" conforme necessário
            // ...

            const leadsQuery = `SELECT telefone FROM ferramentas_mkt_leads WHERE id_campanha = '${idCampanha}'`;

            connection.query(leadsQuery, (error, leadsResults) => {
              if (error) {
                console.error('Erro ao consultar os leads no banco de dados:', error);
                return;
              }
            
              if (leadsResults.length === 0) {
                console.log('Nenhum lead encontrado para a campanha', idCampanha);
                return;
              }
            
              leadsResults.forEach((leadRow) => {
                const phoneNumber = leadRow.telefone + '@c.us';
                const message = mensagemEnvio;
                const audio_envio = AudioEnvio
              
                // Agora você pode enviar a mensagem para o contato encontrado
                // ...
    
                const sendTextPromise = client.sendText(phoneNumber, message);
                const sendVoicePromise = audio_envio ? client.sendVoice(phoneNumber, audio_envio) : Promise.resolve();
    
                Promise.all([sendTextPromise, sendVoicePromise])
                  .then(([textResult, voiceResult]) => {
                    if (textResult.fromMe) {
                      console.log('Mensagem de texto enviada com sucesso para', phoneNumber);
                    }
                    if (voiceResult && voiceResult.fromMe) {
                      console.log('Mensagem de voz enviada com sucesso para', phoneNumber);
                    }
                  })
                  .catch((error) => console.error('Erro ao enviar a mensagem para', phoneNumber, ':', error));
                
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
    .catch((error) => {
      console.error('Erro ao iniciar o cliente do WhatsApp:', error);
      console.log('Reiniciando o processo...');
      startMessageSending(); // Reinicia o processo em caso de erro
    });
}

connectToDatabase();
