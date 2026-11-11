/**
 * Merges variables like {name} into template text strings.
 * Spec: Part A3, B10
 */

export function mergeTemplateText(templateText: string, variables: { name?: string; [key: string]: string | undefined }): string {
  if (!templateText) return '';
  
  let result = templateText;
  const nameVal = (variables.name || '').trim();

  // Replace {name}, {Name}, {NAME}
  result = result.replace(/\{name\}/gi, nameVal || 'Friend');

  // Replace other arbitrary variables if supplied
  Object.keys(variables).forEach((key) => {
    if (key !== 'name') {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      result = result.replace(regex, variables[key] || '');
    }
  });

  return result;
}

export function generateDefaultWhatsAppMessage(cardTitle: string, cardDate?: string, cardVenue?: string): string {
  let msg = `Warm greetings {name}! 🌟\n\n`;
  msg += `You are specially invited to: *${cardTitle || 'our upcoming event'}*.\n`;
  if (cardDate) msg += `📅 Date & Time: ${cardDate}\n`;
  if (cardVenue) msg += `📍 Venue: ${cardVenue}\n`;
  msg += `\nPlease see the invitation card attached above. Looking forward to having you!`;
  return msg;
}
