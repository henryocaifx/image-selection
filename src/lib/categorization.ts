/**
 * Categorizes a prompt into one of three categories: portrait, half-body, or full-body.
 * 
 * @param prompt - The AI prompt text used to generate the image.
 * @returns The category string.
 */
export function categorizePrompt(prompt: string): 'portrait' | 'half-body' | 'full-body' {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('full-body')) {
    return 'full-body';
  }
  
  if (lowerPrompt.includes('half-body')) {
    return 'half-body';
  }
  
  return 'portrait';
}
