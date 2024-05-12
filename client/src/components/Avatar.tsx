import defaultAvatar from "../assets/default-avatar.svg"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL

export default function Avatar({ src }) {
  const completeSrc = src ? SERVER_BASE_URL + src : defaultAvatar

  return (
    <div className="w-[4rem] h-[4rem] rounded-full relative overflow-hidden">
      <img src={completeSrc} alt="" className="w-full h-full" />
    </div>
  )
}
