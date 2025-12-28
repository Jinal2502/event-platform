import { Suspense } from "react";
import EventDetails from "@/components/EventDetails";

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> | { slug: string } }) => {
    // Handle both Promise and direct params (for Next.js 15+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    
    if (!resolvedParams.slug) {
        return <div>Invalid event slug</div>;
    }
    
    return (
        <main>
            <Suspense fallback={<div>Loading...</div>}>
                <EventDetails slug={resolvedParams.slug} />
            </Suspense>
        </main>
    );
};

export default EventDetailsPage;
