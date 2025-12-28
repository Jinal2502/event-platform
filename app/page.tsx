import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { events as staticEvents, type EventItem } from "@/lib/constants";

const Page = async () => {
    // For now, use only static events to avoid build issues
    // Database events can be fetched client-side if needed
    // This ensures the page builds successfully
    const events: EventItem[] = staticEvents;

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