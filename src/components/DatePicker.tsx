"use client"
import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"
export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>()
  return (
    <Popover>
      <PopoverTrigger render={<Button variant={"outline"} data-empty={!date} className="w-[212px] justify-between text-left items-center flex font-normal data-[empty=true]:text-muted-foreground">{date ? format(date, "PPP") : <span className="flex items-center gap-2"><CalendarIcon/> Pick a date</span>}<ChevronDownIcon data-icon="inline-end" /></Button>} />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>  
  )
}