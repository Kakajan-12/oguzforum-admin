import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
    BriefcaseIcon,
    MapPinIcon,
    NewspaperIcon,
    PhotoIcon,
    WindowIcon,
    UserPlusIcon,
    PresentationChartLineIcon,
    ListBulletIcon,
    QuestionMarkCircleIcon,
    EnvelopeIcon,
    LinkIcon,
    CircleStackIcon,
    ClipboardDocumentListIcon, CalendarDaysIcon,
} from "@heroicons/react/16/solid";
import { VscReferences } from "react-icons/vsc";
import {BsNewspaper} from "react-icons/bs";
import {IoMailOpenSharp} from "react-icons/io5";
import {FaPhone} from "react-icons/fa6";

const menuGroups = [
    {
        title: "Content Management",
        key: "content",
        links: [
            { href: "/admin/sliders", label: "Sliders", icon: WindowIcon },
            { href: "/admin/faq", label: "FAQ", icon: QuestionMarkCircleIcon },
        ],
    },
    {
        title: "News/Press",
        key: "news",
        links: [
            { href: "/admin/news", label: "News", icon: NewspaperIcon },
            { href: "/admin/news-category", label: "News Category", icon: NewspaperIcon },
            { href: "/admin/press", label: "Press", icon: BsNewspaper  },
            { href: "/admin/press-category", label: "Press Category", icon: BsNewspaper  },
        ],
    },
    {
        title: "Projects",
        key: "projects",
        links: [
            { href: "/admin/projects", label: "Projects", icon: BriefcaseIcon },
            { href: "/admin/locations", label: "Locations", icon: MapPinIcon },
            { href: "/admin/types", label: "Types", icon: CalendarDaysIcon },
            { href: "/admin/gallery", label: "Gallery", icon: PhotoIcon },
            { href: "/admin/reference", label: "Reference Letter", icon: VscReferences },
        ],
    },
    {
        title: "Career",
        key: "career",
        links: [
            { href: "/admin/career", label: "Career", icon: PresentationChartLineIcon },
            { href: "/admin/career-requirements", label: "Career Requirements", icon: ListBulletIcon },
            { href: "/admin/partners", label: "Partners", icon: UserPlusIcon },
            { href: "/admin/applied", label: "Applied", icon: BriefcaseIcon },
        ],
    },
    {
        title: "Contacts",
        key: "contacts",
        links: [
            { href: "/admin/social-links", label: "Social Links", icon: LinkIcon },
            { href: "/admin/contact-numbers", label: "Contact Numbers", icon: FaPhone},
            { href: "/admin/contact-mails", label: "Contact Mails", icon: IoMailOpenSharp  },
            { href: "/admin/contact-address", label: "Contact Locations", icon: MapPinIcon },
        ],
    },
    {
        title: "Others",
        key: "others",
        links: [
            { href: "/admin/subscribes", label: "Subscribes", icon: EnvelopeIcon },
            { href: "/admin/cookie", label: "Cookie", icon: CircleStackIcon },
            { href: "/admin/privacy", label: "Privacy Policy", icon: ClipboardDocumentListIcon },
        ],
    },
];

const Sidebar = () => {
    const pathname = usePathname();
    const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});

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

    return (
        <aside className="w-64 bg-white shadow-md h-screen fixed" aria-label="Sidebar">
            <div className="h-full px-3 py-4 overflow-y-auto space-y-4">
                <div>
                    <a
                        href="/admin"
                        className="block p-2 font-semibold text-gray-900 rounded-lg hover:bg-gray-100"
                    >
                        Dashboard
                    </a>
                </div>

                {menuGroups.map((group) => (
                    <div key={group.key}>
                        <button
                            onClick={() => toggleGroup(group.key)}
                            className="w-full text-left px-2 py-2 text-sm font-bold text-gray-600 uppercase hover:bg-gray-100 rounded"
                        >
                            {group.title}
                        </button>

                        {openGroups[group.key] && (
                            <ul className="mt-1 space-y-1 ml-2">
                                {group.links.map(({ href, label, icon: Icon }) => (
                                    <li
                                        key={href}
                                        className={`flex items-center p-2 rounded-md font-medium ${
                                            isActive(href) ? "bg text-white" : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <Icon className={`size-5 ${isActive(href) ? "text-white" : "text-gray-500"}`} />
                                        <a href={href} className="ml-3 w-full block">
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
