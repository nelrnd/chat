export default function About() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-[56rem] m-auto px-3 space-y-6">
        <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">About this app</h1>
        <p className="max-w-[26rem] text-neutral-300 text-justify">
          MiChat is a web app I have created to train my design and development skills. It has been designed with Figma.
          It uses Node.js, Express and MongoDB for the server-side and React for the client-side, and Socket.io for
          real-time communication between the two.
        </p>
        <ul className="space-y-3">
          <li>
            <a href="#" target="_blank" rel="noopener noreferrer" className="font-medium text-white hover:underline">
              Figma design file
            </a>
          </li>
          <li>
            <a href="#" target="_blank" rel="noopener noreferrer" className="font-medium text-white hover:underline">
              Code on GitHub
            </a>
          </li>
        </ul>
      </div>
    </section>
  )
}
