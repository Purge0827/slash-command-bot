const discord = require('discord.js');
const client = new discord.Client();

let guildID = 'your server id';
let token = 'your bor token'

async function createAPIMessage(interaction, content) {
  const apiMessage = await discord.APIMessage.create(client.channels.resolve(interaction.channel_id), content)
    .resolveData()
    .resolveFiles();

  return { ...apiMessage.data, files: apiMessage.files };
}

client.on('ready', () => {
  console.log(`${client.user.tag} is ready`);

  client.api.applications(client.user.id).guilds(guildID).commands.post({
    data: {
      name: "ping",
      description: `${client.user.username}'s ping`
    }
  });

  client.api.applications(client.user.id).guilds(guildID).commands.post({
    data: {
      name: "avatar",
      description: "Avatar of discord user",
    }
  });

  client.api.applications(client.user.id).guilds(guildID).commands.post({
    data: {
      name: "say",
      description: "A say cmd",

      options: [
        {
          name: "content",
          description: "The content of the message",
          type: 3,
          required: true
        }
      ]
    }
  });

})

client.ws.on('INTERACTION_CREATE', async interaction => {
  let command = interaction.data.name.toLowerCase();
  let args = interaction.data.options;

  if (command === 'ping') {
    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          content: `Ping: ${client.ws.ping}ms`
        }
      }
    });
  }

  if (command === 'avatar') {

    let user = client.users.cache.get(interaction.member.user.id)

    let embed = new discord.MessageEmbed()
      .setColor('BLUE')
      .setAuthor(`${user.username}'s Avatar`, client.user.displayAvatarURL())
      .setImage(`${user.displayAvatarURL({ dynamic: true })}?size=256`);

    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: await createAPIMessage(interaction, embed)
      }
    });
  }

  if (command === 'say') {

    let content = args.find(a => a.name.toLowerCase() === "content").value;

    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          content: content
        }
      }
    });

  }
})

client.login(token)
// Credits: Angelo