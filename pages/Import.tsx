/** @jsx h */
import { h } from "htm";

export function Import(): JSX.Element {
  return (
    <div class="import">
      <form method="post" encType="multipart/form-data">
        <h2>Import</h2>
        <input
          type="file"
          accept=".mbox"
          name="mailbox"
          required
          placeholder="MBOX file"
        />
        <button type="submit">Import</button>
      </form>
    </div>
  );
}
