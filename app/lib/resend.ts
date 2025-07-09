import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTransactionalEmail({ to, subject, component }: { to: string; subject: string; component: React.ReactElement }) {
  try {
    const response = await resend.emails.send({
      from: "no-reply@cubepass.com",
      to,
      subject,
      react: component,
    });
    return { success: true, response };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}