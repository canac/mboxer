/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, JSX } from "htm";

export function Layout(
  props: { children?: JSX.Element },
): JSX.Element {
  return (
    <>
      <nav>
        <a href="/">
          <h1>mboxer</h1>
        </a>
      </nav>
      <main>{props.children}</main>
    </>
  );
}
