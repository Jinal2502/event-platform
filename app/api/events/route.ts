import {NextRequest, NextResponse} from "next/server";
import { v2 as cloudinary } from 'cloudinary';

import connectDB from "@/lib/mongodb";
import { Event } from '@/database';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({ message: 'Invalid JSON data format'}, { status: 400 })
        }

        const file = formData.get('image') as File;

        if(!file) return NextResponse.json({ message: 'Image file is required'}, { status: 400 })

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);

        // Check if Cloudinary is configured
        const isCloudinaryConfigured = 
            process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_API_KEY && 
            process.env.CLOUDINARY_API_SECRET;

        let imageUrl: string;

        if (isCloudinaryConfigured) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const uploadResult = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error: Error | undefined, results: any) => {
                        if(error) return reject(error);

                        resolve(results);
                    }).end(buffer);
                });

                imageUrl = (uploadResult as { secure_url: string }).secure_url;
            } catch (cloudinaryError: any) {
                console.error('Cloudinary upload error:', cloudinaryError);
                return NextResponse.json({ 
                    message: 'Image upload failed', 
                    error: cloudinaryError.message || 'Cloudinary configuration error. Please check your environment variables.',
                    details: cloudinaryError.http_code === 401 ? 'Invalid Cloudinary API credentials. Please check CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and CLOUDINARY_CLOUD_NAME in your .env file.' : cloudinaryError.message
                }, { status: 500 });
            }
        } else {
            // Fallback: Use a placeholder or data URL for development
            // In production, you should always have Cloudinary configured
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const mimeType = file.type || 'image/png';
            imageUrl = `data:${mimeType};base64,${base64}`;
            
            console.warn('Cloudinary not configured. Using base64 data URL. Please configure Cloudinary for production use.');
        }

        event.image = imageUrl;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown'}, { status: 500 })
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
    }
}