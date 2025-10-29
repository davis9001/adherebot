import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  GuildTextBasedChannel,
  Message,
  PartialGuildMember,
} from "discord.js"
import { getIntroSettings } from "../connections/mongoDb"
import log from "../lib/logger"

export async function guildMemberRemoveEvent(member: GuildMember | PartialGuildMember) {
  const guild = member.guild
  const guildId = guild.id

  // Get intro settings
  const settings = await getIntroSettings(guildId)

  if (!settings || !settings.autoDeleteEnabled) {
    log(
      `[${guild.name}] Intro auto-delete not enabled or settings not found.`
    )
    return
  }

  if (!settings.introChannelId || !settings.adminMessagesChannelId) {
    log(
      `[${guild.name}] Intro channel or admin messages channel not set.`
    )
    return
  }

  // Get the intro channel
  const introChannel = guild.channels.cache.get(
    settings.introChannelId
  ) as GuildTextBasedChannel

  if (!introChannel) {
    log(`[${guild.name}] Intro channel not found.`)
    return
  }

  // Get the admin messages channel
  const adminChannel = guild.channels.cache.get(
    settings.adminMessagesChannelId
  ) as GuildTextBasedChannel

  if (!adminChannel) {
    log(`[${guild.name}] Admin messages channel not found.`)
    return
  }

  // Search for messages from the member who left in the intro channel
  try {
    const messages = await introChannel.messages.fetch({ limit: 100 })
    const memberMessages = messages.filter((msg) => msg.author.id === member.id)

    if (memberMessages.size === 0) {
      log(
        `[${guild.name}] No messages found from ${member.user?.username} in intro channel.`
      )
      return
    }

    // Send confirmation message to admin for each message
    const messagesArray = Array.from(memberMessages.values())
    for (let i = 0; i < messagesArray.length; i++) {
      await sendAdminConfirmation(
        guild.name,
        adminChannel,
        messagesArray[i],
        member,
        introChannel
      )
    }
  } catch (err) {
    log(`[${guild.name}] Error fetching messages: ${err}`)
  }
}

async function sendAdminConfirmation(
  guildName: string,
  adminChannel: GuildTextBasedChannel,
  message: Message,
  member: GuildMember | PartialGuildMember,
  introChannel: GuildTextBasedChannel
) {
  const confirmButton = new ButtonBuilder()
    .setCustomId(`delete_intro_${message.id}_${introChannel.id}`)
    .setLabel("Delete Message")
    .setStyle(ButtonStyle.Danger)

  const cancelButton = new ButtonBuilder()
    .setCustomId(`cancel_intro_${message.id}`)
    .setLabel("Keep Message")
    .setStyle(ButtonStyle.Secondary)

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    confirmButton,
    cancelButton
  )

  const messagePreview = message.content.length > 100 
    ? message.content.substring(0, 100) + "..." 
    : message.content

  const username = member.user?.username || "Unknown User"
  const userTag = member.user?.tag || "Unknown#0000"

  try {
    await adminChannel.send({
      content: `**Member Left:** ${username} (${userTag})\n**Message in ${introChannel.name}:**\n\`\`\`${messagePreview}\`\`\`\n[Jump to Message](${message.url})\n\nDo you want to delete this introduction message?`,
      components: [row],
    })
    log(
      `[${guildName}] Sent admin confirmation for message ${message.id} from ${username}`
    )
  } catch (err) {
    log(`[${guildName}] Error sending admin confirmation: ${err}`)
  }
}
