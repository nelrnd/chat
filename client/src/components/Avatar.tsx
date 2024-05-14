import { cn } from "@/lib/utils"
import defaultAvatar from "../assets/default-avatar.svg"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL

interface AvatarProps {
  src: string
  className?: string
}

export default function Avatar({ src, className }: AvatarProps) {
  const completeSrc = src
    ? src.includes("http://") || src.includes("https://")
      ? src
      : SERVER_BASE_URL + "/" + src
    : defaultAvatar

  return (
    <div className={cn("w-[4rem] aspect-square rounded-full relative overflow-hidden", className)}>
      <img src={completeSrc} alt="" className="w-full h-full object-cover select-none" />
    </div>
  )
}
