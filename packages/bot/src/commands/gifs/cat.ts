import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'cat',
  description: 'Responde com gif de gato fofo!',
  preconditions: ['isCommandDisabled']
})
export class CatCommand extends Command {
<<<<<<< HEAD
  public override chatInputRun(interaction: CommandInteraction) {
=======
  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
>>>>>>> 14027c00ef878ab946b07a9cd5fa65a4fcab0796
    if (!process.env.TENOR_API) return;
    axios
      .get(
        `https://tenor.googleapis.com/v2/search?key=${process.env.TENOR_API}&q=cat&limit=1&random=true`
      )
      .then(async response => {
        return await interaction.reply({
          content: response.data.results[0].url
        });
      })
      .catch(async error => {
        Logger.error(error);
        return await interaction.reply(
          'Algo deu errado ao tentar buscar um gif de gatinho bonito :('
        );
      });
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
