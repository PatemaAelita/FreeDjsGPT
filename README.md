#### DiscordJS GPT

A DiscordJS bot using [Icoding GPT](https://lite.icoding.ink).

--- 

### .env

`DISCORD_TOKEN` : discord bot token

`DISCORD_CLIENT_ID` : discord bot client id

`ICODING_GPT_TOKEN :`
>You'll first need to create an account on [Icoding](https://lite.icoding.ink), go to any conversation, send a message and retrieve your token in the developer console, network tab, message and search for "Autorization" in Request Headers. (youll get something instead of "null", do not copy "Bearer" with the token)

![developper tool ](https://i.ibb.co/zrrFpdX/Capture-d-cran-2024-09-08-151458.png)

---

`npm run build` to generate the js file in ./dist and then `npm run start` to start the bot

At first the bot will generate a GPTconfig.json file, you can configure it by editing the file  or by using `/configure gpt` from Discord, it will allow you to remove the "you need to pay message" and configure the prompt.