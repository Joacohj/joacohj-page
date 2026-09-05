import { cn } from "@/lib/utils";


export default function Icon({address, width, height, className}: {address: string; width?: number, height?: number, className?: string}) {
    return <div className={cn('w-fit h-auto overflow-hidden', className)}>
            <img src={address} width={width ?? 15} height={height ?? 15} className="object-cover w-full h-full"/>
    </div>
}