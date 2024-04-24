/** @jsx h */
import { h } from "htm";

export function Layout(
  props: {
    children?: JSX.Element;
    page: string;
  },
): JSX.Element {
  return (
    <body id={`${props.page}-page`}>
      <nav>
        {props.page !== "login" && (
          <form action="/logout" method="post">
            <button type="submit">Logout</button>
          </form>
        )}
        <a href="/">
          <h1>mboxer</h1>
        </a>
        {props.page !== "login" && (
          <a href="/import">
            <h2>Import</h2>
          </a>
        )}
      </nav>
      <main>{props.children}</main>
    </body>
  );
}
