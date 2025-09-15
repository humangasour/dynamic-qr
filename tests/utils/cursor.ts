export function makeCursor(updatedAt: string, id: string) {
  return `${updatedAt}|${id}`;
}

export function parseCursor(cursor: string) {
  const [updatedAt, id] = cursor.split('|');
  return { updated_at: updatedAt, id };
}
