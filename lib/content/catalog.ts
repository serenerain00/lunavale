/**
 * The catalog — one browsable surface over every kind of content in the vault.
 *
 * Scenes (lib/content/videos.ts) and still galleries (lib/content/gallery.ts)
 * are projected into a single `CatalogItem` shape so /browse can sort, filter,
 * and shelve them together. Add a new content kind by writing one more
 * projection here; the browse UI needs no changes.
 *
 * Everything below is pure: no React, no request state. Filtering happens on
 * the server from URL params, which keeps /browse deep-linkable and indexable.
 */

import { galleries } from "@/lib/content/gallery";
import {
  feelings as allFeelings,
  places as allPlaces,
  type FeelingId,
  type PlaceId,
} from "@/lib/content/taxonomy";
import {
  formatDuration,
  videos,
  type AccessLevel,
} from "@/lib/content/videos";

export type CatalogKind = "scene" | "gallery";

export interface CatalogItem {
  /** Unique across kinds — `${kind}:${slug}`. Used as a React key. */
  id: string;
  kind: CatalogKind;
  title: string;
  /** Short public-facing line under the title. */
  synopsis: string;
  /** Where clicking the card goes. */
  href: string;
  /** Card image (compressed web copy under /public). */
  poster: string;
  /** Short right-aligned card meta: runtime for scenes, count for galleries. */
  meta: string;
  access: AccessLevel;
  mature: boolean;
  feelings: FeelingId[];
  place: PlaceId;
}

/** Every browsable item, newest content kinds projected into one list. */
export const catalog: CatalogItem[] = [
  ...videos.map(
    (v): CatalogItem => ({
      id: `scene:${v.slug}`,
      kind: "scene",
      title: v.title,
      synopsis: v.synopsis,
      href: `/watch/${v.slug}`,
      poster: v.poster,
      meta: formatDuration(v.durationSeconds),
      access: v.access,
      mature: v.mature,
      feelings: [...v.feelings],
      place: v.place,
    }),
  ),
  ...galleries.map(
    (g): CatalogItem => ({
      id: `gallery:${g.id}`,
      kind: "gallery",
      title: g.title,
      synopsis: `${g.subtitle} — a set of stills from the evening.`,
      href: `/gallery/${g.id}`,
      poster: g.cover,
      meta: `${g.images.length} stills`,
      access: g.access,
      mature: g.mature,
      feelings: [...g.feelings],
      place: g.place,
    }),
  ),
];

/* ------------------------------------------------------------------ query */

export interface CatalogQuery {
  feelings: FeelingId[];
  places: PlaceId[];
}

export const emptyQuery: CatalogQuery = { feelings: [], places: [] };

/** Raw `searchParams` values as Next hands them to a page. */
export type RawParams = Record<string, string | string[] | undefined>;

/**
 * Read `?feeling=hurt,lies&place=farmhouse` into a query.
 * Unknown ids are dropped so a hand-edited URL can never 404 or render an
 * impossible filter state.
 */
export function parseQuery(params: RawParams): CatalogQuery {
  return {
    feelings: readIds(params.feeling, allFeelings.map((f) => f.id)),
    places: readIds(params.place, allPlaces.map((p) => p.id)),
  };
}

function readIds<T extends string>(
  raw: string | string[] | undefined,
  valid: readonly T[],
): T[] {
  if (!raw) return [];
  const parts = (Array.isArray(raw) ? raw : [raw]).flatMap((v) =>
    v.split(",").map((s) => s.trim()),
  );
  // Preserve taxonomy order and de-duplicate so URLs are canonical.
  return valid.filter((id) => parts.includes(id));
}

/** Serialize a query back to a /browse href. */
export function queryHref(query: CatalogQuery): string {
  const parts: string[] = [];
  if (query.feelings.length) parts.push(`feeling=${query.feelings.join(",")}`);
  if (query.places.length) parts.push(`place=${query.places.join(",")}`);
  return parts.length ? `/browse?${parts.join("&")}` : "/browse";
}

/** A new query with `id` toggled in the given facet. */
export function toggle(
  query: CatalogQuery,
  facet: "feelings" | "places",
  id: string,
): CatalogQuery {
  const current = query[facet] as string[];
  const next = current.includes(id)
    ? current.filter((v) => v !== id)
    : [...current, id];
  return { ...query, [facet]: next } as CatalogQuery;
}

export function isActive(query: CatalogQuery): boolean {
  return query.feelings.length > 0 || query.places.length > 0;
}

/* ----------------------------------------------------------------- filter */

/**
 * Within a facet the selections are OR'd (any of these feelings); across
 * facets they are AND'd (…and in one of these places). That's the behaviour
 * people expect from faceted browsing, and it keeps results from collapsing
 * to zero as soon as a second chip is picked.
 */
export function matches(item: CatalogItem, query: CatalogQuery): boolean {
  const feelingOk =
    query.feelings.length === 0 ||
    item.feelings.some((f) => query.feelings.includes(f));
  const placeOk =
    query.places.length === 0 || query.places.includes(item.place);
  return feelingOk && placeOk;
}

export function filterCatalog(
  query: CatalogQuery,
  items: CatalogItem[] = catalog,
): CatalogItem[] {
  return items.filter((item) => matches(item, query));
}

/** How many items a query would return. */
export function countFor(
  query: CatalogQuery,
  items: CatalogItem[] = catalog,
): number {
  return filterCatalog(query, items).length;
}

/**
 * How many items one facet value holds, in the context of the *other* facet's
 * current selection — the number a filter chip should show.
 *
 * Deliberately not "how many results if I add this chip": because values
 * within a facet are OR'd, that number only ever grows and tells the visitor
 * nothing (every unpicked feeling would report the same total, including
 * feelings with no content at all). Holding the same facet fixed to this one
 * value gives the honest count, and makes a 0 mean "genuinely nothing here".
 */
export function facetCount(
  query: CatalogQuery,
  facet: "feelings" | "places",
  id: string,
  items: CatalogItem[] = catalog,
): number {
  const scoped: CatalogQuery =
    facet === "feelings"
      ? { feelings: [id as FeelingId], places: query.places }
      : { feelings: query.feelings, places: [id as PlaceId] };
  return countFor(scoped, items);
}

/* ------------------------------------------------------------------ group */

export interface Shelf {
  feelingId: FeelingId;
  label: string;
  blurb: string;
  items: CatalogItem[];
}

/**
 * The default, unfiltered view: content sorted into shelves by emotional
 * context. Items appear on every shelf they carry — a scene can be both trust
 * and desire, and browsing by feeling should surface it under both.
 * Empty shelves are omitted, so the taxonomy can run ahead of the content.
 */
export function shelves(items: CatalogItem[] = catalog): Shelf[] {
  return allFeelings
    .map((feeling) => ({
      feelingId: feeling.id,
      label: feeling.label,
      blurb: feeling.blurb,
      items: items.filter((item) => item.feelings.includes(feeling.id)),
    }))
    .filter((shelf) => shelf.items.length > 0);
}
