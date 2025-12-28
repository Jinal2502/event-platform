import {Suspense} from "react";
import EventDetails from "@/components/EventDetails";

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }>}) => {
    const { slug } = await params;
    const slugPromise = Promise.resolve(slug);

    return (
        <main>
            <Suspense fallback={<div>Loading...</div>}>
                <EventDetails params={slugPromise} />
            </Suspense>
        </main>
    )
}
export default EventDetailsPage