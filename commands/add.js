const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Aggiungi qualcuno al Ticket')
    .addUserOption(option =>
      option.setName('target')
      .setDescription('Membro da aggiungere al ticket')
      .setRequired(true)),
  async execute(interaction, client) {
    const chan = client.channels.cache.get(interaction.channelId);
    const user = interaction.options.getUser('target');

    if (chan.name.includes('ticket')) {
      chan.edit({
        permissionOverwrites: [{
          id: user,
          allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
        },
        {
          id: interaction.guild.roles.everyone,
          deny: ['VIEW_CHANNEL'],
        },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
      ],
      }).then(async () => {
        interaction.reply({
          content: `<@${user.id}> è stato aggiunto al Ticket!`
        });
      });} else {
      interaction.reply({
        content: 'Non sei in un Ticket!',
        ephemeral: true
      });
    };
  },
};
