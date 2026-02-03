import * as mobileAppPrompts from './mobile-app';

export class PromptManager {
  static getPrompts(designType: string) {
    // Only return mobile app prompts as presentation is removed
    return mobileAppPrompts;
  }
  
  static getDesignSystemInstructions() {
    return mobileAppPrompts.designSystemInstructions;
  }
}
