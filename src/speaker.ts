import OpenSeadragon from 'openseadragon';
import { pipeline, ImageToTextPipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;


export type ScreenshotFormat = 'png' | 'jpeg' | 'webp';

export interface ZoomSpeakerOptions {
  /** Output */
  model?: string;
}

interface CaptureStage{
  canvas: HTMLCanvasElement;
}

export class OpenSeadragonZoomSpeaker {
  private readonly viewer: OpenSeadragon.Viewer;
  private pipeline: any;
  private description: string;
  private model_loaded: boolean;

  constructor(viewer: OpenSeadragon.Viewer) {
    this.viewer = viewer;
    this.description = "";
    this.pipeline = null;
    this.model_loaded = false;
  }

  async warmup(options: ZoomSpeakerOptions = {}): Promise<void> {
    // TODO - this is where user model selection can happen
    console.log("retreiving model");
    if(!this.model_loaded) {
      this.pipeline = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
      this.model_loaded = true
    } else {
      console.log("model already loaded");
    }
    console.log("got model");
  }

  /**
   * Captures the viewer as a data URL.
   * @throws {Error} If viewer is not open or canvas is unavailable
   */
  async speak(options: ZoomSpeakerOptions = {}): Promise<string> {
    const {
      model = 'Xenova/vit-gpt2-image-captioning'
    } = options;
    console.log("preparing for captioning");
    const stage = await this.prepareSpeaker();
    console.log("running captioning");
    return this.transcript(stage, options);
  }

  private ensureViewerReady(): void {
    if (!this.viewer.isOpen()) {
      throw new Error('[OpenSeadragon Zoom Speaker] Viewer is not open. Wait for the "open" event before requiring speaking.');
    }
  }

  private async prepareSpeaker(): Promise<CaptureStage> {
    await this.waitForDraw();

    const canvas = this.getCanvas();
    return { canvas };
  }

  private getCanvas(): HTMLCanvasElement {
    const canvas = this.viewer.drawer?.canvas;
    if (!canvas) {
      throw new Error('[OpenSeadragon Capture] Canvas not available. Ensure viewer is fully initialized.');
    }
    return canvas as HTMLCanvasElement;
  }

  private waitForDraw(): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        requestAnimationFrame(() => resolve());
      }, 100);

      this.viewer.addOnceHandler('animation-finish', () => {
        clearTimeout(timeout);
        requestAnimationFrame(() => resolve());
      });
      this.viewer.forceRedraw();
    });
  }

  private async captureFullImage(imageIndex: number): Promise<HTMLCanvasElement> {
    const tiledImage = this.viewer.world.getItemAt(imageIndex);
    if (!tiledImage) {
      throw new Error(`[OpenSeadragon Capture] No image at index ${imageIndex}`);
    }

    const currentBounds = this.viewer.viewport.getBounds();
    const bounds = tiledImage.getBounds();

    try {
      this.viewer.viewport.fitBounds(bounds, true);
      await this.waitForFullLoad(tiledImage);
      return this.getCanvas();
    } finally {
      this.viewer.viewport.fitBounds(currentBounds, true);
    }
  }

  private waitForFullLoad(tiledImage: OpenSeadragon.TiledImage): Promise<void> {
    if (tiledImage.getFullyLoaded()) {
      return this.waitForDraw();
    }
    return new Promise((resolve) => {
      tiledImage.addOnceHandler('fully-loaded-change', () => {
        this.waitForDraw().then(resolve);
      });
    });
  }

  private async transcript(rehearse: CaptureStage, options: ZoomSpeakerOptions = {}): Promise<string> {
    const output = await this.pipeline(rehearse.canvas);
    this.description = output[0]["generated_text"];
    console.log(this.description);
    return this.description;
  }
}

export function createZoomSpeaker(viewer: OpenSeadragon.Viewer): OpenSeadragonZoomSpeaker {
  return new OpenSeadragonZoomSpeaker(viewer);
}
