/** @jsx h */
import { h } from "htm";
import { GetMessageAttachmentsResult } from "../db.ts";
import type { Message } from "../message.ts";

export function Message(
  props: { message: Message; attachments: GetMessageAttachmentsResult },
): JSX.Element {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  });
  return (
    <div class="message">
      <h2>{props.message.subject}</h2>
      {props.attachments.length > 0 && (
        <div class="attachments">
          <h3>Attachments</h3>
          {props.attachments.map((attachment) => (
            <a
              id={attachment.id}
              href={`/message/${props.message.id}/attachment/${attachment.id}`}
            >
              {attachment.filename ?? attachment.id}
            </a>
          ))}
        </div>
      )}
      <div class="header">
        <span class="sender">{props.message.sender}</span>
        <span class="date">{dateFormatter.format(props.message.date)}</span>
      </div>
      <div class="content" data-content={props.message.content} />
    </div>
  );
}
