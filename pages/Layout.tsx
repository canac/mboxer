/** @jsx h */
import { h, JSX } from "htm";

export function Layout(
  props: {
    children?: JSX.Element;
    page: string;
  },
): JSX.Element {
  return (
    <body id={`${props.page}-page`}>
      <nav>
        <a href="/">
          <h1>mboxer</h1>
        </a>
      </nav>
      <main>{props.children}</main>
    </body>
  );
}
