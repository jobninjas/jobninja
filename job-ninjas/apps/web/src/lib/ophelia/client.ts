import { OpheliaSearchRequest, OpheliaHotelOption, OpheliaBookingConfirmation, OpheliaVenueSearchRequest, OpheliaVenueResult, OpheliaAvailabilityRequest, OpheliaAvailabilityResult, OpheliaBookingRequest, OpheliaBookingResponse } from './types';

// Ophelia integration adapter
// For the hackathon, the client runs in DEMO_MODE using Ophelia's practice environment.
// This abstracts the boundary cleanly so live mode can be enabled with env vars.

const DEMO_MODE = false; // Ophelia practice environment for hackathon

const OPHELIA_TEST_KEY = process.env.OPHELIA_API_KEY || 'oph_test_92416f64c9a180c51e7d4718ece19cc2';
const OPHELIA_BASE_URL = 'https://api.opheliaos.com/v1';

// Demo hotel data normalized to our schema (Practice Inn + realistic options)
const DEMO_HOTELS: OpheliaHotelOption[] = [
  {
    id: 'practice_inn_nyc',
    name: 'Practice Inn (Ophelia Test)',
    price: 219,
    currency: 'USD',
    location: 'Midtown Manhattan',
    distanceFromInterview: 'Test property',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    availability: true,
    rating: 9.1,
    providerData: { practice: true }
  },
  {
    id: 'hotel_2_arlo_soho',
    name: 'Arlo SoHo',
    price: 285,
    currency: 'USD',
    location: 'SoHo',
    distanceFromInterview: '1.2 miles from office',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    availability: true,
    rating: 8.7,
    providerData: { practice: false }
  },
  {
    id: 'hotel_3_1hotel_brooklyn',
    name: '1 Hotel Brooklyn Bridge',
    price: 495,
    currency: 'USD',
    location: 'Brooklyn Heights',
    distanceFromInterview: '2.5 miles from office',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c0d5bf8f?w=800&q=80',
    availability: true,
    rating: 9.4,
    providerData: { practice: false }
  }
];

export class OpheliaClient {
  private apiKey: string;
  private baseUrl: string;
  public practiceMode: boolean;

  constructor() {
    this.apiKey = OPHELIA_TEST_KEY;
    this.baseUrl = OPHELIA_BASE_URL;
    this.practiceMode = DEMO_MODE;
  }

  // ── STEP 1: Venue Search ─────────────────────────────────────────────────
  async searchVenues(request: OpheliaVenueSearchRequest): Promise<OpheliaHotelOption[]> {
    if (DEMO_MODE) {
      console.log('[OPHELIA_CLIENT - PRACTICE MODE] POST /v1/venues/search', request);
      await new Promise(resolve => setTimeout(resolve, 1800));
      return DEMO_HOTELS.filter(h => !request.budget || h.price <= request.budget);
    }

    const response = await fetch(`${this.baseUrl}/venues/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) throw new Error(`Ophelia venue search failed: ${response.statusText}`);
    const data = await response.json();
    const venues = data.venues || data.results || [];
    return venues.map((r: any) => ({
      id: r.id,
      name: r.name,
      price: r.price_per_night || r.price || (r.metadata && r.metadata.price) || 250,
      currency: r.currency || 'USD',
      location: r.location || r.city || r.neighborhood || r.address || 'New York',
      distanceFromInterview: '',
      image: r.image_url || (r.metadata && r.metadata.image) || r.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      availability: r.bookable !== false && r.available !== false,
      rating: r.rating || 4.5,
      providerData: r
    }));
  }

  // ── STEP 2: Availability Search ──────────────────────────────────────────
  async checkAvailability(request: OpheliaAvailabilityRequest): Promise<OpheliaAvailabilityResult> {
    if (DEMO_MODE) {
      console.log('[OPHELIA_CLIENT - PRACTICE MODE] POST /v1/availability/search', request);
      await new Promise(resolve => setTimeout(resolve, 1200));
      return {
        availability_id: `avail_${request.venue_id}_${Date.now()}`,
        venue_id: request.venue_id,
        room_name: request.venue_id === 'practice_inn_nyc' ? 'Standard Room — Practice' : 'Deluxe King Room',
        price_per_night: DEMO_HOTELS.find(h => h.id === request.venue_id)?.price || 219,
        total_price: DEMO_HOTELS.find(h => h.id === request.venue_id)?.price || 219,
        currency: 'USD',
        cancellation_policy: 'Free cancellation before Oct 13',
        card_required: true,
        available: true
      };
    }

    const response = await fetch(`${this.baseUrl}/availability/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) throw new Error(`Ophelia availability check failed: ${response.statusText}`);
    const data = await response.json();
    const firstSlot = data.slots && data.slots[0];
    return {
      availability_id: firstSlot ? firstSlot.availability_id : undefined,
      venue_id: request.venue_id,
      room_name: firstSlot && firstSlot.offer ? firstSlot.offer.label : '',
      price_per_night: firstSlot && firstSlot.offer ? firstSlot.offer.amount : 250,
      total_price: firstSlot && firstSlot.offer ? firstSlot.offer.amount : 250,
      currency: firstSlot && firstSlot.offer ? firstSlot.offer.currency : 'USD',
      cancellation_policy: 'Flexible',
      card_required: data.card_required,
      available: !!firstSlot
    };
  }

  // ── STEP 3: Create Booking ───────────────────────────────────────────────
  async createBooking(request: OpheliaBookingRequest): Promise<OpheliaBookingResponse> {
    if (DEMO_MODE) {
      console.log('[OPHELIA_CLIENT - PRACTICE MODE] POST /v1/bookings', request);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Practice Inn returns requires_action to exercise the full flow
      if (request.venue_id === 'practice_inn_nyc') {
        return {
          id: `booking_${Date.now()}`,
          status: 'requires_action',
          next_action: {
            type: 'payment',
            message: 'Payment information required to confirm this reservation.',
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          },
          venue_id: request.venue_id,
          amount: 219,
          currency: 'USD',
          provider: 'Ophelia Practice'
        };
      }

      // Other hotels confirm directly in demo
      return {
        id: `booking_${Date.now()}`,
        status: 'confirmed',
        booking_id: `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        confirmation_number: `CONF-${Math.floor(Math.random() * 10000)}`,
        venue_id: request.venue_id,
        amount: DEMO_HOTELS.find(h => h.id === request.venue_id)?.price || 285,
        currency: 'USD',
        provider: 'Ophelia'
      };
    }

    const response = await fetch(`${this.baseUrl}/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': request.idempotency_key
      },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
      booking_id: data.booking_id,
      confirmation_number: data.confirmation_number,
      next_action: data.next_action,
      venue_id: data.venue_id,
      amount: data.amount,
      currency: data.currency,
      provider: data.provider,
      error: data.error
    };
  }

  // ── STEP 4: Continue Booking (after payment/action) ──────────────────────
  async continueBooking(bookingId: string): Promise<OpheliaBookingResponse> {
    if (DEMO_MODE) {
      console.log(`[OPHELIA_CLIENT - PRACTICE MODE] POST /v1/bookings/${bookingId}/continue`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        id: bookingId,
        status: 'confirmed',
        booking_id: bookingId,
        confirmation_number: `CONF-${Math.floor(Math.random() * 10000)}`,
        amount: 219,
        currency: 'USD',
        provider: 'Ophelia Practice'
      };
    }

    const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/continue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const data = await response.json();
    return {
      id: data.id || bookingId,
      status: data.status,
      booking_id: data.booking_id,
      confirmation_number: data.confirmation_number,
      amount: data.amount,
      currency: data.currency,
      provider: data.provider
    };
  }

  // ── Legacy methods (backward compat) ──────────────────────────────────────
  async searchHotels(request: OpheliaSearchRequest): Promise<OpheliaHotelOption[]> {
    return this.searchVenues({
      vertical: 'travel',
      providers: ['hotels'],
      location: request.destination,
      check_in: request.checkIn,
      check_out: request.checkOut,
      party_size: 1,
      rooms: 1,
      budget: request.budget
    });
  }

  async bookHotel(hotelId: string, candidateDetails: any): Promise<OpheliaBookingConfirmation> {
    // 1. First get real availability slots for this hotel
    const availability = await this.checkAvailability({
      venue_id: hotelId,
      check_in: '2026-10-14',
      check_out: '2026-10-15',
      party_size: 1,
      rooms: 1
    });

    if (!availability.availability_id) {
       return { status: 'failed', error: 'No availability found' };
    }

    // 2. Now create booking using the REAL availability_id
    const result = await this.createBooking({
      availability_id: availability.availability_id,
      venue_id: hotelId,
      party_size: 1,
      check_in: '2026-10-14',
      check_out: '2026-10-15',
      customer: { name: candidateDetails.name || 'Candidate', email: candidateDetails.email || 'candidate@company.com' },
      idempotency_key: `jobninja_${Date.now()}`
    });

    return {
      status: result.status === 'confirmed' ? 'confirmed' : result.status === 'requires_action' ? 'requires_action' : 'failed',
      confirmationId: result.confirmation_number,
      bookingId: result.id,
      provider: result.provider,
      amount: result.amount,
      currency: result.currency,
      nextAction: result.next_action ? {
        type: result.next_action.type,
        message: result.next_action.message,
        expiresAt: result.next_action.expires_at
      } : undefined
    };
  }
}

export const ophelia = new OpheliaClient();
