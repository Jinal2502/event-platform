import EventCard from "@/components/EventCard";
import { events as staticEvents, type EventItem } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const EventsPage = async () => {
    let dbEvents: EventItem[] = [];
    
    // Fetch events from database
    try {
        const response = await fetch(`${BASE_URL}/api/events`, {
            next: { revalidate: 60 }
        });
        
        if (response.ok) {
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
        console.error('Error fetching events:', error);
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

