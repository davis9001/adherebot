import * as dotenv from "dotenv"
dotenv.config()
import { Client, Events, GatewayIntentBits } from "discord.js"

import { guildMemberAddEvent, updateInvitesData } from "./events/guildJoin"
import { guildMemberRemoveEvent } from "./events/guildMemberRemove"
import { readyEvent } from "./events/ready"
import { voiceStateEvent } from "./events/voiceState"
import log from "./lib/logger"

import { botScheduler } from "./bot-dispatcher"
import { activeCommands } from "./commands/activeCommands"
botScheduler.run()

const commands = activeCommands

const botToken = process.env.DISCORD_BOT_TOKEN
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

client.on("ready", readyEvent)
client.on("ready", updateInvitesData)

client.on("voiceStateUpdate", voiceStateEvent)
client.on("guildMemberAdd", guildMemberAddEvent)
client.on("guildMemberRemove", guildMemberRemoveEvent)

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (!Object.keys(commands).includes(interaction.commandName)) {
      return
    }
    const command =
      commands[interaction.commandName as unknown as keyof typeof commands]
    try {
      await command.execute(interaction)
    } catch {}
  } else if (interaction.isButton()) {
    // Handle button interactions for intro message deletion
    if (interaction.customId.startsWith("delete_intro_")) {
      const parts = interaction.customId.split("_")
      const messageId = parts[2]
      const channelId = parts[3]

      try {
        const channel = interaction.guild?.channels.cache.get(channelId)
        if (channel?.isTextBased()) {
          const message = await channel.messages.fetch(messageId)
          await message.delete()
          await interaction.update({
            content: `✅ Message deleted successfully.`,
            components: [],
          })
        }
      } catch (err) {
        log(`Error deleting intro message: ${err}`)
        await interaction.update({
          content: `❌ Error deleting message. Please try again or delete it manually.`,
          components: [],
        })
      }
    } else if (interaction.customId.startsWith("cancel_intro_")) {
      await interaction.update({
        content: `Message kept. No action taken.`,
        components: [],
      })
    }
  }
})

client.login(botToken)
