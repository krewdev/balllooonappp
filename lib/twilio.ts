import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const useMockTwilio = process.env.MOCK_TWILIO === 'true';

// Mock Twilio client for testing without real credentials
const mockTwilioClient = {
  messages: {
    create: async (options: any) => {
      console.log('📱 [MOCK SMS] Would send SMS:', {
        to: options.to,
        from: options.from,
        body: options.body?.substring(0, 100) + '...'
      });
      return {
        sid: 'MOCK_' + Date.now(),
        status: 'queued',
        to: options.to,
        from: options.from
      };
    }
  }
};

let twilioClient: any;

if (useMockTwilio) {
  console.log('⚠️  Using MOCK Twilio client (no real SMS will be sent)');
  twilioClient = mockTwilioClient;
} else {
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials are not configured in environment variables.");
  }
  twilioClient = twilio(accountSid, authToken);
}

export { twilioClient };
