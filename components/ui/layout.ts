/**
 * The page gutter — one definition of where the left edge of everything is.
 *
 * WHY IT IS A CONSTANT AND NOT JUST TYPED OUT. It was typed out, in six
 * places, and two of them disagreed. The hero sat in `max-w-6xl` while every
 * shelf below it sat in `max-w-[100rem]`, so on a 1920px screen the series
 * title started 224px to the right of every heading under it — a visible
 * stagger down the left edge of the front page. And Shelf padded its heading
 * but not its rail, so the titles sat 20px in from their own posters.
 *
 * Both were spotted by eye rather than caught (Melissa, 2026-09-16: "we need
 * some padding or margin here that left aligns the title with the images"),
 * which is what a value copied into six files eventually costs. Nothing that
 * imports this can drift from anything else that imports it.
 *
 * THE WIDTH IS DELIBERATELY WIDER THAN THE OLD max-w-6xl. A shelf wants to get
 * five or six cards on screen before it starts hiding them; 1152px got three.
 * Text inside it still sets its own measure — an h1 is `max-w-3xl`, a
 * paragraph `max-w-xl` — which constrains the line length without moving the
 * left edge. Measure and gutter are different problems and conflating them is
 * what produced the stagger.
 *
 * RAIL DEPENDS ON THE PADDING BEING EXACTLY THIS. Its scroller carries
 * `-mx-5 px-5` / `sm:-mx-2 sm:px-2` so cards can bleed to the screen edge
 * while the first one still lands on the content edge — see
 * components/browse/Rail.tsx. Change `px-5 sm:px-8` here and that has to
 * change with it.
 */
export const PAGE = "mx-auto w-full max-w-[100rem] px-5 sm:px-8";

/** The same box without the horizontal padding, for anything that pads itself. */
export const PAGE_WIDTH = "mx-auto w-full max-w-[100rem]";
