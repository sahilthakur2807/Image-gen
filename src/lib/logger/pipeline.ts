export interface PipelineStageLog {
  stage: number;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  startTime: number;
  endTime?: number;
  durationMs?: number;
  message: string;
  result?: any;
}

export class PipelineLogger {
  private stages: PipelineStageLog[] = [];
  private totalStartTime: number;

  constructor() {
    this.totalStartTime = Date.now();
    this.initStages();
  }

  private initStages() {
    const stageNames = [
      'Website Validation',
      'Firecrawl',
      'Parsing',
      'Asset Filtering',
      'Brand Knowledge',
      'Creative Brief',
      'Prompt Builder',
      'Image Generation',
      'Saving Results'
    ];
    this.stages = stageNames.map((name, idx) => ({
      stage: idx + 1,
      name,
      status: 'PENDING',
      startTime: 0,
      message: 'Pending execution'
    }));
  }

  startStage(stageNumber: number, message: string = 'Running stage...') {
    const stage = this.stages.find(s => s.stage === stageNumber);
    if (stage) {
      stage.status = 'RUNNING';
      stage.startTime = Date.now();
      stage.message = message;
    }
  }

  endStage(stageNumber: number, status: 'SUCCESS' | 'FAILED', message: string, result?: any) {
    const stage = this.stages.find(s => s.stage === stageNumber);
    if (stage) {
      stage.status = status;
      stage.endTime = Date.now();
      stage.durationMs = stage.endTime - stage.startTime;
      stage.message = message;
      stage.result = result;
      
      this.printStage(stage);
    }
  }

  private printStage(stage: PipelineStageLog) {
    const durationStr = stage.durationMs 
      ? (stage.durationMs > 1000 ? `${(stage.durationMs / 1000).toFixed(1)} sec` : `${stage.durationMs} ms`)
      : '0 ms';
      
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🌍 Stage ${stage.stage}`);
    console.log(`${stage.name}`);
    console.log(`${stage.status === 'SUCCESS' ? '✔ SUCCESS' : '❌ FAILED'}`);
    console.log(`Duration: ${durationStr}`);
    console.log(`${stage.message}`);
    if (stage.result && typeof stage.result === 'object') {
      const details = Object.entries(stage.result)
        .map(([k, v]) => {
          if (typeof v === 'object') return `${k}:\n${JSON.stringify(v, null, 2)}`;
          return `${k}: ${v}`;
        })
        .join('\n');
      if (details) console.log(details);
    }
  }

  printStart(websiteUrl: string) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🚀 PIPELINE STARTED`);
    console.log(`Website: ${websiteUrl}`);
    console.log(`Time: ${new Date().toLocaleTimeString()}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  }

  printEnd() {
    const totalTimeMs = Date.now() - this.totalStartTime;
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ PIPELINE FINISHED`);
    console.log(`Total Time: ${(totalTimeMs / 1000).toFixed(1)} sec`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  }

  getLogs() {
    return this.stages;
  }

  getTotalDuration() {
    return (Date.now() - this.totalStartTime) / 1000;
  }
}
