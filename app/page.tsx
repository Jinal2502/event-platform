import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { events as staticEvents, type EventItem } from "@/lib/constants";
import { getBaseUrl } from "@/lib/utils";

// Force dynamic rendering since we're fetching from database
export const dynamic = 'force-dynamic';

const Page = async () => {
    // Get BASE_URL inside the function to ensure it's evaluated at runtime
    const BASE_URL = getBaseUrl();
    
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
        <section>
            <h1 className="text-center">The Hub for Every Dev <br /> Event You Can't Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>

            <ExploreBtn />

            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>

                <ul className="events">
                    {events && events.length > 0 && events.map((event: EventItem) => (
                        <li key={event.slug} className="list-none">
                            <EventCard {...event} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export default Page;