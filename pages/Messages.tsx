/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, JSX } from "https://deno.land/x/htm@0.1.3/html.tsx";
import { MessageWithId } from "../message.ts";

export function Messages(props: { messages: MessageWithId[] }): JSX.Element {
  return (
    <>
      <h2>Messages</h2>
      <div class="message-row header">
        <span class="from">From</span>
        <span class="subject">Subject</span>
        <span class="date">Date</span>
      </div>
      {props.messages.map((message) => (
        <a href={`/message/${message.id}`} class="message-row">
          <span>{message.from}</span>
          <span>{message.subject}</span>
          <span>{message.date}</span>
        </a>
      ))}
    </>
  );
}
