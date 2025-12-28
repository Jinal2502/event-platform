'use client';

import {useState} from "react";
import {createBooking} from "@/lib/actions/booking.actions";
import posthog from "posthog-js";

const BookEvent = ({ eventId, slug }: { eventId: string, slug: string;}) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            const { success } = await createBooking({ eventId, slug, email });

            if(success) {
                setSubmitted(true);
                posthog.capture('event_booked', { eventId, slug, email });
            } else {
                setError('Failed to book event. Please try again.');
                posthog.capture('booking_failed', { eventId, slug, email });
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Booking error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div id="book-event">
            {submitted ? (
                <div className="text-center space-y-2">
                    <p className="text-primary font-semibold">✓ You're Booked!</p>
                    <p className="text-sm text-light-200">Thank you for signing up. We'll see you at the event!</p>
                </div>
            ): (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder="Enter your email address"
                            required
                            disabled={loading}
                            className={error ? 'border-red-500' : ''}
                        />
                        {error && (
                            <p className="text-red-400 text-xs mt-1">{error}</p>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="button-submit"
                        disabled={loading || !email}
                    >
                        {loading ? 'Booking...' : 'Book Your Spot'}
                    </button>
                </form>
            )}
        </div>
    )
}
export default BookEvent