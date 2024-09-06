import { EmbedBuilder, Interaction } from "discord.js";
import { Context, sendMessageToGPT } from "services";
import { readGPTConfig } from "utils/manageGPTConfig";

export class GPT {
  private _model: string;
  private _context: Context[];
  private _upgradeText: boolean;

  constructor(model: string, context?: Context[]) {
    this._model = model;
    this._context = context ?? [];
    this._upgradeText = readGPTConfig().upgradeMessage ?? true;
  }

  get context(): Context[] {
    return this._context;
  }

  set context(context: Context[]) {
    this._context = context;
  }

  get model(): string {
    return this._model;
  }

  set model(model: string) {
    const validModels = ["gpt-4o", "gpt-4-turbo", "claude-3", "claude-3.5", "gemini-1.5"];
    if (!validModels.includes(model)) {
      throw new Error("Invalid model");
    }
    this._model = model;
  }

  get upgradeText(): boolean {
    return this._upgradeText;
  }

  set upgradeText(upgradeText: boolean) {
    if (typeof upgradeText === "boolean") {
      this._upgradeText = upgradeText;
    } else {
      throw new Error("not a boolean");
    }
  }

  /**
   * Send a message to the chatbot
   * @param message message to send
   * @returns chatbot response
   */
  public async sendMessage(message: string) {
    this.pushToContext(message, "user");
    const response = await this.retry(sendMessageToGPT, [this.model, this.context], 3);
    const decoded = this.decoderAndParser(response);
    this.pushToContext(decoded, "assistant");
    return decoded;
  }

  /**
   * Push a user or assistant message in the context array 
   * @param message 
   * @param role "assistant" or "user"
   */
  private pushToContext(message: string, role: "assistant" | "user") {
    this.context.push(
      {
        role: role,
        content: message,
        time: this.formatDate(),
        attachments: []
      }
    );
  }

  /**
   * Decode the response from the api call to icodingink
   * @param message encoded message to decode
   * @returns Decoded apicall response
   */
  private decoderAndParser(message: string) {
    let q = "";
    const Tu = message.includes("\n") ? message.split("\n") : [message];
    for (const Ct in Tu) {
      let me = Tu[Ct].trim();
      if (me !== "") {
        if (me.startsWith("{") && me.endsWith("}")) {
          q += "\n````\n" + me + "\n````\n";
        }
        if(!this.upgradeText && me.startsWith('data: dd a3 91 a3 91 d2 d2 d2 a3 91 df aa 8f 98')){
          continue;
        }
        me.startsWith("data:") && (me = me.substring(5));
        try {
          const d0 = JSON.parse(decoder(me.trim()));
          const d0Cleaned = d0.toString().replace(/\s+/g, "");
          if (d0Cleaned.startsWith("[[gpt-fun-call") && d0Cleaned.endsWith("done]]")) {
            continue;
          }
          q += d0.toString();
        } catch {
          console.error("Error parsing data");
        }
      }
    }

    function decoder(e: string) {
      const k = e.split(" ")
        , N = new Uint8Array(k.length);
      for (let q = 0; q < k.length; q++)
        N[q] = parseInt(k[q], 16) ^ 255;
      return new TextDecoder("utf-8").decode(N);
    }

    // Remove the plugin integration text in the message
    return q.replace(/\[\[gpt-fun-call[\s\S]*?done\]\]/g, "");
  }

  /**
   * Make an Embed with the lastest request 
   * @param interaction Current Interraction
   * @param usermessage Message sent by the user in the command
   * @returns embed
   */
  public makeEmbed(interaction: Interaction, usermessage: string) {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.client.user.displayName} - ${this.formatName(this.model)}`,
        iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/2048px-ChatGPT_logo.svg.png",
      })
      .setDescription(this.context[this.context.length - 1].content)
      .setColor("#00b0f4")
      .setFooter({
        text: `${interaction.user.displayName} : ${truncateMessage(usermessage)}`,
        iconURL: interaction.user.avatarURL() ?? "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg",
      });

    function truncateMessage(message: string) {
      const maxLength = 70;
      if (message.length > maxLength) {
        return message.slice(0, maxLength - 3) + "...";
      }
      return message;
    }
    return embed;
  }

  /**
   * return current Date() in the format used in the chatbot context
   * @returns string
   */
  private formatDate(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  private formatName(input: string): string {
    return input
        .split("-")
        .map((word) => word === "gpt"
            ? word.toUpperCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("-");
  }

  private async retry<T extends (...arg0: any[]) => any>(
    fn: T,
    args: Parameters<T>,
    maxTry: number,
    retryCount = 1
  ): Promise<Awaited<ReturnType<T>>> {
    const currRetry = typeof retryCount === "number" ? retryCount : 1;
    try {
      const result = await fn(...args);
      return result;
    } catch (e) {
      console.log(`Retry ${currRetry} failed.`);
      if (currRetry > maxTry) {
        console.log(`All ${maxTry} retry attempts exhausted`);
        throw e;
      }
      return this.retry(fn, args, maxTry, currRetry + 1);
    }
  }
}