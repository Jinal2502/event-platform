import ExploreBtn from "@/components/ExploreBtn";
import { events as staticEvents } from "@/lib/constants";
import EventsList from "@/components/EventsList";

const Page = async () => {
    // Use static events for initial render (fast build, fast initial load)
    // Database events will be fetched client-side and merged in

    return (
        <section>
            <h1 className="text-center">The Hub for Every Dev <br /> Event You Can't Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>

            <ExploreBtn />

            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>

                <ul className="events">
                    <EventsList initialEvents={staticEvents} />
                </ul>
            </div>
        </section>
    )
}

export default Page;