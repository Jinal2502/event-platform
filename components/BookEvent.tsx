'use client';

import {useState} from "react";
import {createBooking} from "@/lib/actions/booking.actions";
import posthog from "posthog-js";

const BookEvent = ({ eventId, slug }: { eventId: string, slug: string;}) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        await createBooking({ eventId, slug, email });
        
        setTimeout(() => {
            setSubmitted(true);
            setLoading(false);
            posthog.capture('event_booked', { eventId, slug, email });
        }, 1000);
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">You're Booked!</p>
            ): (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder="Enter your email address"
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="button-submit" disabled={loading}>
                        {loading ? 'Booking...' : 'Submit'}
                    </button>
                </form>
            )}
        </div>
    )
}
export default BookEvent