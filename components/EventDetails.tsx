import React from 'react'
import {notFound} from "next/navigation";
import {IEvent} from "@/database";
import {getSimilarEventsBySlug} from "@/lib/actions/event.actions";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { events as staticEvents } from "@/lib/constants";

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string; }) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
)

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
)

const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div className="pill" key={tag}>{tag}</div>
        ))}
    </div>
)

const EventDetails = async ({ slug }: { slug: string }) => {
    // Validate slug
    if (!slug || slug === 'undefined') {
        return notFound();
    }

    // Use relative URL - works in both dev and production
    // Next.js automatically caches fetch requests by default
    // This will cache the response so subsequent loads are instant
    let event: any;
    try {
        const request = await fetch(`/api/events/${slug}`, {
            next: { revalidate: 3600 } // Cache for 1 hour, then revalidate in background
        });

        if (!request.ok) {
            if (request.status === 404) {
                // Fallback to static events from constants
                const staticEvent = staticEvents.find(e => e.slug === slug);
                if (staticEvent) {
                    // Convert static event to full event format with default values
                    event = {
                        _id: `static-${slug}`,
                        slug: staticEvent.slug,
                        title: staticEvent.title,
                        description: `${staticEvent.title} - Join us for an amazing event!`,
                        overview: `Don't miss out on ${staticEvent.title}. This is a must-attend event for developers.`,
                        image: staticEvent.image,
                        venue: staticEvent.location,
                        location: staticEvent.location,
                        date: staticEvent.date,
                        time: staticEvent.time,
                        mode: 'hybrid',
                        audience: 'Developers',
                        agenda: ['Registration', 'Opening Keynote', 'Workshop Sessions', 'Networking'],
                        organizer: 'Event Organizers',
                        tags: ['tech', 'conference', 'networking'],
                    };
                } else {
                    return notFound();
                }
            } else {
                throw new Error(`Failed to fetch event: ${request.statusText}`);
            }
        } else {
            const response = await request.json();
            event = response.event;

            if (!event) {
                return notFound();
            }
        }
    } catch (error) {
        console.error('Error fetching event:', error);
        // Try static events as fallback
        const staticEvent = staticEvents.find(e => e.slug === slug);
        if (staticEvent) {
            event = {
                _id: `static-${slug}`,
                slug: staticEvent.slug,
                title: staticEvent.title,
                description: `${staticEvent.title} - Join us for an amazing event!`,
                overview: `Don't miss out on ${staticEvent.title}. This is a must-attend event for developers.`,
                image: staticEvent.image,
                venue: staticEvent.location,
                location: staticEvent.location,
                date: staticEvent.date,
                time: staticEvent.time,
                mode: 'hybrid',
                audience: 'Developers',
                agenda: ['Registration', 'Opening Keynote', 'Workshop Sessions', 'Networking'],
                organizer: 'Event Organizers',
                tags: ['tech', 'conference', 'networking'],
            };
        } else {
            return notFound();
        }
    }

    const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = event;

    if(!description) return notFound();

    const bookings = 10;

    // Fetch similar events - don't block if it's slow
    let similarEvents: IEvent[] = [];
    try {
        // Use Promise.race with a reasonable timeout
        similarEvents = await Promise.race([
            getSimilarEventsBySlug(slug),
            new Promise<IEvent[]>((resolve) => {
                setTimeout(() => {
                    // Return static events as fallback if DB is slow
                    const otherStaticEvents = staticEvents
                        .filter(e => e.slug !== slug)
                        .slice(0, 6)
                        .map(e => ({
                            _id: `static-${e.slug}`,
                            title: e.title,
                            slug: e.slug,
                            description: `${e.title} - Join us for an amazing event!`,
                            overview: `Don't miss out on ${e.title}.`,
                            image: e.image,
                            venue: e.location,
                            location: e.location,
                            date: e.date,
                            time: e.time,
                            mode: 'hybrid' as const,
                            audience: 'Developers',
                            agenda: ['Registration', 'Opening Keynote', 'Workshop Sessions'],
                            organizer: 'Event Organizers',
                            tags: ['tech', 'conference'],
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        })) as unknown as IEvent[];
                    resolve(otherStaticEvents);
                }, 3000); // 3 second timeout
            })
        ]);
    } catch (error) {
        // Fallback to static events if similar events fail
        similarEvents = staticEvents
            .filter(e => e.slug !== slug)
            .slice(0, 6)
            .map(e => ({
                _id: `static-${e.slug}`,
                title: e.title,
                slug: e.slug,
                description: `${e.title} - Join us for an amazing event!`,
                overview: `Don't miss out on ${e.title}.`,
                image: e.image,
                venue: e.location,
                location: e.location,
                date: e.date,
                time: e.time,
                mode: 'hybrid' as const,
                audience: 'Developers',
                agenda: ['Registration', 'Opening Keynote', 'Workshop Sessions'],
                organizer: 'Event Organizers',
                tags: ['tech', 'conference'],
                createdAt: new Date(),
                updatedAt: new Date(),
            })) as unknown as IEvent[];
    }

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>
                <p>{description}</p>
            </div>

            <div className="details">
                {/*    Left Side - Event Content */}
                <div className="content">
                    <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>

                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
                    </section>

                    <EventAgenda agendaItems={agenda} />

                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTags tags={tags} />
                </div>

                {/*    Right Side - Booking Form */}
                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        {bookings > 0 ? (
                            <p className="text-sm">
                                Join {bookings} people who have already booked their spot!
                            </p>
                        ): (
                            <p className="text-sm">Be the first to book your spot!</p>
                        )}

                        <BookEvent eventId={event._id} slug={event.slug} />
                    </div>
                </aside>
            </div>

            <div className="flex w-full flex-col gap-4 pt-20">
                <h2>Similar Events</h2>
                <div className="events">
                    {similarEvents.length > 0 ? (
                        similarEvents.map((similarEvent: IEvent) => (
                            <EventCard 
                                key={similarEvent.slug || similarEvent._id?.toString()} 
                                title={similarEvent.title}
                                image={similarEvent.image}
                                slug={similarEvent.slug}
                                location={similarEvent.location}
                                date={similarEvent.date}
                                time={similarEvent.time}
                            />
                        ))
                    ) : (
                        <p className="text-light-200">No similar events found.</p>
                    )}
                </div>
            </div>
        </section>
    )
}
export default EventDetails