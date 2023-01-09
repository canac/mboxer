/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, JSX } from "https://deno.land/x/htm@0.1.3/html.tsx";

export function Layout(
  props: { children?: JSX.Element },
): JSX.Element {
  return (
    <>
      <nav>
        <h1>mboxer</h1>
      </nav>
      <main>{props.children}</main>
    </>
  );
}
