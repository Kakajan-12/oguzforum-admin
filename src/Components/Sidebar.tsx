import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    BriefcaseIcon,
    MapPinIcon,
    NewspaperIcon,
    WindowIcon,
    UserPlusIcon,
    PresentationChartLineIcon,
    QuestionMarkCircleIcon,
    LinkIcon,
    CircleStackIcon,
    ClipboardDocumentListIcon,
    CalendarDaysIcon,
    ChevronDownIcon,
    Squares2X2Icon,
    ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/16/solid";
import { BsNewspaper } from "react-icons/bs";
import { IoMailOpenSharp } from "react-icons/io5";
import { FaPhone } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";

const menuGroups = [
    {
        title: "Content Management",
        key: "content",
        links: [
            { href: "/admin/hero-video", label: "Hero Video", icon: WindowIcon },
            { href: "/admin/faq", label: "FAQ", icon: QuestionMarkCircleIcon },
        ],
    },
    {
        title: "News/Press",
        key: "news",
        links: [
            { href: "/admin/news", label: "News", icon: NewspaperIcon },
            { href: "/admin/news-category", label: "News Category", icon: NewspaperIcon },
            { href: "/admin/press", label: "Press", icon: BsNewspaper },
            { href: "/admin/press-category", label: "Press Category", icon: BsNewspaper },
        ],
    },
    {
        title: "Projects",
        key: "projects",
        links: [
            { href: "/admin/projects", label: "Projects", icon: BriefcaseIcon },
            { href: "/admin/locations", label: "Locations", icon: MapPinIcon },
            { href: "/admin/types", label: "Types", icon: CalendarDaysIcon },
        ],
    },
    {
        title: "Career",
        key: "career",
        links: [
            { href: "/admin/career", label: "Career", icon: PresentationChartLineIcon },
            { href: "/admin/partners", label: "Partners", icon: UserPlusIcon },
            { href: "/admin/applied", label: "Applied", icon: BriefcaseIcon },
        ],
    },
    {
        title: "Contacts",
        key: "contacts",
        links: [
            { href: "/admin/social-links", label: "Social Links", icon: LinkIcon },
            { href: "/admin/contact-numbers", label: "Contact Numbers", icon: FaPhone },
            { href: "/admin/contact-mails", label: "Contact Mails", icon: IoMailOpenSharp },
            { href: "/admin/contact-address", label: "Contact Locations", icon: MapPinIcon },
        ],
    },
    {
        title: "Others",
        key: "others",
        links: [
            { href: "/admin/cookie", label: "Cookie", icon: CircleStackIcon },
            { href: "/admin/privacy", label: "Privacy Policy", icon: ClipboardDocumentListIcon },
            { href: "/admin/terms", label: "Terms of Use", icon: ClipboardDocumentListIcon },
        ],
    },
    {
        title: "Telegram",
        key: "telegram",
        links: [
            { href: "/admin/telegram", label: "Telegram Bot", icon: FaTelegramPlane },
        ],
    },
];

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    // Groups open by default so navigation is always visible.
    const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>(
        () => Object.fromEntries(menuGroups.map((g) => [g.key, true]))
    );

    useEffect(() => {
        const newOpenGroups: { [key: string]: boolean } = {};
        for (const group of menuGroups) {
            if (group.links.some((link) => pathname.startsWith(link.href))) {
                newOpenGroups[group.key] = true;
            }
        }
        setOpenGroups((prev) => ({ ...prev, ...newOpenGroups }));
    }, [pathname]);

    const toggleGroup = (key: string) => {
        setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    const logout = () => {
        localStorage.removeItem("auth_token");
        router.push("/");
    };

    return (
        <aside
            className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white"
            aria-label="Sidebar"
        >
            {/* Brand */}
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1268B3] text-white">
                    <Squares2X2Icon className="size-5" />
                </div>
                <div className="leading-tight">
                    <p className="text-sm font-bold text-gray-900">OGUZ Admin</p>
                    <p className="text-[11px] text-gray-400">Forum &amp; Expo</p>
                </div>
            </div>

            {/* Nav */}
            <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                <a
                    href="/admin"
                    className={`mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                        pathname === "/admin"
                            ? "bg-[#1268B3] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    <Squares2X2Icon className="size-5" />
                    Dashboard
                </a>

                {menuGroups.map((group) => (
                    <div key={group.key}>
                        <button
                            onClick={() => toggleGroup(group.key)}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-400 transition-colors hover:text-gray-600"
                        >
                            {group.title}
                            <ChevronDownIcon
                                className={`size-4 transition-transform ${
                                    openGroups[group.key] ? "" : "-rotate-90"
                                }`}
                            />
                        </button>

                        {openGroups[group.key] && (
                            <ul className="mb-1 mt-0.5 space-y-0.5">
                                {group.links.map(({ href, label, icon: Icon }) => {
                                    const active = isActive(href);
                                    return (
                                        <li key={href}>
                                            <a
                                                href={href}
                                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                    active
                                                        ? "bg-[#1268B3] text-white"
                                                        : "text-gray-600 hover:bg-gray-100"
                                                }`}
                                            >
                                                <Icon
                                                    className={`size-[18px] shrink-0 ${
                                                        active ? "text-white" : "text-gray-400"
                                                    }`}
                                                />
                                                {label}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                ))}
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 p-3">
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                    <ArrowLeftStartOnRectangleIcon className="size-5" />
                    Log out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
