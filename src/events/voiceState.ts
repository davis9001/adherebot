import { insertVoiceChannelEvent } from "../connections/mongoDb"
import { VoiceChannelAction } from "../models/voiceChannelEvent"

import { GatewayIntentBits, VoiceState, GuildMember } from "discord.js"
import log from "../lib/logger"

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]

// const resolveVoiceStateEventType = (
//   member: GuildMember,
//   oldState: VoiceState,
//   newState: VoiceState
// ) => {
//   let eventType: VoiceChannelAction = "join"
//   const oldChannel = oldState.channel
//   const newChannel = newState.channel
//   const oldCamState = oldState.selfVideo ? "on" : "off"
//   const newCamState = newState.selfVideo ? "on" : "off"
//   if (
//     oldState.channel !== newState.channel &&
//     member &&
//     !oldChannel &&
//     newChannel
//   ) {
//     eventType = "join"
//   } else if (
//     oldState.channel !== newState.channel &&
//     member &&
//     oldChannel &&
//     !newChannel
//   ) {
//     eventType = "leave"
//   } else if (
//     oldState.channel == newState.channel &&
//     newChannel &&
//     member &&
//     oldCamState !== newCamState &&
//     !newState.selfVideo
//   ) {
//     eventType = "cameraOff"
//   } else if (
//     oldState.channel == newState.channel &&
//     newChannel &&
//     member &&
//     oldCamState !== newCamState &&
//     newState.selfVideo
//   ) {
//     eventType = "cameraOn"
//   } else if (
//     oldState.channel == newState.channel &&
//     newChannel &&
//     member &&
//     oldCamState === newCamState &&
//     !newState.selfVideo
//   ) {
//     eventType = "screenUnshared"
//   } else if (
//     oldState.channel == newState.channel &&
//     newChannel &&
//     member &&
//     oldCamState === newCamState &&
//     newState.selfVideo
//   ) {
//     eventType = "screenShared"
//   }
//   return eventType
// }

const memberMoved = (
  member: GuildMember,
  oldState: VoiceState,
  newState: VoiceState
) => {
  const oldChannel = oldState.channel
  const newChannel = newState.channel
  if (oldState.channel !== newState.channel) {
    if (member) {
      if (oldChannel && newChannel) {
        return true
      }
    }
  }
  return false
}

const memberJoined = (
  member: GuildMember,
  oldState: VoiceState,
  newState: VoiceState
) => {
  const oldChannel = oldState.channel
  const newChannel = newState.channel
  if (oldState.channel !== newState.channel) {
    if (member) {
      if (!oldChannel && newChannel) {
        return true
      }
    }
  }
  return false
}

const memberLeft = (
  member: GuildMember,
  oldState: VoiceState,
  newState: VoiceState
) => {
  const oldChannel = oldState.channel
  const newChannel = newState.channel
  if (oldState.channel !== newState.channel) {
    if (member) {
      if (oldChannel && !newChannel) {
        return true
      }
    }
  }
  return false
}

const cameraDisabled = (
  member: GuildMember,
  oldState: VoiceState,
  newState: VoiceState
) => {
  const newChannel = newState.channel
  const oldCamState = oldState.selfVideo ? "on" : "off"
  const newCamState = newState.selfVideo ? "on" : "off"
  if (oldState.channel == newState.channel) {
    if (newChannel && member && oldCamState !== newCamState) {
      if (!newState.selfVideo) {
        return true
      }
    }
  }
  return false
}

const cameraEnabled = (
  member: GuildMember,
  oldState: VoiceState,
  newState: VoiceState
) => {
  const newChannel = newState.channel
  const oldCamState = oldState.selfVideo ? "on" : "off"
  const newCamState = newState.selfVideo ? "on" : "off"
  if (oldState.channel == newState.channel) {
    if (newChannel && member && oldCamState !== newCamState) {
      if (newState.selfVideo) {
        return true
      }
    }
  }
  return false
}
const screenShared = (
  member: GuildMember,
  oldState: VoiceState,
  newState: VoiceState
) => {
  const newChannel = newState.channel
  const oldShareState = oldState.streaming ? "on" : "off"
  const newShareState = newState.streaming ? "on" : "off"
  if (oldState.channel == newState.channel) {
    if (newChannel && member && oldShareState !== newShareState) {
      if (newState.streaming) {
        return true
      }
    }
  }
  return false
}

const screenUnshared = (
  member: GuildMember,
  oldState: VoiceState,
  newState: VoiceState
) => {
  const newChannel = newState.channel
  const oldShareState = oldState.streaming ? "on" : "off"
  const newShareState = newState.streaming ? "on" : "off"
  if (oldState.channel == newState.channel) {
    if (newChannel && member && oldShareState !== newShareState) {
      if (!newState.streaming) {
        return true
      }
    }
  }
  return false
}

export function voiceStateEvent(oldState: VoiceState, newState: VoiceState) {
  const member = newState.member
  const userName = member?.user.tag

  if (!member) {
    return
  }

  if (userName === newState.client.user.tag || member?.user.bot) {
    // ignore myself and other bots
    return
  }
  if (memberJoined(member, oldState, newState) && newState.channel) {
    log(`${userName} joined ${newState.channel?.name}.`)
    insertVoiceChannelEvent(member, newState.channel, "join")
  }

  if (memberLeft(member, oldState, newState) && oldState.channel) {
    log(`${userName} left ${oldState.channel?.name}.`)
    insertVoiceChannelEvent(member, oldState.channel, "leave")
  }

  if (
    memberMoved(member, oldState, newState) &&
    newState.channel &&
    oldState.channel
  ) {
    log(
      `${userName} moved from ${oldState.channel?.name} to ${newState.channel?.name}.`
    )
    insertVoiceChannelEvent(member, oldState.channel, "leave")
    insertVoiceChannelEvent(member, newState.channel, "join")
  }

  if (cameraDisabled(member, oldState, newState) && newState.channel) {
    log(`${userName} camera disabled.`)
    insertVoiceChannelEvent(member, newState.channel, "cameraOff")
  }

  if (cameraEnabled(member, oldState, newState) && newState.channel) {
    log(`${userName} camera enabled.`)
    insertVoiceChannelEvent(member, newState.channel, "cameraOn")
  }

  if (screenShared(member, oldState, newState) && newState.channel) {
    log(`${userName} screen shared.`)
    insertVoiceChannelEvent(member, newState.channel, "screenShared")
  }

  if (screenUnshared(member, oldState, newState) && newState.channel) {
    log(`${userName} screen unshared.`)
    insertVoiceChannelEvent(member, newState.channel, "screenUnshared")
  }
}
