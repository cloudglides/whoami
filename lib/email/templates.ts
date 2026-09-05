export function renderRecipientFormEmail(
  recipientName: string,
  token: string,
  baseUrl: string
): { subject: string; html: string; text: string } {
  const link = `${baseUrl}/recipient/${token}`;
  return {
    subject: "Your Hack Club Passport — details needed",
    html: `<p>Hi ${recipientName},</p><p>Your Hack Club Passport is being prepared. Please fill in your delivery details:</p><p><a href="${link}">${link}</a></p>`,
    text: `Hi ${recipientName},\n\nYour Hack Club Passport is being prepared. Fill in your delivery details: ${link}\n`,
  };
}
