import { z } from 'zod';

export const ConciergeItinerarySchema = z.object({
  status: z.enum(['BOOKED', 'PENDING_APPROVAL', 'CANCELLED']),
  flightDetails: z.object({
    airline: z.string(),
    flightNumber: z.string(),
    departure: z.string(),
    arrival: z.string(),
    cost: z.number(),
  }).optional(),
  hotelDetails: z.object({
    name: z.string(),
    checkIn: z.string(),
    checkOut: z.string(),
    cost: z.number(),
  }).optional(),
  diningReservations: z.array(
    z.object({
      restaurantName: z.string(),
      time: z.string(),
      partySize: z.number(),
    })
  ).optional(),
  welcomeMessage: z.string().describe("A warm welcome message sent to the candidate with their itinerary."),
  totalBudgetUtilized: z.number(),
});

export type ConciergeItinerary = z.infer<typeof ConciergeItinerarySchema>;
