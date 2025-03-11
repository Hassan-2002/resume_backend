const fs = require('fs');
const pdf = require('pdf-parse');

async function parsePdf(filepath) {
   const dataBuffer = fs.readFileSync(filepath);
   const data = await pdf(dataBuffer);
   return data.text

}

module.exports = {parsePdf};