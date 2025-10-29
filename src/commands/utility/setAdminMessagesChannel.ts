import log from "../../lib/logger"
import { setAdminMessagesChannel } from "../../connections/mongoDb"
import {
  CommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"

export const setadminmessageschannel = {
  command: new SlashCommandBuilder()
    .setName("admin-messages-channel")
    .setDescription("Set the channel where admin messages are sent")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The admin messages channel")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction: CommandInteraction) {
    // @ts-ignore
    const channel = interaction.options.getChannel("channel")
    const guild = interaction.guild
    const guildId = guild?.id || ""
    await interaction.deferReply()
    await setAdminMessagesChannel(guildId, channel.id)
      .then(async () => {
        await interaction.editReply(
          `Set admin messages channel to ${channel}`
        )
        log(`[${guild?.name}] Set admin messages channel to ${channel}`)
      })
      .catch(async (err) => {
        await interaction.editReply(`Error updating admin messages channel ${err}.`)
        log(err)
      })
  },
}
