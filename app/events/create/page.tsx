'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, Building2, User, Tag, ListChecks, Image as ImageIcon, Sparkles } from 'lucide-react';
import Image from 'next/image';

const CreateEventPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        overview: '',
        venue: '',
        location: '',
        date: '',
        time: '',
        mode: 'online',
        audience: '',
        organizer: '',
        tags: '',
        agenda: '',
    });
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Parse tags and agenda
            const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            const agenda = formData.agenda.split('\n').map(item => item.trim()).filter(item => item);

            if (tags.length === 0) {
                setError('At least one tag is required');
                setLoading(false);
                return;
            }

            if (agenda.length === 0) {
                setError('At least one agenda item is required');
                setLoading(false);
                return;
            }

            if (!image) {
                setError('Image is required');
                setLoading(false);
                return;
            }

            // Create FormData
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('overview', formData.overview);
            submitData.append('venue', formData.venue);
            submitData.append('location', formData.location);
            submitData.append('date', formData.date);
            submitData.append('time', formData.time);
            submitData.append('mode', formData.mode);
            submitData.append('audience', formData.audience);
            submitData.append('organizer', formData.organizer);
            submitData.append('tags', JSON.stringify(tags));
            submitData.append('agenda', JSON.stringify(agenda));
            submitData.append('image', image);

            const response = await fetch('/api/events', {
                method: 'POST',
                body: submitData,
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || data.details || 'Failed to create event');
                setLoading(false);
                return;
            }

            setSuccess(true);
            posthog.capture('event_created', { eventTitle: formData.title });

            // Redirect to events page after 2 seconds
            setTimeout(() => {
                router.push('/events');
            }, 2000);
        } catch (err) {
            setError('An error occurred while creating the event');
            console.error(err);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="flex items-center justify-center min-h-screen">
                <Card className="glass border-dark-200 bg-dark-100/50 max-w-md w-full card-shadow">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="flex-center">
                                <div className="rounded-full bg-primary/20 p-4">
                                    <Sparkles className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gradient">Event Created Successfully!</h2>
                            <p className="text-light-200">Your event is now live. Redirecting to events page...</p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main>
            <section className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-gradient">Create Your Event</h1>
                    <p className="text-light-100 text-lg max-sm:text-sm">
                        Share your amazing event with the developer community
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information Card */}
                    <Card className="glass border-dark-200 bg-dark-100/50 card-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                Basic Information
                            </CardTitle>
                            <CardDescription className="text-light-200">
                                Tell us about your event
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-light-100">Event Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="React Summit 2025"
                                    className="bg-dark-200 border-dark-200 text-white placeholder:text-light-200 focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-light-100">Description *</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows={4}
                                        placeholder="A comprehensive description of your event..."
                                        className="bg-dark-200 border-dark-200 text-white placeholder:text-light-200 focus:border-primary resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="overview" className="text-light-100">Overview *</Label>
                                    <Textarea
                                        id="overview"
                                        name="overview"
                                        value={formData.overview}
                                        onChange={handleInputChange}
                                        required
                                        rows={4}
                                        placeholder="A brief overview of what attendees can expect..."
                                        className="bg-dark-200 border-dark-200 text-white placeholder:text-light-200 focus:border-primary resize-none"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location & Date Card */}
                    <Card className="glass border-dark-200 bg-dark-100/50 card-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Location & Schedule
                            </CardTitle>
                            <CardDescription className="text-light-200">
                                When and where will your event take place?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="venue" className="text-light-100 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        Venue *
                                    </Label>
                                    <Input
                                        id="venue"
                                        name="venue"
                                        value={formData.venue}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Convention Center"
                                        className="bg-dark-200 border-dark-200 text-white placeholder:text-light-200 focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-light-100 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Location *
                                    </Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="San Francisco, CA, USA"
                                        className="bg-dark-200 border-dark-200 text-white placeholder:text-light-200 focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="date" className="text-light-100 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Date *
                                    </Label>
                                    <Input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-dark-200 border-dark-200 text-white focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time" className="text-light-100 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Time *
                                    </Label>
                                    <Input
                                        type="time"
                                        id="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-dark-200 border-dark-200 text-white focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="mode" className="text-light-100">Event Mode *</Label>
                                    <Select value={formData.mode} onValueChange={(value) => handleSelectChange('mode', value)}>
                                        <SelectTrigger className="bg-dark-200 border-dark-200 text-white focus:border-primary">
                                            <SelectValue placeholder="Select mode" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-200 border-dark-200">
                                            <SelectItem value="online" className="text-white focus:bg-dark-100">Online</SelectItem>
                                            <SelectItem value="offline" className="text-white focus:bg-dark-100">Offline</SelectItem>
                                            <SelectItem value="hybrid" className="text-white focus:bg-dark-100">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="audience" className="text-light-100 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Target Audience *
                                    </Label>
                                    <Input
                                        id="audience"
                                        name="audience"
                                        value={formData.audience}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Developers, Designers, etc."
                                        className="bg-dark-200 border-dark-200 text-white placeholder:text-light-200 focus:border-primary"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Organizer & Details Card */}
                    <Card className="glass border-dark-200 bg-dark-100/50 card-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Organizer & Details
                            </CardTitle>
                            <CardDescription className="text-light-200">
                                Additional information about your event
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="organizer" className="text-light-100">Organizer *</Label>
                                    <Input
                                        id="organizer"
                                        name="organizer"
                                        value={formData.organizer}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Event Organizer Name"
                                        className="bg-dark-200 border-dark-200 text-white placeholder:text-light-200 focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tags" className="text-light-100 flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        Tags (comma-separated) *
                                    </Label>
                                    <Input
                                        id="tags"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="react, javascript, frontend, conference"
                                        className="bg-dark-200 border-dark-200 text-white placeholder:text-light-200 focus:border-primary"
                                    />
                                    <p className="text-sm text-light-200">Separate multiple tags with commas</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="agenda" className="text-light-100 flex items-center gap-2">
                                    <ListChecks className="w-4 h-4" />
                                    Agenda (one item per line) *
                                </Label>
                                <Textarea
                                    id="agenda"
                                    name="agenda"
                                    value={formData.agenda}
                                    onChange={handleInputChange}
                                    required
                                    rows={5}
                                    placeholder="9:00 AM - Registration&#10;10:00 AM - Opening Keynote&#10;11:00 AM - Workshop Session&#10;12:00 PM - Lunch Break&#10;2:00 PM - Panel Discussion"
                                    className="bg-dark-200 border-dark-200 text-white placeholder:text-light-200 focus:border-primary resize-none font-mono text-sm"
                                />
                                <p className="text-sm text-light-200">Enter one agenda item per line</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Image Upload Card - Fixed UI */}
                    <Card className="glass border-dark-200 bg-dark-100/50 card-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-primary" />
                                Event Image
                            </CardTitle>
                            <CardDescription className="text-light-200">
                                Upload a banner image for your event
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {imagePreview ? (
                                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-dark-200 bg-dark-200 flex items-center justify-center">
                                    <Image
                                        src={imagePreview}
                                        alt="Event preview"
                                        fill
                                        className="object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImage(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full p-1.5 transition-colors"
                                        aria-label="Remove image"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-64 rounded-lg border-2 border-dashed border-dark-200 bg-dark-200/30 flex items-center justify-center">
                                    <div className="text-center space-y-2">
                                        <ImageIcon className="w-12 h-12 text-light-200 mx-auto opacity-50" />
                                        <p className="text-sm text-light-200">No image selected</p>
                                        <p className="text-xs text-light-200 opacity-75">Upload a banner image</p>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="image" className="text-light-100">Event Banner Image *</Label>
                                <Input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    required
                                    className="bg-dark-200 border-dark-200 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/90 file:cursor-pointer"
                                />
                                <p className="text-sm text-light-200">Recommended: 1200x600px or larger</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Message */}
                    {error && (
                        <Card className="border-red-500/50 bg-red-500/10">
                            <CardContent className="pt-6">
                                <p className="text-red-400 text-sm">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1 border-dark-200 bg-dark-100 text-white hover:bg-dark-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold"
                        >
                            {loading ? (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                    Creating Event...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Create Event
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default CreateEventPage;
