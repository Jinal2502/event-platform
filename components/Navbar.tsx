'use client';

import Link from "next/link";
import Image from "next/image";
import posthog from "posthog-js";

const Navbar = () => {
    const handleLogoClick = () => {
        posthog.capture('logo_clicked', {
            nav_location: 'header',
        });
    };

    const handleHomeClick = () => {
        posthog.capture('home_nav_clicked', {
            nav_location: 'header',
        });
    };

    const handleEventsClick = () => {
        posthog.capture('events_nav_clicked', {
            nav_location: 'header',
        });
    };

    const handleCreateEventClick = () => {
        posthog.capture('create_event_nav_clicked', {
            nav_location: 'header',
        });
    };

    return (
        <header>
            <nav>
                <Link href='/' className="logo" onClick={handleLogoClick}>
                    <Image src="/icons/logo.png" alt="logo" width={24} height={24} />

                    <p>DevEvent</p>
                </Link>

                <ul>
                    <li>
                        <Link href="/" onClick={handleHomeClick}>Home</Link>
                    </li>
                    <li>
                        <Link href="/events" onClick={handleEventsClick}>Events</Link>
                    </li>
                    <li>
                        <Link href="/events/create" onClick={handleCreateEventClick}>Create Event</Link>
                    </li>
                </ul>
            </nav>
        </header>
    )
}

export default Navbar