'use client';

import { useEffect, useState } from 'react';
import EventCard from '@/components/EventCard';
import { events as staticEvents, type EventItem } from '@/lib/constants';

interface EventsListProps {
    initialEvents: EventItem[];
}

const EventsList = ({ initialEvents }: EventsListProps) => {
    const [events, setEvents] = useState<EventItem[]>(initialEvents);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch database events client-side
        const fetchDatabaseEvents = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/events');
                
                if (response.ok) {
                    const data = await response.json();
                    const dbEvents: EventItem[] = (data.events || []).map((event: any) => ({
                        title: event.title,
                        slug: event.slug,
                        image: event.image,
                        location: event.location,
                        date: event.date,
                        time: event.time,
                    }));

                    // Merge database events with static events
                    // Remove static events that have the same slug as database events
                    const staticEventSlugs = new Set(dbEvents.map(e => e.slug));
                    const uniqueStaticEvents = staticEvents.filter(e => !staticEventSlugs.has(e.slug));
                    
                    // Combine: database events first, then static events
                    setEvents([...dbEvents, ...uniqueStaticEvents]);
                }
            } catch (error) {
                // Silently fail - keep using static events
                console.error('Error fetching database events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDatabaseEvents();
    }, []);

    return (
        <>
            {events && events.length > 0 && events.map((event: EventItem) => (
                <li key={event.slug} className="list-none">
                    <EventCard {...event} />
                </li>
            ))}
        </>
    );
};

export default EventsList;

