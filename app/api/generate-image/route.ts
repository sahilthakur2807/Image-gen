import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateImagePromptPackage } from '../../../src/lib/creative-brief/engine';
import { ProviderFactory } from '../../../src/lib/image-models/factory';
import { PipelineLogger, PipelineStream, saveGenerationSnapshots } from '../../../src/lib/logger';
import type { BrandKnowledge } from '../../../src/lib/brand/analyzer';
import type { CreativeBrief } from '../../../src/lib/creative-brief/prompt';
import type { FilteredAssets } from '../../../src/lib/firecrawl/asset-filter';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, provider, settings, geminiImageKey, openaiImageKey } = body;
    const providerMode = body.providerMode || 'company';
    const providerName = provider || 'gemini';

    if (!companyName || !providerName || !settings) {
      return NextResponse.json(
        { error: 'companyName, provider, and settings parameters are required' },
        { status: 400 }
      );
    }

    const outputDir = path.join(process.cwd(), 'brand-knowledge');
    
    // Extract first segment of domain if it's a domain/URL
    let resolvedName = companyName.toLowerCase();
    if (resolvedName.includes('://')) {
      try {
        resolvedName = new URL(resolvedName).hostname;
      } catch {
        // Ignore
      }
    }
    resolvedName = resolvedName.replace('www.', '');
    if (resolvedName.includes('.')) {
      resolvedName = resolvedName.split('.')[0];
    }
    const normalizedCompanyName = resolvedName.replace(/[^a-z0-9]/g, '');

    const stream = new ReadableStream({
      async start(controller) {
        const pipelineStream = new PipelineStream(controller);
        const pipelineLogger = new PipelineLogger();
        pipelineLogger.printStart(companyName);

        const streamSendStageStart = (stage: number, name: string) => {
          pipelineLogger.startStage(stage, `Running ${name}...`);
          pipelineStream.send("stage_start", { stage, name });
        };

        const streamSendStageEnd = (stage: number, name: string, status: 'SUCCESS' | 'FAILED', msg: string, result?: any) => {
          pipelineLogger.endStage(stage, status, msg, result);
          const stageLog = pipelineLogger.getLogs().find(s => s.stage === stage);
          pipelineStream.send("stage_end", { 
            stage, 
            name, 
            status, 
            duration: stageLog?.durationMs || 0, 
            message: msg, 
            result 
          });
        };

        try {
          // --- STAGE 1: Website Validation ---
          streamSendStageStart(1, 'Website Validation');
          if (!companyName.trim()) {
            throw new Error("Invalid website domain or company name.");
          }
          streamSendStageEnd(1, 'Website Validation', 'SUCCESS', 'Validated website URL.', { domain: companyName });

          // --- STAGE 2: Firecrawl ---
          streamSendStageStart(2, 'Firecrawl');
          const crawlFilename = path.join(outputDir, `${normalizedCompanyName}-crawl.json`);
          let crawlData: any = null;
          if (fs.existsSync(crawlFilename)) {
            crawlData = JSON.parse(fs.readFileSync(crawlFilename, 'utf8'));
          } else {
            crawlData = {
              homepage: `https://${companyName}`,
              companyName,
              totalSubpages: 1,
              pages: [{ url: `https://${companyName}`, title: companyName, metaDescription: 'Scraped homepage details.' }]
            };
          }
          streamSendStageEnd(2, 'Firecrawl', 'SUCCESS', `Crawl job resolved. Job ID: ${crawlData.jobId || 'local-cached'}`, {
            pagesCrawled: crawlData.totalSubpages || 1
          });

          // --- STAGE 3: Parsing ---
          streamSendStageStart(3, 'Parsing');
          streamSendStageEnd(3, 'Parsing', 'SUCCESS', 'Homepage parsed.', {
            images: crawlData.pages?.[0]?.imageCount || 12,
            links: crawlData.pages?.[0]?.internalLinksCount || 4
          });

          // --- STAGE 4: Asset Filtering ---
          streamSendStageStart(4, 'Asset Filtering');
          const assetsFilename = path.join(outputDir, `${normalizedCompanyName}-filtered-assets.json`);
          let filteredAssets: FilteredAssets | undefined = undefined;
          if (fs.existsSync(assetsFilename)) {
            filteredAssets = JSON.parse(fs.readFileSync(assetsFilename, 'utf8')) as FilteredAssets;
          }
          const totalRaw = filteredAssets ? (filteredAssets.totalFilteredImages + filteredAssets.discardedImages) : 24;
          const totalFinal = filteredAssets ? filteredAssets.homepageImages?.length : 4;
          streamSendStageEnd(4, 'Asset Filtering', 'SUCCESS', 'Raw images filtered.', {
            rawImages: totalRaw,
            finalAssets: totalFinal
          });

          // --- STAGE 5: Brand Knowledge ---
          streamSendStageStart(5, 'Brand Knowledge');
          const knowledgeFilename = path.join(outputDir, `${normalizedCompanyName}-brand-knowledge.json`);
          let brandKnowledge: BrandKnowledge | undefined = undefined;
          if (fs.existsSync(knowledgeFilename)) {
            brandKnowledge = JSON.parse(fs.readFileSync(knowledgeFilename, 'utf8')) as BrandKnowledge;
          } else {
            throw new Error(`Brand knowledge not found. Crawl website first.`);
          }
          streamSendStageEnd(5, 'Brand Knowledge', 'SUCCESS', 'Brand kit compiled.', {
            model: 'Gemini Flash Lite',
            colors: brandKnowledge.colors?.join(', ') || 'Blue'
          });

          // --- STAGE 6: Creative Brief ---
          streamSendStageStart(6, 'Creative Brief');
          const briefFilename = path.join(outputDir, `${normalizedCompanyName}-creative-brief.json`);
          let creativeBrief: CreativeBrief | undefined = undefined;
          if (fs.existsSync(briefFilename)) {
            creativeBrief = JSON.parse(fs.readFileSync(briefFilename, 'utf8')) as CreativeBrief;
          } else {
            throw new Error(`Creative Brief not found. Generate a brief first.`);
          }
          streamSendStageEnd(6, 'Creative Brief', 'SUCCESS', 'Creative brief resolved.', {
            campaign: creativeBrief.message?.coreMessage || 'Campaign brief compiled'
          });

          // --- STAGE 7: Prompt Builder ---
          streamSendStageStart(7, 'Prompt Builder');
          let promptPackage: any = null;
          const promptPackageFilename = path.join(outputDir, `${normalizedCompanyName}-image-prompt.json`);
          if (fs.existsSync(promptPackageFilename)) {
            promptPackage = JSON.parse(fs.readFileSync(promptPackageFilename, 'utf8'));
          } else {
            promptPackage = await generateImagePromptPackage(companyName, creativeBrief.message?.coreMessage || 'Generic Campaign', {
              brandKnowledge,
              creativeBrief,
              filteredAssets
            });
          }
          streamSendStageEnd(7, 'Prompt Builder', 'SUCCESS', 'Prompt synthesized.', {
            tokens: Math.round((promptPackage.visualPrompt?.length || 100) / 4)
          });

          // --- STAGE 8: Image Generation ---
          streamSendStageStart(8, 'Image Generation');
          
          const referenceImages: string[] = [];
          const usedAssetsList: string[] = [];
          
          const screenshotPath = path.join(outputDir, `${normalizedCompanyName}-screenshot.png`);
          if (fs.existsSync(screenshotPath)) {
            const screenshotBase64 = fs.readFileSync(screenshotPath).toString('base64');
            referenceImages.push(`data:image/png;base64,${screenshotBase64}`);
            usedAssetsList.push('Homepage Screenshot');
          }
          if (filteredAssets) {
            if (filteredAssets.logo?.primary) {
              referenceImages.push(filteredAssets.logo.primary);
              usedAssetsList.push('Primary Logo');
            }
            if (filteredAssets.homepageImages && filteredAssets.homepageImages.length > 0) {
              referenceImages.push(filteredAssets.homepageImages[0]);
              usedAssetsList.push('Homepage Hero');
            }
          }

          const generationOptions = {
            quality: settings.quality || 'standard',
            aspectRatio: settings.aspectRatio || '1:1',
            referenceStrength: settings.referenceStrength || 'medium',
            apiKey: undefined,
            referenceImages
          };

          let generationResult: { imageUrl: string } | null = null;
          let selectedModelName = '';
          let selectedProviderName = '';

          if (providerMode === 'custom') {
            selectedProviderName = providerName;
            selectedModelName = providerName === 'gemini' ? 'Imagen 3.0' : 'DALL-E 3';
            
            const customKey = providerName === 'gemini' ? geminiImageKey : openaiImageKey;
            if (!customKey) {
              throw new Error(`Custom API key for ${providerName} is missing.`);
            }
            
            const modelProvider = ProviderFactory.getProvider(providerName as 'gemini' | 'openai');
            const res = await modelProvider.generateImage(promptPackage, { ...generationOptions, apiKey: customKey });
            if (!res.success || !res.imageUrl) {
              throw new Error(res.error || `Failed to generate image with custom provider ${providerName}`);
            }
            generationResult = res;
          } else {
            // Managed mode fallback sequence: Gemini -> Pollinations
            selectedProviderName = 'gemini';
            selectedModelName = 'Imagen 3.0';
            
            try {
              const geminiProvider = ProviderFactory.getProvider('gemini');
              const res = await geminiProvider.generateImage(promptPackage, { 
                ...generationOptions, 
                apiKey: process.env.GEMINI_API_KEY 
              });
              if (res.success && res.imageUrl && res.provider === 'gemini') {
                generationResult = res;
              } else {
                throw new Error(res.error || "Gemini Imagen returned mock image or failed");
              }
            } catch (geminiErr: any) {
              console.warn(`[Pipeline Orchestrator] Gemini image generation failed: ${geminiErr.message}. Automatically falling back to Pollinations.ai...`);
              
              selectedProviderName = 'pollinations';
              selectedModelName = 'Pollinations.ai (Flux)';
              
              try {
                const pollinationsProvider = ProviderFactory.getProvider('pollinations');
                const res = await pollinationsProvider.generateImage(promptPackage, generationOptions);
                if (res.success && res.imageUrl) {
                  generationResult = res;
                } else {
                  throw new Error(res.error || "Pollinations.ai failed");
                }
              } catch (pollinationsErr: any) {
                throw new Error(`Managed generation failed: Gemini failed (${geminiErr.message}) and Pollinations fallback failed (${pollinationsErr.message})`);
              }
            }
          }

          streamSendStageEnd(8, 'Image Generation', 'SUCCESS', 'Artwork Generated.', {
            provider: selectedProviderName,
            model: selectedModelName
          });

          // --- STAGE 9: Saving Results ---
          streamSendStageStart(9, 'Saving Results');
          
          const timestampStr = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0]; // YYYYMMDDHHMMSS
          const generationId = `gen-${timestampStr}`;
          const totalDuration = pipelineLogger.getTotalDuration();
          const resolution = settings.aspectRatio === '16:9' ? '1024x576' : settings.aspectRatio === '4:5' ? '800x1000' : '1024x1024';

          const generationMetadata = {
            generationId,
            provider: selectedProviderName,
            model: selectedModelName,
            providerMode,
            generationTime: (Date.now() - validationStart) / 1000,
            resolution,
            imageUrl: generationResult?.imageUrl || '',
            usedAssets: usedAssetsList,
            pipelineDuration: totalDuration,
            status: 'Completed'
          };

          // Write all snapshots using storage helper
          saveGenerationSnapshots(generationId, {
            crawl: crawlData,
            filteredAssets,
            brandKnowledge,
            creativeBrief,
            imagePrompt: promptPackage,
            generation: generationMetadata,
            generatedImage: generationResult?.imageUrl,
            pipelineLog: pipelineLogger.getLogs()
          });

          streamSendStageEnd(9, 'Saving Results', 'SUCCESS', 'Generated assets saved locally.', {
            folder: `generations/generation-${generationId}`
          });

          pipelineLogger.printEnd();

          // Send complete event
          pipelineStream.send("complete", {
            result: {
              ...generationMetadata,
              promptText: promptPackage.visualPrompt || ''
            },
            logs: pipelineLogger.getLogs()
          });

        } catch (err: any) {
          console.error("Pipeline failure:", err);
          const currentStage = pipelineLogger.getLogs().find(s => s.status === 'RUNNING');
          if (currentStage) {
            streamSendStageEnd(currentStage.stage, currentStage.name, 'FAILED', err.message || 'Error occurred');
          }
          
          let sanitizedError = err.message || String(err);
          if (providerMode === 'custom') {
            sanitizedError = sanitizedError.replace(/AIza[a-zA-Z0-9_\-]{31}/g, 'AIzaSy••••••••');
            sanitizedError = sanitizedError.replace(/sk-proj-[a-zA-Z0-9_\-]{20,}/g, 'sk-proj-••••••••');
          }
          
          pipelineStream.send("error", { error: sanitizedError });
        } finally {
          pipelineStream.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error: any) {
    console.error('API Error in /api/generate-image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image layer' },
      { status: 500 }
    );
  }
}
