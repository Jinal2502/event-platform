import { Suspense } from "react";
import EventDetails from "@/components/EventDetails";
import { events as staticEvents } from "@/lib/constants";

// Generate static params for known events to prevent undefined slug during build
export async function generateStaticParams() {
    // Return slugs for static events to pre-generate those pages
    return staticEvents.map((event) => ({
        slug: event.slug,
    }));
}

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> | { slug: string } }) => {
    // Handle both Promise and direct params (for Next.js 15+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    
    if (!resolvedParams?.slug || resolvedParams.slug === 'undefined') {
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
