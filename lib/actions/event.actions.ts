'use server';

import { Event } from '@/database';
import connectDB from "@/lib/mongodb";
import { IEvent } from '@/database';
import { events as staticEvents } from '@/lib/constants';

export const getSimilarEventsBySlug = async (slug: string): Promise<IEvent[]> => {
    try {
        await connectDB();
        
        // First, try to find the event in the database
        const event = await Event.findOne({ slug }).lean() as any;

        if (!event) {
            // If event not in DB, try to find similar static events
            const staticEvent = staticEvents.find(e => e.slug === slug);
            if (staticEvent) {
                // Return other static events (excluding current one)
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
                        mode: 'hybrid',
                        audience: 'Developers',
                        agenda: ['Registration', 'Opening Keynote', 'Workshop Sessions'],
                        organizer: 'Event Organizers',
                        tags: ['tech', 'conference'],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    })) as unknown as IEvent[];
                return otherStaticEvents;
            }
            return [];
        }

        // Find similar events by matching tags
        let similarEvents = await Event.find({ 
            _id: { $ne: event._id }, 
            tags: { $in: event.tags || [] } 
        })
        .limit(6)
        .sort({ createdAt: -1 })
        .lean() as any[];

        // If we don't have enough similar events by tags, find by other criteria
        if (similarEvents.length < 3) {
            const excludedIds = [...similarEvents.map((e: any) => e._id), event._id];
            const additionalEvents = await Event.find({
                _id: { $ne: event._id, $nin: excludedIds },
                $or: [
                    { mode: event.mode },
                    { location: { $regex: (event.location || '').split(',')[0] || '', $options: 'i' } },
                ]
            })
            .limit(6 - similarEvents.length)
            .sort({ createdAt: -1 })
            .lean() as any[];

            similarEvents = [...similarEvents, ...additionalEvents];
        }

        // If still not enough, get any recent events
        if (similarEvents.length < 3) {
            const excludedIds = [...similarEvents.map((e: any) => e._id), event._id];
            const recentEvents = await Event.find({
                _id: { $ne: event._id, $nin: excludedIds }
            })
            .limit(6 - similarEvents.length)
            .sort({ createdAt: -1 })
            .lean() as any[];

            similarEvents = [...similarEvents, ...recentEvents];
        }

        // Fallback to static events if database has no events
        if (similarEvents.length === 0) {
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
                    mode: 'hybrid',
                    audience: 'Developers',
                    agenda: ['Registration', 'Opening Keynote', 'Workshop Sessions'],
                    organizer: 'Event Organizers',
                    tags: ['tech', 'conference'],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })) as unknown as IEvent[];
            return otherStaticEvents;
        }

        return similarEvents as unknown as IEvent[];
    } catch (error) {
        console.error('Error fetching similar events:', error);
        // Fallback to static events on error
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
                mode: 'hybrid',
                audience: 'Developers',
                agenda: ['Registration', 'Opening Keynote', 'Workshop Sessions'],
                organizer: 'Event Organizers',
                tags: ['tech', 'conference'],
                createdAt: new Date(),
                updatedAt: new Date(),
            })) as unknown as IEvent[];
        return otherStaticEvents;
    }
}