import sgMail from '@sendgrid/mail';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  /**
   * 환경변수 가져오기 (동적 로딩)
   */
  private static getEnvVars() {
    return {
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
      FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@press-design-system.com',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
    };
  }

  /**
   * SendGrid 설정
   */
  private static setupSendGrid() {
    const { SENDGRID_API_KEY } = this.getEnvVars();
    
    if (SENDGRID_API_KEY) {
      sgMail.setApiKey(SENDGRID_API_KEY);
      console.log('SendGrid API key set successfully');
      return true;
    } else {
      console.log('SendGrid API key not found');
      return false;
    }
  }

  /**
   * 비밀번호 재설정 이메일 발송
   */
  static async sendPasswordResetEmail(
    to: string,
    username: string,
    resetToken: string
  ): Promise<boolean> {
    try {
      const { FRONTEND_URL } = this.getEnvVars();
      const resetUrl = `${FRONTEND_URL}/password/reset?token=${resetToken}`;
      
      const emailOptions: EmailOptions = {
        to,
        subject: '[Press Design System] 비밀번호 재설정',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">         <h2 style="color: #333">비밀번호 재설정</h2>
            <p>안녕하세요, <strong>${username}</strong>님.</p>
            <p>비밀번호 재설정을 요청하셨습니다.</p>
            <p>아래 버튼을 클릭하여 비밀번호를 재설정하세요:</p>            <div style="text-align: center; margin: 30px 0;">   
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">                비밀번호 재설정
              </a>
            </div>
            <p>이 링크는 1시간 후에 만료됩니다.</p>
            <p>비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">            <p style="color: #666; font-size: 12px;">              이 이메일은 Press Design System에서 발송되었습니다.
            </p>
          </div>
        `,
        text: `
          비밀번호 재설정
          
          안녕하세요, ${username}님.
          
          비밀번호 재설정을 요청하셨습니다.
          아래 링크를 클릭하여 비밀번호를 재설정하세요:
          
          ${resetUrl}
          
          이 링크는 1시간 후에 만료됩니다.
          
          비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.
        `
      };

      return await this.sendEmail(emailOptions);
    } catch (error) {
      console.error('Password reset email error:', error);
      return false;
    }
  }

  /**
   * 일반 이메일 발송
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const { SENDGRID_API_KEY, FROM_EMAIL } = this.getEnvVars();
      
      // SendGrid 설정
      const sendGridConfigured = this.setupSendGrid();
      


      // SendGrid API 키가 없을 때만 콘솔에 로그 출력
      if (!sendGridConfigured) {
        console.log('📧 SendGrid API key not found - logging email instead:');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('HTML:', options.html);
        console.log('Reset URL:', options.html.match(/href="([^"]+)"/)?.[1] || 'Not found');
        return true;
      }

      const msg = {
        to: options.to,
        from: FROM_EMAIL,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, '')   };

      await sgMail.send(msg);
      console.log('📧 Email sent successfully to:', options.to);
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  /**
   * 이메일 주소 유효성 검사
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 