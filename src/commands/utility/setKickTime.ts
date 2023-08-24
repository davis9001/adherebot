import mongoClient from "../../connections/mongoDb"
import NumberSetting from "../../models/numberSetting"
import {
  CommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"

export const setkicktime = {
  command: new SlashCommandBuilder()
    .setName("setkicktime")
    .setDescription("Number of seconds to wait before bot disconnects user")
    .addNumberOption((option) =>
      option
        .setName("seconds")
        .setDescription("The number of seconds")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction: CommandInteraction) {
    // @ts-ignore
    const seconds = interaction.options.getNumber("seconds")
    await interaction.deferReply()
    await updateKickTime(seconds, interaction).catch(async (err) => {
      await interaction.editReply("Error updating userDisconnectSeconds.")
      console.log(err)
    })
  },
}

async function updateKickTime(
  seconds: number,
  interaction: CommandInteraction
) {
  try {
    const database = mongoClient.db("camera_on")
    // @ts-ignore
    const numberSettings = database.collection<NumberSetting>("numberSettings")
    const result = await numberSettings.updateOne(
      { name: "userDisconnectSeconds" },
      {
        $set: {
          value: seconds,
        },
      },
      { upsert: true }
    )
    console.log(
      `Updated userDisconnectSeconds in mongoDB: ${result.modifiedCount} documents.`
    )
    interaction.editReply(`Updated userDisconnect to ${seconds} seconds.`)
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message)
    }
  }
}