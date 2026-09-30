import JwtDecoder from "@/components/pages/tools/JwtDecoder";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("jwt-decoder");

export default function Page() {
  return (
    <ToolPage
      slug="jwt-decoder"
      about={
        <>
          <h2>What Is a JWT?</h2>
          <p>
            A JSON Web Token is a compact, URL-safe way to pass claims between systems, most often
            as a login session or API access token. It has three Base64URL-encoded parts separated
            by dots: a <strong>header</strong> describing the algorithm, a{" "}
            <strong>payload</strong> of claims, and a <strong>signature</strong>.
          </p>
          <h2>Standard Claims</h2>
          <ul>
            <li><code>iss</code> - who issued the token</li>
            <li><code>sub</code> - who the token is about, usually a user ID</li>
            <li><code>aud</code> - who the token is intended for</li>
            <li><code>iat</code>, <code>nbf</code>, <code>exp</code> - issued at, valid from and expiry times (Unix seconds)</li>
          </ul>
          <h2>Is It Safe to Paste My Token Here?</h2>
          <p>
            Decoding and HMAC verification happen entirely in your browser, and the token is never
            sent anywhere. Remember that a JWT&apos;s payload is only encoded, not encrypted, so
            anyone holding the token can read it. Never put secrets in a JWT payload.
          </p>
        </>
      }
    >
      <JwtDecoder />
    </ToolPage>
  );
}
