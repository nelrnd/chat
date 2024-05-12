export function getChatName(members) {
  if (members.length === 1) {
    return members[0].name
  } else {
    return members.reduce((acc, curr, id) => acc + (id > 0 ? ", " : "") + curr.name, "") + " and you"
  }
}
