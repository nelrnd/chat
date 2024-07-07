function createMessage({ chat, from, game}) {
  let message, images, links

  if (game) {
    message = new Message({
      type: "game",
      game: game,
      from,
      chat
    })
  } else {
    if (!text && !files.length) {
      throw new Error({ message: "Message cannot be empty", status: 400 })
    }

    [images, links] = await Promise.all([createImages])
  }
}