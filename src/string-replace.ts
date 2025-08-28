import { ExtractedText } from './document-parser.js';

// Random text generator function
function generateRandomText(length: number): string {
  const words = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];
  
  let result = '';
  let currentLength = 0;
  
  while (currentLength < length) {
    const word = words[Math.floor(Math.random() * words.length)];
    
    if (currentLength === 0) {
      // İlk kelimeyi büyük harfle başlat
      result = word.charAt(0).toUpperCase() + word.slice(1);
    } else {
      result += ' ' + word;
    }
    
    currentLength = result.length;
    
    // Eğer uzunluk hedeften fazla olursa, son kelimeyi kısalt
    if (currentLength > length) {
      result = result.substring(0, length - 1) + '.';
      break;
    }
  }
  
  // Eğer nokta ile bitmiyor ve yeterli uzunlukta ise nokta ekle
  if (!result.endsWith('.') && result.length < length) {
    result += '.';
  }
  
  return result;
}

export function replaceExtractedTexts(
  sourceContent: string, 
  extractedTexts: ExtractedText[]
): string {
  let result = sourceContent;
  
  // Liste itemlerini absoluteStart pozisyonuna göre tersten sırala
  // Böylece sondan başlayarak replace ederiz ve pozisyonlar bozulmaz
  const sortedList = [...extractedTexts].sort((a, b) => b.absoluteStart - a.absoluteStart);

  for (const item of sortedList) {
    const originalText = result.slice(item.absoluteStart, item.absoluteEnd);
    
    if (originalText) {
      // Orijinal text uzunluğunda random text generate et
      const randomText = (item as any).suggestedKey || generateRandomText(originalText.length);
      
      // Replace string
      result = result.slice(0, item.absoluteStart) + randomText + result.slice(item.absoluteEnd);
    }
  }

  return result;
}
