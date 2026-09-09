import { ObjectId } from "mongodb"

export default class IntroChannelSetting {
  constructor(
    public guildId: string,
    public introChannelId: string,
    public adminMessagesChannelId: string,
    public autoDeleteEnabled: boolean,
    public id?: ObjectId
  ) {}
}
