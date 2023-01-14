/** @jsx h */
import { h, JSX } from "htm";
import { Message } from "../message.ts";

export function Message(props: { message: Message }): JSX.Element {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  });
  return (
    <div class="message">
      <h2>{props.message.subject}</h2>
      <div class="header">
        <span class="sender">{props.message.sender}</span>
        <span class="date">{dateFormatter.format(props.message.date)}</span>
      </div>
      <div class="content" data-content={props.message.content} />
    </div>
  );
}
