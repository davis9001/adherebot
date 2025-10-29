import { affirmation } from "./text/affirmation"
import { insult } from "./text/insult"
import { say } from "./text/say"
import { whymuted } from "./text/whymuted"
import { disable } from "./utility/disable"
import { enable } from "./utility/enable"
import { setlogchannel } from "./utility/setLogChannel"
import { setintrochannel } from "./utility/setIntroChannel"
import { setadminmessageschannel } from "./utility/setAdminMessagesChannel"
import { introautodelete } from "./utility/introAutoDelete"

export const activeCommands = {
  enable,
  disable,
  whymuted,
  affirmation,
  insult,
  say,
  setlogchannel,
  setintrochannel,
  setadminmessageschannel,
  introautodelete,
}

export const activeCommandsList = Object.values(activeCommands)
