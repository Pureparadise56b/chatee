import twilio from "twilio";

export const sendOTP = async (otp: string, phoneNumber: string) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      {
        autoRetry: true,
        maxRetries: 3,
      }
    );

    const response = await client.messages.create({
      body: `Your Chatee App verification code is: ${otp}`,
      from: "+16562269634",
      to: phoneNumber,
    });

    console.log(`OPT sent to: ${response.to}`);
    return true;
  } catch (error) {
    console.error("Twilio Error: ", error);
    return false;
  }
};
