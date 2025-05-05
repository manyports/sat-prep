const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const globalData = {
  english: {
    'standard-english-conventions': {
      easy: [],
      medium: [],
      hard: []
    }
  },
  math: {
    // placeholder for math content that will be added later
  }
};

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\u0000/g, '') 
    .replace(/\s+/g, ' ')
    .trim();
}

async function parsePDF(filePath, difficulty) {
  console.log(`Parsing ${difficulty} difficulty PDF: ${filePath}`);
  
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;
    const questions = [];
    const questionBlocks = text.split('Question ID').filter(block => block.trim() !== '');
    
    for (const block of questionBlocks) {
      try {
        const idMatch = block.match(/ID: ([a-f0-9]+)/);
        const id = idMatch ? idMatch[1] : 'unknown';
        let questionText = '';
        const questionTextMatch = block.match(/[a-f0-9]+\n([\s\S]*?)Which choice/);
        if (questionTextMatch) {
          questionText = questionTextMatch[1].trim();
        }

        const blankMatch = questionText.match(/______/);
        const hasBlank = blankMatch !== null;
        const choices = {};
        const choiceMatches = block.match(/[A-D]\. (.*?)(?=\n[A-D]\.|ID:|Correct Answer:|$)/gs);
        
        if (choiceMatches) {
          choiceMatches.forEach(choiceText => {
            const letter = choiceText.charAt(0);
            const text = cleanText(choiceText.substring(3));
            choices[letter] = text;
          });
        }

        const answerMatch = block.match(/Correct Answer: ([A-D])/);
        const correctAnswer = answerMatch ? answerMatch[1] : '';

        let rationale = '';
        const rationaleMatch = block.match(/Rationale\n([\s\S]*?)(?=Question Difculty|$)/);
        if (rationaleMatch) {
          rationale = cleanText(rationaleMatch[1]);
        }
        const question = {
          id,
          questionText: cleanText(questionText),
          hasBlank,
          choices,
          correctAnswer,
          correctChoiceText: choices[correctAnswer] || '',
          rationale
        };
        
        questions.push(question);
      } catch (error) {
        console.error(`Error processing question block: ${error.message}`);
      }
    }
    
    return questions;
  } catch (error) {
    console.error(`Error parsing PDF ${filePath}:`, error);
    return [];
  }
}
async function processAllPDFs() {
  const pdfDir = path.join(__dirname, '../parse-files');
  try {
    const easyPdfPath = path.join(pdfDir, 'Standard English Conventions Answers (easy).pdf');
    globalData.english['standard-english-conventions'].easy = await parsePDF(easyPdfPath, 'easy');
    const mediumPdfPath = path.join(pdfDir, 'Standard English Conventions Answers (medium).pdf');
    globalData.english['standard-english-conventions'].medium = await parsePDF(mediumPdfPath, 'medium');
    const hardPdfPath = path.join(pdfDir, 'Standard English Conventions Answers (hard).pdf');
    globalData.english['standard-english-conventions'].hard = await parsePDF(hardPdfPath, 'hard');
    fs.writeFileSync(
      path.join(__dirname, '../data/sat-questions.json'),
      JSON.stringify(globalData, null, 2)
    );
    
    console.log('All PDFs processed successfully!');
    console.log(`Easy questions: ${globalData.english['standard-english-conventions'].easy.length}`);
    console.log(`Medium questions: ${globalData.english['standard-english-conventions'].medium.length}`);
    console.log(`Hard questions: ${globalData.english['standard-english-conventions'].hard.length}`);
    console.log(`Total questions: ${
      globalData.english['standard-english-conventions'].easy.length + 
      globalData.english['standard-english-conventions'].medium.length + 
      globalData.english['standard-english-conventions'].hard.length
    }`);
  } catch (error) {
    console.error('Error processing PDFs:', error);
  }
}

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

processAllPDFs(); 