export function getDisplayName(client: {
  firstName: string
  middleName?: string | null
  lastName?: string | null
}): string {
  return [client.lastName, client.middleName, client.firstName]
    .filter(Boolean)
    .join(' ')
}
