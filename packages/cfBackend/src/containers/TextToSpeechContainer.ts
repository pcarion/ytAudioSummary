import { DurableObject } from "cloudflare:workers";

export class TextToSpeechContainer extends DurableObject<Env> {
  container: globalThis.Container;
  monitor?: Promise<unknown>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.container = ctx.container!;
    void this.ctx.blockConcurrencyWhile(async () => {
      if (!this.container.running)
        this.container.start({
          enableInternet: true,
        });
      this.monitor = this.container
        .monitor()
        .then(() => console.log("Container exited?"));
    });
  }

  async init() {
    console.log("Starting container");
  }

  async health() {
    return await this.container
      .getTcpPort(8080)
      .fetch("http://container/_health");
  }

  async destroy() {
    await this.ctx.container?.destroy();
    await this.ctx.storage.deleteAll();
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.sync();
    this.ctx.abort();
  }

  async fetch(req: Request): Promise<Response> {
    return await this.container
      .getTcpPort(8080)
      .fetch("http://container/process", {
        method: "POST",
        body: req.body,
      });
  }
}
