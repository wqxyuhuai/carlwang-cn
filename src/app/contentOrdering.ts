export type OrderedContent = {
  id: string;
  title: string;
  time?: string;
  year?: number;
  sortOrder?: number;
};

function timeValue(item: OrderedContent) {
  if (!item.time) return 0;
  const value = Date.parse(item.time.replace(/\//g, "-"));
  return Number.isFinite(value) ? value : 0;
}

export function sortByDisplayOrder<T extends OrderedContent>(items: T[]) {
  return items.slice().sort((a, b) => {
    const orderA = a.sortOrder ?? Number.POSITIVE_INFINITY;
    const orderB = b.sortOrder ?? Number.POSITIVE_INFINITY;
    if (orderA !== orderB) return orderA - orderB;

    const timeA = timeValue(a);
    const timeB = timeValue(b);
    if (timeA !== timeB) return timeB - timeA;

    const yearA = a.year ?? 0;
    const yearB = b.year ?? 0;
    if (yearA !== yearB) return yearB - yearA;

    return a.title.localeCompare(b.title);
  });
}

export function withDefaultSortOrder<T extends OrderedContent>(items: T[]) {
  const defaultOrder = new Map<string, number>();
  items
    .slice()
    .sort((a, b) => {
      const timeA = timeValue(a);
      const timeB = timeValue(b);
      if (timeA !== timeB) return timeB - timeA;

      const yearA = a.year ?? 0;
      const yearB = b.year ?? 0;
      if (yearA !== yearB) return yearB - yearA;
      return a.title.localeCompare(b.title);
    })
    .forEach((item, index) => defaultOrder.set(item.id, index + 1));

  return items.map((item) => ({
    ...item,
    sortOrder: item.sortOrder ?? defaultOrder.get(item.id) ?? items.length + 1,
  }));
}

export function reorderIds(ids: string[], fromId: string, toId: string) {
  const from = ids.indexOf(fromId);
  const to = ids.indexOf(toId);
  if (from < 0 || to < 0 || from === to) return ids;

  const next = ids.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
