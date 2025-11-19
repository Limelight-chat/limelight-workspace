"use client"

import { useState } from "react"
import { IconPlus } from "@tabler/icons-react"
import { ArrowRightIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"

export default function InputBox() {
    const [text, setText] = useState("")
    const hasText = text.trim().length > 0

    return(
        <InputGroup>
            <InputGroupTextarea 
              placeholder="Ask, Search or Chat..." 
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <InputGroupAddon align="block-end">
              <InputGroupButton
                variant="outline"
                className="rounded-full cursor-pointer"
                size="icon-xs"
              >
                <IconPlus />
              </InputGroupButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <InputGroupButton variant="ghost" className=" cursor-pointer">Auto</InputGroupButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="[--radius:0.95rem]"
                >
                  <DropdownMenuItem>Auto</DropdownMenuItem>
                  <DropdownMenuItem>Agent</DropdownMenuItem>
                  <DropdownMenuItem>Manual</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <InputGroupText className="ml-auto">52% used</InputGroupText>
              <Separator orientation="vertical" className="h-4" />
              <InputGroupButton
                variant="default"
                className={`rounded-full transition-colors ${hasText ? 'bg-[#E67820] hover:bg-[#E67820]/90' : ''}`}
                size="icon-xs"
                disabled={!hasText}
              >
                <ArrowRightIcon className={hasText ? 'text-white' : ''} />
                <span className="sr-only">Send</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
    )
}