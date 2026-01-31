import * as mobileAppPrompts from './mobile-app';
import * as presentationPrompts from './presentation';

export class PromptManager {
  static getPrompts(designType: string) {
    const normalizedType = designType.toLowerCase();
    
    if (normalizedType.includes('presentation') || normalizedType === 'presentation') {
      return presentationPrompts;
    }
    
    // Default to mobile app for 'mobile_app', 'website' (for now), and others
    return mobileAppPrompts;
  }
}
