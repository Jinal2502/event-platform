import EventCard from "@/components/EventCard";
import { events as staticEvents, type EventItem } from "@/lib/constants";
import { getBaseUrl } from "@/lib/utils";
import { unstable_noStore } from 'next/cache';

const EventsPage = async () => {
    // Mark this as dynamic to prevent blocking during static generation
    unstable_noStore();
    
    let dbEvents: EventItem[] = [];
    
    // Try to fetch events from database, but gracefully fallback to static events
    // This allows the page to build even if the API isn't available during build time
    try {
        const BASE_URL = getBaseUrl();
        // Use relative URL if BASE_URL is not available (works during build)
        const apiUrl = BASE_URL ? `${BASE_URL}/api/events` : '/api/events';
        
        const response = await fetch(apiUrl, {
            next: { revalidate: 60 },
            // Suppress errors during build
        }).catch(() => null);
        
        if (response?.ok) {
            const data = await response.json();
            // Convert database events to EventItem format
            dbEvents = (data.events || []).map((event: any) => ({
                title: event.title,
                slug: event.slug,
                image: event.image,
                location: event.location,
                date: event.date,
                time: event.time,
            }));
        }
    } catch (error) {
        // Silently fail - we'll use static events as fallback
        // This is expected during build time when API might not be available
    }

    // Merge database events with static events, prioritizing database events
    // Remove static events that have the same slug as database events
    const staticEventSlugs = new Set(dbEvents.map(e => e.slug));
    const uniqueStaticEvents = staticEvents.filter(e => !staticEventSlugs.has(e.slug));
    
    // Combine: database events first, then static events
    const events: EventItem[] = [...dbEvents, ...uniqueStaticEvents];

    return (
        <main>
            <section>
                <h1 className="text-center mb-10">All Events</h1>

                <ul className="events">
                    {events && events.length > 0 && events.map((event: EventItem) => (
                        <li key={event.slug} className="list-none">
                            <EventCard {...event} />
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    )
}

export default EventsPage

