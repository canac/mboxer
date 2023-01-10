/** @jsx h */
import { h, JSX } from "htm";
import { MessageWithId } from "../message.ts";

export function Messages(props: { messages: MessageWithId[] }): JSX.Element {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  });
  return (
    <div class="messages">
      <h2>Messages</h2>
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
