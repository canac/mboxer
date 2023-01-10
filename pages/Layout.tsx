/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, JSX } from "htm";

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
