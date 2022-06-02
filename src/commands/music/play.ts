// import type { TrackInfo } from '@lavaclient/types';
// import type { Song } from './../../lib/utils/queue/Song';
// import { NowPlayingEmbed } from '../../lib/utils/music/NowPlayingEmbed';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';
//import type { Addable } from '../../lib/utils/queue/Queue';
import searchSong from '../../lib/utils/music/searchSong';
// import type { MessageChannel } from '../..';
// import searchSong from '../../lib/utils/music/searchSong';
// import type { Addable } from '../../lib/utils/queue/Queue';
// import prisma from '../../lib/prisma';
// import { embedButtons } from '../../lib/utils/music/ButtonHandler';
// import * as optionsFile from '../../options.json';
// import { shuffleQueue } from '../../lib/utils/music/handleOptions';

@ApplyOptions<CommandOptions>({
  name: 'play',
  description: 'Play any song or playlist from YouTube, Spotify and more!',
  preconditions: [
    'GuildOnly',
    'inVoiceChannel',
    'inPlayerVoiceChannel',
    'userInDB'
  ]
})
export class PlayCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    await interaction.deferReply();

    const { client } = container;
    const query = interaction.options.getString('query', true);
    const { music } = client;

    // had a precondition make sure the user is infact in a voice channel
    const voiceChannel = interaction.guild?.voiceStates?.cache?.get(
      interaction.user.id
    )?.channel!;

    let queue = music.queues.get(interaction.guildId!);

    await queue.setTextChannelID(interaction.channel!.id);

    if (!queue.player) {
      const player = queue.createPlayer();
      await player.connect(voiceChannel.id, { deafened: true });
    }

    const trackTuple = await searchSong(query);
    await queue.add(trackTuple[1]);
    await queue.start();

    return interaction.followUp('console');
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'query',
          description: 'What song or playlist would you like to listen to?',
          type: 'STRING',
          required: true
        },
        {
          name: 'is-custom-playlist',
          description: 'Is it a custom playlist?',
          type: 'STRING',
          choices: [
            {
              name: 'Yes',
              value: 'Yes'
            },
            {
              name: 'No',
              value: 'No'
            }
          ]
        },
        {
          name: 'shuffle-playlist',
          description: 'Would you like to shuffle the playlist?',
          type: 'STRING',
          choices: [
            {
              name: 'Yes',
              value: 'Yes'
            },
            {
              name: 'No',
              value: 'No'
            }
          ]
        }
      ]
    });
  }
}
