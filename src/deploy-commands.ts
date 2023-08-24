import { REST, Routes } from "discord.js"
import fs from "node:fs"
import path from "node:path"
import * as dotenv from "dotenv"
dotenv.config()
import { setwarntime } from "./commands/utility/setWarnTime"
import { setkicktime } from "./commands/utility/setKickTime"
import { settimeout } from "./commands/utility/setTimeout"
import { settimeoutminutes } from "./commands/utility/setTimeoutMinutes"

const clientId = process.env.DISCORD_APP_ID
const guildId = process.env.DISCORD_GUILD_ID
const token = process.env.DISCORD_BOT_TOKEN

// const commands: string[] = []
// // Grab all the command files from the commands directory you created earlier
// const foldersPath = path.join(__dirname, "commands")
// const commandFolders = fs.readdirSync(foldersPath)

// const commands = { setwarntime, setkicktime, settimeout, settimeoutminutes }
const commands = [setwarntime, setkicktime, settimeout, settimeoutminutes].map(
  (command) => command.command.toJSON()
)

// for (const command of commands) {
//   // @ts-ignore
//   client.commands.set(command.data.toJSON())
// }

// for (const folder of commandFolders) {
//   // Grab all the command files from the commands directory you created earlier
//   const commandsPath = path.join(foldersPath, folder)
//   const commandFiles = fs
//     .readdirSync(commandsPath)
//     .filter((file) => file.endsWith(".js"))
//   // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment

//   for (const file of commandFiles) {
//     const filePath = path.join(commandsPath, file)
//     const command = require(filePath)
//     if (command in command) {
//       commands.push(command.data.toJSON())
//     } else {
//       console.log(
//         `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
//       )
//     }
//   }
// }

// Construct and prepare an instance of the REST module
// @ts-ignore
const rest = new REST().setToken(token)

// and deploy your commands!
;(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    )

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      // @ts-ignore
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    )

    console.log(
      // @ts-ignore
      `Successfully reloaded ${data.length} application (/) commands.`
    )
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error)
  }
})()