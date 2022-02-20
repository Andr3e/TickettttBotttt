let hastebin = require('hastebin');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'Hai già creato un Ticket!',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        interaction.reply({
          content: `Ticket creato! <#${c.id}>`,
          ephemeral: true
        });

        const embed = new client.discord.MessageEmbed()
          .setColor('6d6ee8')
          .setAuthor('Ticket', 'https://cdn.discordapp.com/attachments/836535069023797258/937750429285113946/Senza_titolo_18_20211125171245.png')
          .setDescription('Seleziona la categoria del tuo Ticket')
          .setFooter('AquariusMC.it', 'https://cdn.discordapp.com/attachments/836535069023797258/937750429285113946/Senza_titolo_18_20211125171245.png')
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Seleziona la categoria del Ticket')
            .addOptions([{
                label: 'Assistenza generale',
                value: 'Assistenza generale',
                emoji: '🆘',
              },
              {
                label: 'Bug Report',
                value: 'Bug Report',
                emoji: '❌',
              },
              {
                label: 'Richiesta Unban/Unmute',
                value: 'Richiesta Unban/Unmute',
                emoji: '‼️',
              },
              {
                label: 'Amministrazione',
                value: 'Amministrazione',
                emoji: '📝',
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 20000
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('6d6ee8')
                  .setAuthor('Ticket', 'https://cdn.discordapp.com/attachments/836535069023797258/937750429285113946/Senza_titolo_18_20211125171245.png')
                  .setDescription(`<@!${interaction.user.id}> Ha creato un ticket ${i.values[0]}`)
                  .setFooter('AquariusMC.it', 'https://cdn.discordapp.com/attachments/836535069023797258/937750429285113946/Senza_titolo_18_20211125171245.png')
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('Chiudi il Ticket')
                    .setEmoji('899745362137477181')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
            if (i.values[0] == 'assistenzaGenerale') {
              c.edit({
                parent: client.config.assistenzaGenerale
              });
            };
            if (i.values[0] == 'bugReport') {
              c.edit({
                parent: client.config.bugReport
              });
            };
            if (i.values[0] == 'unban/unmute') {
              c.edit({
                parent: client.config.unban
              });
            if (i.values[0] == 'amministrazione') {
              c.edit({
                parent: client.config.amministrazione
              });
            };
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Nessuna categoria selezionata. Chiusura del Ticket...`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('Chiudere il Ticket')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('Annulla chiusura')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'Sei sicuro di voler chiudere il ticket?',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `Ticket chiuso da <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('6d6ee8')
                .setAuthor('Ticket', 'https://cdn.discordapp.com/attachments/836535069023797258/937750429285113946/Senza_titolo_18_20211125171245.png')
                .setDescription('```Controllo Ticket```')
                .setFooter('AquariusMC.it', 'https://cdn.discordapp.com/attachments/836535069023797258/937750429285113946/Senza_titolo_18_20211125171245.png')
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('Elimina il Ticket')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'Chiusura del Ticket annullata!',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Chiusura del Ticket annullata!',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: 'Salvataggio dei messaggi...'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('fr-FR')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Nothing"
        hastebin.createPaste(a, {
            contentType: 'text/plain',
            server: 'https://hastebin.com'
          }, {})
          .then(function (urlToPaste) {
            const embed = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', 'https://cdn.discordapp.com/attachments/836535069023797258/937750429285113946/Senza_titolo_18_20211125171245.png')
              .setDescription(`📰 Logs del ticket \`${chan.id}\` creato da <@!${chan.topic}> e chiuso da <@!${interaction.user.id}>\n\nLogs: [**Clicca qui per vedere i log**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            const embed2 = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', 'https://cdn.discordapp.com/attachments/836535069023797258/937750429285113946/Senza_titolo_18_20211125171245.png')
              .setDescription(`📰 Logs del tuo ticket \`${chan.id}\`: [**Clicca qui per vedere i log**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            });
            client.users.cache.get(chan.topic).send({
              embeds: [embed2]
            }).catch(() => {console.log('I can\'t dm him :(')});
            chan.send('Cancellazione del canale...');

            setTimeout(() => {
              chan.delete();
            }, 5000);
          });
      });
    };
  },
};
