"use client"

import * as React from "react"
import {
    CreditCard,
    Settings,
    User,
    Ticket,
    BookOpen,
    LayoutDashboard,
    Search,
} from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const navigate = useNavigate()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-64 lg:w-80"
                onClick={() => setOpen(true)}
            >
                <span className="hidden lg:inline-flex">Search documentation...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Pages">
                        <CommandItem
                            onSelect={() => runCommand(() => navigate({ to: "/app" as any }))}
                        >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => navigate({ to: "/app/tickets" as any }))}
                        >
                            <Ticket className="mr-2 h-4 w-4" />
                            <span>Tickets</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => navigate({ to: "/app/kb" as any }))}
                        >
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>Knowledge Base</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => navigate({ to: "/app/settings" as any }))}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                </CommandList>
            </CommandDialog>
        </>
    )
}
