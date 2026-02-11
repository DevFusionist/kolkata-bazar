/**
 * Twilio Verify API for login OTP.
 * https://www.twilio.com/docs/verify/api
 */

export type SendOtpResult = { success: true } | { success: false; message: string };
export type VerifyOtpResult = { success: true } | { success: false; message: string };

/** E.164 format (e.g. +919876543210). */
export function normalizeMobile(v: string): string {
  const digits = v.replace(/\D/g, "").replace(/^0+/, "");
  const withCode = digits.startsWith("91") ? digits : `91${digits}`;
  return `+${withCode}`;
}

function getConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!accountSid || !authToken || !serviceSid) {
    throw new Error("TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID are required");
  }
  return { accountSid, authToken, serviceSid };
}

/**
 * Send OTP to the given phone via Twilio Verify (SMS).
 * Number must be E.164 (e.g. +919876543210).
 */
export async function sendOtp(to: string): Promise<SendOtpResult> {
  try {
    console.log("to", to)
    const { accountSid, authToken, serviceSid } = getConfig();
    const normalized = to.startsWith("+") ? to : normalizeMobile(to);
    const url = `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`;
    const body = new URLSearchParams({
      To: normalized,
      Channel: "sms",
    });
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      },
      body: body.toString(),
    });
    const data = (await res.json()) as { status?: string; message?: string };
    if (res.ok && data.status === "pending") {
      return { success: true };
    }
    return {
      success: false,
      message: (data.message as string) || "Failed to send OTP",
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to send OTP",
    };
  }
}

/**
 * Verify OTP with Twilio Verify.
 * Twilio returns 404 when the verification was already approved, expired (~10 min), or max attempts reached.
 * @see https://www.twilio.com/docs/verify/api/verification-check
 */
export async function verifyOtp(to: string, code: string): Promise<VerifyOtpResult> {
  try {
    const { accountSid, authToken, serviceSid } = getConfig();
    const normalized = to.startsWith("+") ? to : normalizeMobile(to);
    const url = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;
    const body = new URLSearchParams({
      To: normalized,
      Code: code.trim(),
    });
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      },
      body: body.toString(),
    });
    const data = (await res.json()) as { status?: string; message?: string };
    if (res.ok && data.status === "approved") {
      return { success: true };
    }
    if (res.status === 404) {
      return {
        success: false,
        message:
          "This code has expired or was already used. Please request a new code and try again.",
      };
    }
    return {
      success: false,
      message: (data.message as string) || "Invalid or expired code",
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Verification failed",
    };
  }
}

export function isTwilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_VERIFY_SERVICE_SID
  );
}
