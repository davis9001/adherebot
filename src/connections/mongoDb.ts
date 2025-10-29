import { MongoClient, ServerApiVersion } from "mongodb"
import NumberSetting, { NumberSettingType } from "../models/numberSetting"
import LogChannelSetting, { LogType } from "../models/logChannelSetting"
import MemberMutedByBot from "../models/memberMutedByBot"
import GuildJoinEvent from "../models/guildJoinEvent"
import VoiceChannelEvent, {
  VoiceChannelAction,
} from "../models/voiceChannelEvent"
import { GuildMember, VoiceBasedChannel } from "discord.js"
import { GuildInviteData, InviteData } from "../models/inviteData"
import IntroChannelSetting from "../models/introChannelSetting"

const mongoUser = process.env.MONGO_USER
const mongoPass = process.env.MONGO_PASS
const mongoDb = process.env.MONGO_DB
const mongoUrl = process.env.MONGO_URL
const uri = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoUrl}/${mongoDb}?retryWrites=false&w=majority`

const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

export const getEnabledStatus = async (guildId: string) => {
  const database = mongoClient.db(mongoDb)
  const result = await database
    .collection<NumberSetting>("numberSettings")
    .findOne({ name: "enabledOnServer", guildId: guildId })
  return result ? result.value : 0
}

export const setEnabledStatus = async (guildId: string, status: boolean) => {
  const statusNumber = status ? 1 : 0
  const database = mongoClient.db(mongoDb)
  const result = await database
    .collection<NumberSetting>("numberSettings")
    .updateOne(
      { name: "enabledOnServer", guildId: guildId },
      { $set: { value: statusNumber } },
      { upsert: true }
    )
  return result
}

export const insertVoiceChannelEvent = async (
  guildId: string,
  member: GuildMember,
  channel: VoiceBasedChannel,
  action: VoiceChannelAction
) => {
  const database = mongoClient.db(mongoDb)
  const voiceChannelEvent =
    database.collection<VoiceChannelEvent>("voiceChannelEvent")

  const result = await voiceChannelEvent.insertOne({
    guildId: guildId,
    memberId: member.id,
    memberName: member.user.username,
    channelId: channel.id,
    channelName: channel.name,
    action: action,
    timestamp: new Date(),
  })

  return result
}

export const insertGuildJoinEvent = async (
  guildId: string,
  member: GuildMember,
  inviteCode?: string
) => {
  const database = mongoClient.db(mongoDb)
  const guildJoinEvent = database.collection<GuildJoinEvent>("guildJoinEvent")
  const result = await guildJoinEvent.insertOne({
    guildId: guildId,
    memberId: member.id,
    inviteCode: inviteCode ? inviteCode : "none",
    timestamp: new Date(),
  })
  return result
}

export const setInvitesData = async (guildId: string, discordInvitesData) => {
  const database = mongoClient.db(mongoDb)
  const invitesData = database.collection<InviteData>("invitesData")
  const result = await invitesData.updateOne(
    { guildId: guildId },
    { $set: { invites: discordInvitesData } },
    { upsert: true }
  )
  return result
}

export const getInvitesData = async (guildId: string) => {
  const database = mongoClient.db(mongoDb)
  const invitesData = database.collection<GuildInviteData>("invitesData")
  const result = await invitesData.findOne({ guildId: guildId })
  return result?.invites || []
}

export const incrementInvite = async (guildId: string, code: string) => {
  const database = mongoClient.db(mongoDb)
  const invitesData = database.collection<InviteData>("invitesData")
  const inviteCount = await invitesData.findOne({
    guildId: guildId,
    "invites.code": code,
  })

  if (inviteCount) {
    const newInviteCount = inviteCount[code] + 1
    const result = await invitesData.updateOne(
      { guildId: guildId, "invites.code": code },
      {
        $set: {
          "invites.uses": newInviteCount,
        },
      },
      { upsert: true }
    )
    return result
  } else {
    return undefined
  }
}

export const setMemberMutedByBot = async (
  guildId: string,
  memberId: string,
  serverMuted: boolean
) => {
  const database = mongoClient.db(mongoDb)
  const memberMuted = database.collection<MemberMutedByBot>("memberMutedByBot")
  const result = await memberMuted.updateOne(
    { guildId: guildId, memberId: memberId },
    { $set: { serverMuted: serverMuted } },
    { upsert: true }
  )
}

export const setNumberSetting = async (
  settingName: NumberSettingType,
  value: number,
  guildId: string
) => {
  const database = mongoClient.db(mongoDb)
  const numberSetting = database.collection<NumberSetting>("numberSettings")
  const result = await numberSetting.updateOne(
    { $inc: { guildId: guildId } },
    { name: settingName, value: value },
    { upsert: true }
  )
  return result
}

export const getNumberSetting = async (
  settingName: NumberSettingType,
  guildId: string
) => {
  const database = mongoClient.db(mongoDb)
  const result = await database
    .collection<NumberSetting>("numberSettings")
    .findOne({ name: settingName, guildId: guildId })
  return result ? result.value : 0
}

export const setLogChannelSetting = async (
  guildId: string,
  channelId: string,
  logType: LogType
) => {
  const database = mongoClient.db(mongoDb)
  const logChannelSetting =
    database.collection<LogChannelSetting>("logChannelSettings")
  const result = await logChannelSetting.updateOne(
    { guildId: guildId },
    { $set: { channelId: channelId, logType: logType } },
    { upsert: true }
  )
  return result
}

export const getLogChannelSetting = async (
  guildId: string,
  logType: LogType
) => {
  const database = mongoClient.db(mongoDb)
  const result = await database
    .collection<LogChannelSetting>("logChannelSetting")
    .findOne({ guildId: guildId, logType: logType })
  return result
}

export const setIntroChannel = async (guildId: string, channelId: string) => {
  const database = mongoClient.db(mongoDb)
  const introChannelSettings = database.collection<IntroChannelSetting>(
    "introChannelSettings"
  )
  const result = await introChannelSettings.updateOne(
    { guildId: guildId },
    { $set: { introChannelId: channelId } },
    { upsert: true }
  )
  return result
}

export const getIntroChannel = async (guildId: string) => {
  const database = mongoClient.db(mongoDb)
  const result = await database
    .collection<IntroChannelSetting>("introChannelSettings")
    .findOne({ guildId: guildId })
  return result?.introChannelId
}

export const setAdminMessagesChannel = async (
  guildId: string,
  channelId: string
) => {
  const database = mongoClient.db(mongoDb)
  const introChannelSettings = database.collection<IntroChannelSetting>(
    "introChannelSettings"
  )
  const result = await introChannelSettings.updateOne(
    { guildId: guildId },
    { $set: { adminMessagesChannelId: channelId } },
    { upsert: true }
  )
  return result
}

export const getAdminMessagesChannel = async (guildId: string) => {
  const database = mongoClient.db(mongoDb)
  const result = await database
    .collection<IntroChannelSetting>("introChannelSettings")
    .findOne({ guildId: guildId })
  return result?.adminMessagesChannelId
}

export const setIntroAutoDelete = async (
  guildId: string,
  enabled: boolean
) => {
  const database = mongoClient.db(mongoDb)
  const introChannelSettings = database.collection<IntroChannelSetting>(
    "introChannelSettings"
  )
  const result = await introChannelSettings.updateOne(
    { guildId: guildId },
    { $set: { autoDeleteEnabled: enabled } },
    { upsert: true }
  )
  return result
}

export const getIntroAutoDelete = async (guildId: string) => {
  const database = mongoClient.db(mongoDb)
  const result = await database
    .collection<IntroChannelSetting>("introChannelSettings")
    .findOne({ guildId: guildId })
  return result?.autoDeleteEnabled || false
}

export const getIntroSettings = async (guildId: string) => {
  const database = mongoClient.db(mongoDb)
  const result = await database
    .collection<IntroChannelSetting>("introChannelSettings")
    .findOne({ guildId: guildId })
  return result
}

process.on("SIGINT", () => {
  mongoClient.close().then(() => {
    process.exit(0)
  })
})
process.on("SIGTERM", () => {
  mongoClient.close().then(() => {
    process.exit(0)
  })
})
export default mongoClient
