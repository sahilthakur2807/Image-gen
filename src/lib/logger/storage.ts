import fs from 'fs';
import path from 'path';

export interface SnapshotPayload {
  crawl?: any;
  filteredAssets?: any;
  brandKnowledge?: any;
  creativeBrief?: any;
  imagePrompt?: any;
  generation?: any;
  generatedImage?: string; // base64 data URI or remote URL
  pipelineLog?: any;
}

export function saveGenerationSnapshots(generationId: string, data: SnapshotPayload): string {
  const generationsDir = path.join(process.cwd(), 'generations');
  if (!fs.existsSync(generationsDir)) {
    fs.mkdirSync(generationsDir, { recursive: true });
  }

  // Formatting YYYYMMDD-HHMMSS out of the timestamp if desired, or just use generationId
  const folderName = `generation-${generationId}`;
  const targetDir = path.join(generationsDir, folderName);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const writeJson = (filename: string, content: any) => {
    if (content) {
      fs.writeFileSync(path.join(targetDir, filename), JSON.stringify(content, null, 2), 'utf8');
    }
  };

  writeJson('crawl.json', data.crawl || {});
  writeJson('filtered-assets.json', data.filteredAssets || {});
  writeJson('brand-knowledge.json', data.brandKnowledge || {});
  writeJson('creative-brief.json', data.creativeBrief || {});
  writeJson('image-prompt.json', data.imagePrompt || {});
  writeJson('generation.json', data.generation || {});
  writeJson('pipeline-log.json', data.pipelineLog || {});

  // Save generated image
  if (data.generatedImage) {
    try {
      if (data.generatedImage.startsWith('data:image')) {
        const parts = data.generatedImage.split(',');
        const base64Data = parts[1];
        const format = parts[0].split(';')[0].split('/')[1] || 'png';
        fs.writeFileSync(
          path.join(targetDir, `generated-image.${format === 'jpeg' ? 'jpg' : format}`), 
          Buffer.from(base64Data, 'base64')
        );
      } else {
        // Text URL file fallback
        fs.writeFileSync(path.join(targetDir, 'generated-image-url.txt'), data.generatedImage, 'utf8');
      }
    } catch (err) {
      console.error("[Storage] Failed to write image payload to generations folder:", err);
    }
  }

  return targetDir;
}
