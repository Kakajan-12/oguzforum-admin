'use client';
import Link from "next/link";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {
    NewspaperIcon,
    BriefcaseIcon,
    PresentationChartLineIcon,
    QuestionMarkCircleIcon,
    WindowIcon,
    UserPlusIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon,
    ArrowRightIcon,
} from "@heroicons/react/16/solid";
import { BsNewspaper } from "react-icons/bs";

const cards = [
    { href: "/admin/news", label: "News", desc: "Articles & newsroom", Icon: NewspaperIcon },
    { href: "/admin/press", label: "Press", desc: "Press releases", Icon: BsNewspaper },
    { href: "/admin/projects", label: "Projects", desc: "Events & projects", Icon: BriefcaseIcon },
    { href: "/admin/career", label: "Career", desc: "Vacancies & partners", Icon: PresentationChartLineIcon },
    { href: "/admin/applied", label: "Applied", desc: "Job applications", Icon: UserPlusIcon },
    { href: "/admin/faq", label: "FAQ", desc: "Questions & answers", Icon: QuestionMarkCircleIcon },
    { href: "/admin/hero-video", label: "Hero Video", desc: "Homepage hero", Icon: WindowIcon },
    { href: "/admin/contact-numbers", label: "Contacts", desc: "Phones, mails, address", Icon: PhoneIcon },
    { href: "/admin/telegram", label: "Telegram Bot", desc: "Chat bot settings", Icon: ChatBubbleLeftRightIcon },
];

const AdminPanel = () => {
    return (
        <div className="admin-page flex">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 lg:p-10">
                <TokenTimer />

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Welcome back — manage the OGUZ Forum &amp; Expo website content.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map(({ href, label, desc, Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group admin-card flex items-center gap-4 p-5 transition-shadow hover:shadow-md"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1268B3]/10 text-[#1268B3]">
                                <Icon className="size-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900">{label}</p>
                                <p className="truncate text-sm text-gray-500">{desc}</p>
                            </div>
                            <ArrowRightIcon className="size-4 text-gray-300 transition-colors group-hover:text-[#1268B3]" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
