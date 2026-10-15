import { NextResponse } from 'next/server';
import { ophelia } from '../../../../lib/ophelia/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, bookingId, hotelId, candidateDetails, ...payload } = body;

    // Continue an existing booking (after payment/action step)
    if (action === 'continue' && bookingId) {
      const result = await ophelia.continueBooking(bookingId);
      return NextResponse.json({ ...result, practiceMode: ophelia.practiceMode });
    }

    // Create a new booking
    if (payload.availability_id && payload.venue_id) {
      const result = await ophelia.createBooking({
        availability_id: payload.availability_id,
        venue_id: payload.venue_id,
        party_size: payload.party_size || 1,
        check_in: payload.check_in || '2026-10-14',
        check_out: payload.check_out || '2026-10-15',
        customer: payload.customer || { name: candidateDetails?.name || 'Candidate', email: candidateDetails?.email || 'candidate@company.com' },
        idempotency_key: payload.idempotency_key || `jobninja_${Date.now()}`
      });
      return NextResponse.json({ ...result, practiceMode: ophelia.practiceMode });
    }

    // Legacy: book by hotel ID
    const result = await ophelia.bookHotel(hotelId, candidateDetails || {});
    if (result.status === 'failed') {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ...result, practiceMode: ophelia.practiceMode });
  } catch (error: any) {
    console.error('Ophelia booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
