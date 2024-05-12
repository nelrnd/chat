exports.findSocket = function (io, userId) {
  return (Array.from(io.sockets.sockets).find((socket) => socket[1].userId === userId) || [])[1]
}
