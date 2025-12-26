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
                    <Link href="/" onClick={handleHomeClick}>Home</Link>
                    <Link href="/" onClick={handleEventsClick}>Events</Link>
                    <Link href="/" onClick={handleCreateEventClick}>Create Event</Link>
                </ul>
            </nav>
        </header>
    )
}

export default Navbar