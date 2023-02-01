import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'urban',
  description: 'Obter definições do dicionário urbano',
  preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class UrbanCommand extends Command {
  public override chatInputRun(interaction: CommandInteraction) {
    const query = interaction.options.getString('query', true);
    axios
      .get(`https://api.urbandictionary.com/v0/define?term=${query}`)
      .then(async response => {
        const definition: string = response.data.list[0].definition;
        const embed = new MessageEmbed()
          .setColor('#BB7D61')
          .setAuthor({
            name: 'Urban Dictionary',
            url: 'https://urbandictionary.com',
            iconURL: 'https://i.imgur.com/vdoosDm.png'
          })
          .setDescription(definition)
          .setURL(response.data.list[0].permalink)
          .setTimestamp()
          .setFooter({
            text: 'Desenvolvido por UrbanDictionary'
          });
        return await interaction.reply({ embeds: [embed] });
      })
      .catch(async error => {
        Logger.error(error);
        return await interaction.reply('Falha ao fornecer a definição :sob:');
      });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'query',
          type: 'STRING',
          description: 'Que termo você quer procurar?',
          required: true
        }
      ]
    });
  }
}
