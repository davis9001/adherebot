# adherebot

> **Archived — this bot is no longer developed here.**
>
> The work continues in **[starspacegroup/spacebot](https://github.com/starspacegroup/spacebot)**,
> an open-source Discord bot hosted on Cloudflare and Google Cloud. Start
> there. This repository stays up, read-only, for reference.

---

## Requirements:

- MongoDB
- AWS Amazon Linux ec2 instance (or equivalent)
  - Node 20+

## Local development:

- Rename or copy .env-example to .env
- Add discord bot token etc...
- Run `yarn build` to build
- Run `yarn start` to run

## Deploying your own bot:

### With Ansible:

If you have Ansible you can use the Ansible playbooks in the `ansible` folder to deploy the bot to AWS and trigger update/restart (assuming you have an existing AWS ec2 instance with Amazon Linux).

- Copy the ansible/hosts.ini.example file to ansible/hosts.ini and fill in the variables
- Run `yarn ansible-setup` to provision the server
- Run `yarn ansible-deploy` to pull the bot code to the server and run it
- Run `yarn ansible-update` to update the bot and restart it

### Manually:

- Copy or clone this repo
- Create a mongodb instance somewhere, you can get a free one that should work for a while at mongodb.com
- Create a new AWS account (if you want to use AWS free tier EC2 for a year)
- Spin up a Linux server, I am using Amazon Linux
- Install node and optionally yarn
- Git clone the new repo
- Move the .env-example file to .env
- Fill in the discord api app ID and key, the server ID for your server, and the mongo DB user/pass/url in the .env file
- Use npm or yarn to run: `build` and `deployCommands`
- Set up systemd to start and keep the bot running as a service (there is a file called adhere-systemd.service that may help after some edits)
