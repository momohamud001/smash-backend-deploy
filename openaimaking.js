const express = require('express');
const OpenAI = require('openai');
const axios = require('axios');
const app = express();

const openai = new OpenAI({
    apiKey: "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",
});

// List of case studies
const caseStudies = [
  "4Star Hotel Mariott",
  "Aircraft MFG Boeing",
  "Airline AlaskaAir",
  "Arts&MusicFestival LiveNation",
  "AthleticApparel Nike",
  "Automobile Industry and Toyota",
  "BoutiqueClothing TommyBahama",
  "BulkWarehouse Costco",
  "CameraGear B&H Photo",
  "City Transit",
  "CoffeeShop Starbucks",
  "ComputerShack AppleStore",
  "ConventionCenter Seattle",
  "CruiseShip HollandAmerica",
  "FashionClothing Nordstrom",
  "FreightForwarding",
  "Golf CourseMgt Oki",
  "GuitarMFG Fender",
  "HealthFitness 24 Hour",
  "HigherEd UW",
  "HomeGardenNursery Swansons",
  "HomeMaintenance HomeDepot",
  "IndustryConvention NAMM",
  "MobilePhone TMobile",
  "MusicStreaming Spotify",
  "OnlineGamer Valve",
  "OutdoorActiveGear REI",
  "ParcelDelivery UPS",
  "PetStore Petco",
  "RealEstate Zillow",
  "RetailGuitarShop GuitarCenter",
  "RockTour AEG",
  "SkiResort Whistler",
  "SkiSnowboard K2",
  "Steakhouse Ruths",
  "StockPhoto GettyImages",
  "STUDY HealthCare Hospital",
  "STUDY StadiumAnalytics",
  "Superstore Amazon",
  "Winery ChateauSteMichelleEstates",
  "WorldTravel Expedia",
  "Youth Sports American Athletic Union"
];

app.get("/getResponse", async(req, res) => {
    try {
        // Fetch user details from the API
        const userDetailsResponse = await axios.get('http://localhost:3005/user/details');
        const users = userDetailsResponse.data.data;

        // Array to hold generated case studies for each user
        const userCaseStudies = [];

        // Loop through each user
        for (const user of users) {
            // Get the user's answers
            const userAnswers = user.answers;

            // Extract keywords or themes from user's answers
            const userKeywords = getUserKeywords(userAnswers);

            // Calculate relevance scores for each case study
            const relevanceScores = {};
            for (const caseStudy of caseStudies) {
                const caseStudyKeywords = getCaseStudyKeywords(caseStudy);
                const score = calculateRelevance(userKeywords, caseStudyKeywords);
                relevanceScores[caseStudy] = score;
            }

            // Sort case studies by relevance scores in descending order
            const sortedCaseStudies = Object.keys(relevanceScores).sort((a, b) => relevanceScores[b] - relevanceScores[a]);

            // Select top three case studies with highest relevance scores
            const topThreeCaseStudies = sortedCaseStudies.slice(0, 3);

            // Add the top three case studies for this user
            userCaseStudies.push({ userId: user.user_id, caseStudies: topThreeCaseStudies });
        }

        // Send back the generated case studies for each user
        res.json(userCaseStudies);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Function to extract keywords or themes from user's answers
function getUserKeywords(userAnswers) {
    const keywords = [];
    // Iterate through each answer
    userAnswers.forEach(answer => {
        // Check if the answer is not skipped and has keywords
        if (!answer.is_skipped && answer.keywords && answer.keywords.length > 0) {
            // Extract keywords from the answer
            answer.keywords.forEach(keyword => {
                // Add each keyword to the keywords array
                keywords.push(keyword);
            });
        }
    });
    return keywords;
}

async function generateKeywordsFromText(text) {
  try {
      // Make a request to OpenAI ChatGPT API to generate keywords based on the text
      const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{"role": "user", "content": text}],
          max_tokens: 100
      });
      
      // Extract and return the keywords from the response
      return response.data.choices[0].text.trim().split("\n");
  } catch (error) {
      console.error("Error generating keywords from text:", error);
      return [];
  }
}

async function getCaseStudyKeywords(caseStudyTitles) {
  const allKeywords = [];

  // Loop through each case study title
  for (const title of caseStudyTitles) {
      // Generate keywords from the title using ChatGPT
      const keywords = await generateKeywordsFromText(title);
      // Add the generated keywords to the list of all keywords
      allKeywords.push(...keywords);
  }

  return allKeywords;
}

// Function to calculate relevance score between user's keywords and case study keywords
function calculateRelevance(userKeywords, caseStudyKeywords) {
  // Initialize relevance score
  let relevanceScore = 0;

  // Iterate through user keywords
  userKeywords.forEach(userKeyword => {
      // If the user keyword is found in the case study keywords, increment relevance score
      if (caseStudyKeywords.includes(userKeyword)) {
          relevanceScore++;
      }
  });

  // Normalize relevance score by dividing by the total number of case study keywords
  // This ensures the relevance score is between 0 and 1
  const totalCaseStudyKeywords = caseStudyKeywords.length;
  if (totalCaseStudyKeywords > 0) {
      relevanceScore /= totalCaseStudyKeywords;
  }

  return relevanceScore;
}

app.listen(3001, () => { 
    console.log("api end point set up on http://localhost:3001");
});
