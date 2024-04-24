/** @jsx h */
import { h } from "htm";
import { Message } from "../message.ts";

export function Messages(
  props: { messages: Message[]; search: string | null },
): JSX.Element {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  });
  return (
    <div class="messages">
      <form class="search">
        <h2>Messages</h2>
        <input
          name="search"
          placeholder="Search messages..."
          value={props.search ?? ""}
        />
        <button type="submit">Search</button>
      </form>
      <div class="message-row header">
        <span class="sender">Sender</span>
        <span class="subject">Subject</span>
        <span class="date">Date</span>
      </div>
      {props.messages.map((message) => (
        <a href={`/message/${message.id}`} class="message-row">
          <span>{message.sender}</span>
          <span>{message.subject}</span>
          <span>{dateFormatter.format(message.date)}</span>
        </a>
      ))}
    </div>
  );
}
