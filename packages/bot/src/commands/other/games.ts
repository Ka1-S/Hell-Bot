import { TicTacToeGame } from '../../lib/utils/games/tic-tac-toe';
import { GameInvite } from '../../lib/utils/games/inviteEmbed';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { User } from 'discord.js';
import { Connect4Game } from '../../lib/utils/games/connect-4';

export const playersInGame: Map<string, User> = new Map();
@ApplyOptions<CommandOptions>({
  name: 'games',
  description: 'Jogar um jogo com outra pessoa',
  preconditions: ['isCommandDisabled']
})
export class GamesCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    let maxPlayers = 2;
    const playerMap = new Map();
    const player1 = interaction.user;

    const subCommand = interaction.options.getSubcommand();
    let gameTitle: string;
    if (playersInGame.has(player1.id)) {
      await interaction.reply({
        content: ":x: Você não pode jogar mais de 1 jogo por vez",
        ephemeral: true
      });
      return;
    }
    playerMap.set(player1.id, player1);
    if (subCommand == 'connect-4') {
      gameTitle = 'Connect 4';
    } else {
      gameTitle = 'Tic-Tac-Toe';
    }

    const invite = new GameInvite(gameTitle!, [player1], interaction);

    await interaction
      .reply({
        embeds: [invite.gameInviteEmbed()],
        components: [invite.gameInviteButtons()]
      })
      .then(async i => {
        const inviteCollector =
          interaction.channel?.createMessageComponentCollector({
            time: 60 * 1000
          });
        inviteCollector?.on('collect', async response => {
          if (response.customId === `${interaction.id}${player1.id}-No`) {
            if (response.user.id !== player1.id) {
              playerMap.delete(response.user.id);
            } else {
              await interaction.followUp({
                content: ':x: Você iniciou o convite.',
                ephemeral: true
              });
            }
          }

          if (response.customId === `${interaction.id}${player1.id}-Yes`) {
            if (playersInGame.has(response.user.id)) {
              await interaction.followUp({
                content: `:x: Você já está jogando um jogo.`,
                ephemeral: true
              });
            }

            if (!playerMap.has(response.user.id)) {
              playerMap.set(response.user.id, response.user);
            }
            if (playerMap.size == maxPlayers)
              return inviteCollector.stop('start-game');
          }
          const accepted: User[] = [];
          playerMap.forEach(player => accepted.push(player));
          const invite = new GameInvite(gameTitle, accepted, interaction);
          await response.update({
            embeds: [invite.gameInviteEmbed()]
          });
          if (response.customId === `${interaction.id}${player1.id}-Start`) {
            if (playerMap.has(response.user.id)) {
              if (accepted.length > 1) {
                playerMap.forEach((player: User) =>
                  playersInGame.set(player.id, player)
                );
                return inviteCollector.stop('start-game');
              }
            }
          }
        });
        inviteCollector?.on('end', async (collected, reason) => {
          await interaction.deleteReply()!;
          if (playerMap.size === 1 || reason === 'declined') {
            playerMap.forEach(player => playersInGame.delete(player.id));
          }
          if (reason === 'time') {
            await interaction.followUp({
              content: `:x: Ninguém respondeu ao seu convite.`,
              ephemeral: true,
              target: player1
            });
            if (playerMap.size > 1) {
              playerMap.forEach((player: User) =>
                playersInGame.set(player.id, player)
              );
              return startGame(subCommand);
            }
          }
          if (reason === 'start-game') {
            return startGame(subCommand);
          }
        });
        function startGame(subCommand: string) {
          switch (subCommand) {
            case 'connect-4':
              new Connect4Game().connect4(interaction, playerMap);
              break;

            case 'tic-tac-toe':
              new TicTacToeGame().ticTacToe(interaction, playerMap);
              break;
          }
        }
      });
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addSubcommand(subCommand =>
          subCommand
            .setName('connect-4')
            .setDescription('Play a game of Connect-4 with another Person.')
        )
        .addSubcommand(subCommand =>
          subCommand
            .setName('tic-tac-toe')
            .setDescription('Play a game of Tic-Tac-Toe with another Person.')
        )
    );
  }
}
