import Route from "../core/route"

// Sort the routes based on whether they have parameters
export default function sortRoutes(routes: Route[]) {
  return routes.sort((a, b) => {
    const aHasParams = a.path.includes(":")
    const bHasParams = b.path.includes(":")

    if (aHasParams && !bHasParams) {
      return 1 // Route 'a' has parameters, so it comes after 'b'
    } else if (!aHasParams && bHasParams) {
      return -1 // Route 'b' has parameters, so it comes after 'a'
    } else {
      return 0 // Both routes have parameters or neither, so no specific order
    }
  })
}
