import { events as staticEvents } from "@/lib/constants";
import EventsList from "@/components/EventsList";

const EventsPage = async () => {
    // Use static events for initial render (fast build, fast initial load)
    // Database events will be fetched client-side and merged in

    return (
        <main>
            <section>
                <h1 className="text-center mb-10">All Events</h1>

                <ul className="events">
                    <EventsList initialEvents={staticEvents} />
                </ul>
            </section>
        </main>
    )
}

export default EventsPage

