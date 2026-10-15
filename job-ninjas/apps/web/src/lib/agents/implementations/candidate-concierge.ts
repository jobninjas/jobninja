import { AgentDefinition } from '../types';
import { generateStructuredOutput } from '../../ai/client';
import { ConciergeItinerarySchema } from '../schemas/concierge-itinerary';
import { CandidateDecision } from '../schemas/candidate-decision';
import { ophelia } from '../../ophelia/client';

export const CandidateConciergeAgent: AgentDefinition = {
  id: 'agent-concierge',
  name: 'Candidate Concierge Agent',
  description: 'Searches real Ophelia hotel options and recommends travel accommodations for hired candidates.',
  requiredInputs: [], // No longer strictly requires CandidateDecision, depends on Candidate Stage
  execute: async (context) => {
    const { candidate, role } = context;

    // We check the real Candidate stage from DB
    if (candidate.stage !== 'OFFER' && candidate.stage !== 'HIRED') {
      throw new Error("Candidate Concierge can only be run for candidates in 'OFFER' or 'HIRED' stage.");
    }

    // 1. Fetch real hotel options from Ophelia API
    const location = role.location || 'New York, NY';
    const budget = candidate.travelBudget || 800;
    
    // Calculate dummy check_in and check_out dates for demo
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7); // Next week
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 9); 
    
    const checkInStr = checkIn.toISOString().split('T')[0];
    const checkOutStr = checkOut.toISOString().split('T')[0];

    const hotelResults = await ophelia.searchVenues({
      vertical: 'travel',
      providers: ['hotels'],
      location: location,
      check_in: checkInStr,
      check_out: checkOutStr,
      party_size: 1,
      rooms: 1,
      term: 'hotel'
    });

    // We take top 5 to avoid blowing up context window
    const availableHotels = hotelResults.slice(0, 5);

    // 2. Ask LLM to review real hotel options and pick the best one
    const systemPrompt = `You are an executive assistant and concierge agent for JobNinjas, powered by the Ophelia OS.
Your task is to organize an onboarding trip for a newly hired candidate.
The candidate lives in ${candidate.location || 'Unknown'} and the job is located in ${location}.
The budget is $${budget}.

We have queried the Ophelia API and found these REAL hotel options:
${JSON.stringify(availableHotels, null, 2)}

Generate a complete itinerary. YOU MUST ONLY RECOMMEND A HOTEL FROM THE PROVIDED REAL OPTIONS. Do not invent a hotel.
Also include flight details and a welcome dinner reservation (these can be assumed/simulated for now, but the hotel MUST be from the provided list).
Explain why you selected the hotel based on the budget and location.`;

    const input = `Plan the trip for ${candidate.firstName} ${candidate.lastName}. Pick the best hotel from the real Ophelia results provided. Keep total costs within $${budget}.`;

    const itinerary = await generateStructuredOutput({
      systemPrompt,
      input,
      schema: ConciergeItinerarySchema,
      modelName: 'openai/gpt-oss-120b',
    });

    // Let's attach the raw Ophelia results to the artifact so the UI can render them for human approval!
    const artifactData = {
      ...itinerary,
      opheliaResults: availableHotels, // Add real options for the UI
    };

    return {
      outputPayload: artifactData,
      artifacts: [
        {
          type: 'ConciergeItinerary',
          data: artifactData,
        },
      ],
      events: [
        {
          type: 'travel.hotel_searched',
          payload: { location, resultsFound: availableHotels.length },
        },
      ],
    };
  },
};
