declare module 'sib-api-v3-sdk' {
  class ApiClient {
    static instance: ApiClient;
    authentications: {
      'api-key': {
        apiKey: string;
      };
    };
  }

  class TransactionalEmailsApi {
    sendTransacEmail(sendEmailRequest: SendSmtpEmail): Promise<any>;
  }

  class SendSmtpEmail {
    subject: string;
    htmlContent: string;
    sender: {
      email: string;
      name: string;
    };
    to: Array<{
      email: string;
    }>;
  }

  const SibApiV3Sdk: {
    ApiClient: typeof ApiClient;
    TransactionalEmailsApi: typeof TransactionalEmailsApi;
    SendSmtpEmail: typeof SendSmtpEmail;
  };

  export default SibApiV3Sdk;
} 