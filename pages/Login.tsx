/** @jsx h */
import { h, JSX } from "htm";

export function Login(): JSX.Element {
  return (
    <div class="login">
      <form method="post">
        <h2>Login</h2>
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
