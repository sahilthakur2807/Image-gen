export class PipelineStream {
  private controller: ReadableStreamDefaultController | null = null;
  private encoder = new TextEncoder();

  constructor(controller: ReadableStreamDefaultController) {
    this.controller = controller;
  }

  send(type: string, data: any) {
    if (!this.controller) return;
    try {
      const formatted = `data: ${JSON.stringify({ type, ...data })}\n\n`;
      this.controller.enqueue(this.encoder.encode(formatted));
    } catch (e) {
      console.error("[PipelineStream] Stream write error:", e);
    }
  }

  close() {
    if (!this.controller) return;
    try {
      this.controller.close();
    } catch (e) {
      // Ignore
    }
    this.controller = null;
  }
}
