import log from "../../lib/logger"
import { setIntroChannel } from "../../connections/mongoDb"
import {
  CommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"

export const setintrochannel = {
  command: new SlashCommandBuilder()
    .setName("intro-channel")
    .setDescription("Set the channel where user introductions are posted")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The introductions channel")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction: CommandInteraction) {
    // @ts-ignore
    const channel = interaction.options.getChannel("channel")
    const guild = interaction.guild
    const guildId = guild?.id || ""
    await interaction.deferReply()
    await setIntroChannel(guildId, channel.id)
      .then(async () => {
        await interaction.editReply(
          `Set introductions channel to ${channel}`
        )
        log(`[${guild?.name}] Set introductions channel to ${channel}`)
      })
      .catch(async (err) => {
        await interaction.editReply(`Error updating introductions channel ${err}.`)
        log(err)
      })
  },
}
