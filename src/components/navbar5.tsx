"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const Navbar5 = () => {

    const features = [
        {
            title: "Blogs",
            description: "Latest news and product updates",
            href: "https://www.limelight.chat/blog",
        },
        {
            title: "Docs",
            description: "Learn how to use Limelight.",
            href: "https://www.limelight.chat/docs",
        },
    ];


    const pathname = usePathname();

    // Dynamically change the label based on route
    const isConsumerPage = pathname.startsWith("/consumer");
    const consumerLabel = isConsumerPage ? "Business" : "Consumer";
    const consumerHref = isConsumerPage ? "https://www.limelight.chat" : "https://www.limelight.chat/consumer";

    return (
        <section className="py-4 absolute top-0 w-full z-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <nav className="flex items-center justify-between relative">
                    <Link href="https://www.limelight.chat" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                        <Image src="/logo.png" alt="Limelight Logo" width={14} height={14} className="rounded-sm" />
                        <span className="text-lg font-semibold tracking-tighter text-white">
                            Limelight
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <NavigationMenu
                        className="hidden lg:block absolute left-1/2 -translate-x-1/2"
                        suppressHydrationWarning
                    >
                        <NavigationMenuList className="gap-2">
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    href={consumerHref}
                                    className={navigationMenuTriggerStyle() + " bg-transparent text-white hover:bg-[#2f2f2f] hover:text-white focus:bg-[#2f2f2f] focus:text-white data-[active]:bg-transparent data-[state=open]:bg-transparent"}
                                >
                                    {consumerLabel}
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    href="https://www.limelight.chat/pricing"
                                    className={navigationMenuTriggerStyle() + " bg-transparent text-white hover:bg-[#2f2f2f] hover:text-white focus:bg-[#2f2f2f] focus:text-white data-[active]:bg-transparent data-[state=open]:bg-transparent"}
                                >
                                    Pricing
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="bg-transparent text-white hover:bg-[#2f2f2f] hover:text-white focus:bg-[#2f2f2f] focus:text-white data-[active]:bg-transparent data-[state=open]:!bg-[#2f2f2f] data-[state=open]:text-white">Resources</NavigationMenuTrigger>
                                <NavigationMenuContent className="bg-[#1f1e1e] border-[#2e2d2d] backdrop-blur-sm">
                                    <div className="grid w-[600px] grid-cols-2 p-3">
                                        {features.map((feature, index) => (
                                            <NavigationMenuLink
                                                href={feature.href}
                                                key={index}
                                                className="hover:bg-[#2f2f2f] focus:bg-[#2f2f2f] active:bg-[#2f2f2f] rounded-md p-3 transition-colors block no-underline outline-none"
                                            >
                                                <div key={feature.title}>
                                                    <p className="text-[#f5f5f0] mb-1 font-semibold">
                                                        {feature.title}
                                                    </p>
                                                    <p className="text-muted-foreground text-sm">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </NavigationMenuLink>
                                        ))}
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    href="https://www.limelight.chat/contact"
                                    className={navigationMenuTriggerStyle() + " bg-transparent text-white hover:bg-[#2f2f2f] hover:text-white focus:bg-[#2f2f2f] focus:text-white data-[active]:bg-transparent data-[state=open]:bg-transparent"}
                                >
                                    Contact Us
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    {/* Desktop Buttons */}
                    <div className="hidden items-center gap-4 lg:flex">
                        <Button variant="ghost" className="text-[#f5f5f0] hover:!bg-[#2f2f2f] hover:!text-white transition-colors">Log In</Button>
                        <Button className="bg-transparent border border-[#b04d16] text-[#fcddcc] hover:bg-[#b04d16]/10 hover:text-[#fcddcc] hover:border-[#b04d16] transition-colors">Get Started</Button>
                    </div>

                    {/* Mobile Navigation */}
                    <Sheet>
                        <SheetTrigger asChild className="lg:hidden">
                            <Button variant="outline" size="icon" className="bg-transparent border-[#3d3d3d] text-white hover:bg-[#2f2f2f] hover:text-white">
                                <MenuIcon className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="top" className="max-h-screen overflow-auto bg-[#171616] border-b border-[#2e2d2d] text-[#f5f5f0]">
                            <SheetHeader>
                                <SheetTitle>
                                    <Link href="https://www.limelight.chat" className="flex items-center gap-2">
                                        <Image src="/logo.png" alt="Limelight Logo" width={14} height={14} className="rounded-sm" />
                                        <span className="text-lg font-semibold tracking-tighter text-white">
                                            Limelight
                                        </span>
                                    </Link>
                                </SheetTitle>
                            </SheetHeader>

                            <div className="flex flex-col p-4">
                                <div className="flex flex-col gap-6">
                                    {/* Mobile version: also dynamic */}
                                    <a href={consumerHref} className="font-medium text-[#a3a3a3] hover:text-white">
                                        {consumerLabel}
                                    </a>

                                    <a href="https://www.limelight.chat/pricing" className="font-medium text-[#a3a3a3] hover:text-white">
                                        Pricing
                                    </a>
                                    <a href="https://www.limelight.chat/contact" className="font-medium text-[#a3a3a3] hover:text-white">
                                        Contact Us
                                    </a>
                                </div>
                                <Accordion type="single" collapsible className="mb-2 mt-4">
                                    <AccordionItem value="solutions" className="border-none">
                                        <AccordionTrigger className="text-base text-[#a3a3a3] hover:text-white hover:no-underline">
                                            Resources
                                        </AccordionTrigger>
                                        <AccordionContent className="bg-[#1f1e1e] rounded-md p-2 mt-2">
                                            <div className="grid md:grid-cols-2">
                                                {features.map((feature, index) => (
                                                    <a
                                                        href={feature.href}
                                                        key={index}
                                                        className="hover:bg-[#2f2f2f] focus:bg-[#2f2f2f] active:bg-[#2f2f2f] rounded-md p-3 transition-colors block no-underline outline-none"
                                                    >
                                                        <div key={feature.title}>
                                                            <p className="text-[#f5f5f0] mb-1 font-semibold">
                                                                {feature.title}
                                                            </p>
                                                            <p className="text-muted-foreground text-sm">
                                                                {feature.description}
                                                            </p>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <div className="mt-6 flex flex-col gap-4">
                                    <Button variant="ghost" className="text-[#f5f5f0] hover:!bg-[#2f2f2f] hover:!text-white justify-start px-0 transition-colors">Log In</Button>
                                    <Button className="bg-transparent border border-[#b04d16] text-[#fcddcc]">Get Started</Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </nav>
            </div>
        </section>
    );
};

export { Navbar5 };