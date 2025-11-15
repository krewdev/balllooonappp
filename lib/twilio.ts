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

let twilioClientInstance: any = null;

// Lazy initialization to avoid errors during build when env vars aren't available
function getTwilioClient() {
  if (twilioClientInstance) {
    return twilioClientInstance;
  }

  if (useMockTwilio) {
    console.log('⚠️  Using MOCK Twilio client (no real SMS will be sent)');
    twilioClientInstance = mockTwilioClient;
    return twilioClientInstance;
  }

  if (!accountSid || !authToken) {
    // During build, return mock client instead of throwing
    // Check if we're in a build context (Next.js sets this)
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NEXT_PHASE === 'phase-development-build';
    
    if (isBuildTime) {
      // During build, use mock to avoid errors
      twilioClientInstance = mockTwilioClient;
      return twilioClientInstance;
    }
    
    // In runtime without credentials, use mock (won't send real SMS)
    twilioClientInstance = mockTwilioClient;
    return twilioClientInstance;
  }

  twilioClientInstance = twilio(accountSid, authToken);
  return twilioClientInstance;
}

// Export as a getter object that looks like the original client
const twilioClient = {
  get messages() {
    return getTwilioClient().messages;
  }
};

export { twilioClient };
