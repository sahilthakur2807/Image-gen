
export interface CreativeBrief {
  campaign: {
    objective: string;
    platform: string;
    contentType: string;
  };
  audience: {
    primary: string;
    secondary: string;
  };
  message: {
    coreMessage: string;
    headlineDirection: string;
    cta: string;
  };
  visual: {
    style: string;
    layout: string;
    composition: string;
    imageFocus: string;
    priorityAssets: string[];
    colorUsage: Record<string, string>;
    typography: Record<string, string>;
  };
  generationGoal: string;
  imagePrompt?: string; // Storing the generated prompt for image generation
}

export interface CreativeBriefRequest {
  domain: string;
  userRequest: string;
}
