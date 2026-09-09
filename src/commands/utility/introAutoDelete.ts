import log from "../../lib/logger"
import { setIntroAutoDelete } from "../../connections/mongoDb"
import {
  CommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"

export const introautodelete = {
  command: new SlashCommandBuilder()
    .setName("intro-auto-delete")
    .setDescription("Enable or disable automatic deletion of introductions when members leave")
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("Enable or disable the feature")
        .addChoices(
          { name: "Enable", value: "enable" },
          { name: "Disable", value: "disable" }
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction: CommandInteraction) {
    // @ts-ignore
    const status = interaction.options.getString("status")
    const guild = interaction.guild
    const guildId = guild?.id || ""
    const enabled = status === "enable"
    await interaction.deferReply()
    await setIntroAutoDelete(guildId, enabled)
      .then(async () => {
        await interaction.editReply(
          `Intro auto-delete ${enabled ? "enabled" : "disabled"}.`
        )
        log(`[${guild?.name}] Intro auto-delete ${enabled ? "enabled" : "disabled"}`)
      })
      .catch(async (err) => {
        await interaction.editReply(`Error updating intro auto-delete setting ${err}.`)
        log(err)
      })
  },
}
