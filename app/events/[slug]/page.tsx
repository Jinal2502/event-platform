import { Suspense } from "react";
import EventDetails from "@/components/EventDetails";

const EventDetailsPage = ({ params }: { params: { slug: string } }) => {
    return (
        <main>
            <Suspense fallback={<div>Loading...</div>}>
                <EventDetails slug={params.slug} />
            </Suspense>
        </main>
    );
};

export default EventDetailsPage;
