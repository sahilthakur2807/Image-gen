import fs from 'fs';
import path from 'path';

export function getGenerationsHistory(): any[] {
  try {
    const generationsDir = path.join(process.cwd(), 'generations');
    if (!fs.existsSync(generationsDir)) return [];

    const folders = fs.readdirSync(generationsDir).filter(f => {
      const fullPath = path.join(generationsDir, f);
      return f.startsWith('generation-') && fs.statSync(fullPath).isDirectory();
    });

    const history: any[] = [];
    for (const folder of folders) {
      const metaPath = path.join(generationsDir, folder, 'generation.json');
      if (fs.existsSync(metaPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          history.push(metadata);
        } catch {
          // Ignore parse errors
        }
      }
    }

    // Sort by timestamp if available or folder names descending
    return history.sort((a, b) => {
      const timeA = a.generationId || '';
      const timeB = b.generationId || '';
      return timeB.localeCompare(timeA);
    });
  } catch (err) {
    console.error("[History] Error reading generations folders:", err);
    return [];
  }
}
