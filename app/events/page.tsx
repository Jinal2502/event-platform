import EventCard from "@/components/EventCard";
import { events as staticEvents, type EventItem } from "@/lib/constants";

const EventsPage = async () => {
    // For now, use only static events to avoid build issues
    // Database events can be fetched client-side if needed
    // This ensures the page builds successfully
    const events: EventItem[] = staticEvents;


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

