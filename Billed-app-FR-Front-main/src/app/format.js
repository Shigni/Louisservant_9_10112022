export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`
}

export const reverseFormatDate = (frenchDateStr) => {
  let validDate = frenchDateStr.toString().replace('Déc', 'Dec')
  validDate = validDate.replace('Août', 'Aug')
  validDate = validDate.replace('Fév', 'Feb')
  validDate = validDate.replace('Avr', 'Apr')
  validDate = validDate.replace('Mai', 'May')
  validDate = validDate.replace('Juin', 'Jun')
  validDate = validDate.replace('Jui', 'Jul')

  return validDate
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}