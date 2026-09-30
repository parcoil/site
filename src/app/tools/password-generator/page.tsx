import PasswordGenerator from "@/components/pages/tools/Password";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("password-generator");

export default function Page() {
  return (
    <ToolPage
      slug="password-generator"
      about={
        <>
          <h2>Why Use a Password Generator?</h2>
          <p>
            In today&apos;s digital world, having strong passwords is essential for protecting your
            personal information. Weak or repeated passwords are one of the most common causes of
            account breaches and identity theft.
          </p>
          <p>
            Our password generator uses your browser&apos;s cryptographically secure random number
            generator to create unpredictable combinations of characters that are virtually
            impossible to crack through brute force. Passwords are generated on your device and
            never sent anywhere.
          </p>
          <h3>What Do the Bits Mean?</h3>
          <p>
            Entropy, measured in bits, is how many guesses an attacker would need: every extra bit
            doubles the work. Aim for at least 60 bits for everyday accounts and 80 or more for
            important ones like email and banking.
          </p>
          <h3>Benefits of Strong Passwords</h3>
          <ul>
            <li>Protect personal and financial information</li>
            <li>Prevent unauthorized access to your accounts</li>
            <li>Reduce the risk of identity theft</li>
            <li>Maintain privacy across multiple platforms</li>
          </ul>
          <h3>How to Use This Tool</h3>
          <ol>
            <li>Adjust the password length using the slider</li>
            <li>Select which character types to include</li>
            <li>Copy your generated password with one click</li>
            <li>Use a different password for each of your accounts</li>
          </ol>
        </>
      }
    >
      <PasswordGenerator />
    </ToolPage>
  );
}
