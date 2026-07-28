import { createHmac, randomBytes } from 'crypto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

/**
 * Outbound SMS.
 *
 * Members are identified by phone number — there is no email field — so SMS is the only
 * out-of-band channel available for password recovery.
 *
 * Two providers:
 *   log     — writes the message to the log. Development only.
 *   solapi  — SOLAPI (solapi.com), the usual choice for Korean domestic SMS.
 *
 * Selected with SMS_PROVIDER. The service refuses to boot in production with the `log`
 * provider, because that would mean printing password reset codes to stdout while
 * appearing to work.
 */
export interface SmsMessage {
	to: string;
	text: string;
}

@Injectable()
export class SmsService implements OnModuleInit {
	private readonly logger = new Logger(SmsService.name);
	private readonly provider = (process.env.SMS_PROVIDER ?? 'log').toLowerCase();

	public onModuleInit(): void {
		const isProduction = process.env.NODE_ENV === 'production';

		if (isProduction && this.provider === 'log') {
			throw new Error(
				'SMS_PROVIDER is "log" in production. Reset codes would be written to stdout instead of ' +
					'being delivered. Configure SMS_PROVIDER=solapi with SOLAPI_API_KEY, SOLAPI_API_SECRET ' +
					'and SOLAPI_SENDER.',
			);
		}

		if (this.provider === 'solapi') {
			for (const key of ['SOLAPI_API_KEY', 'SOLAPI_API_SECRET', 'SOLAPI_SENDER']) {
				if (!process.env[key]) {
					throw new Error(`SMS_PROVIDER is "solapi" but ${key} is not set.`);
				}
			}
		}

		this.logger.log(`SMS provider: ${this.provider}`);
	}

	/**
	 * Returns true when the message was handed to the provider.
	 *
	 * Never throws: callers must not be able to distinguish a delivery failure from an
	 * unknown recipient, and a provider outage should not turn into a 500 on a public
	 * endpoint. Failures are logged and reported.
	 */
	public async send(message: SmsMessage): Promise<boolean> {
		try {
			if (this.provider === 'solapi') {
				return await this.sendViaSolapi(message);
			}

			this.logger.warn(`[sms:log] to=${this.maskPhone(message.to)} text=${message.text}`);
			return true;
		} catch (error) {
			this.logger.error(
				`SMS delivery failed for ${this.maskPhone(message.to)} — ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			return false;
		}
	}

	/**
	 * SOLAPI authenticates with an HMAC-SHA256 signature over `date + salt`.
	 * https://developers.solapi.com/references/authentication
	 */
	private async sendViaSolapi(message: SmsMessage): Promise<boolean> {
		const apiKey = process.env.SOLAPI_API_KEY as string;
		const apiSecret = process.env.SOLAPI_API_SECRET as string;
		const sender = process.env.SOLAPI_SENDER as string;

		const date = new Date().toISOString();
		const salt = randomBytes(32).toString('hex');
		const signature = createHmac('sha256', apiSecret)
			.update(date + salt)
			.digest('hex');

		// Without a timeout a hung provider would hold the request open indefinitely.
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10_000);

		try {
			const response = await fetch('https://api.solapi.com/messages/v4/send', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
				},
				body: JSON.stringify({
					message: {
						to: message.to.replace(/-/g, ''),
						from: sender,
						text: message.text,
					},
				}),
				signal: controller.signal,
			});

			if (!response.ok) {
				const body = await response.text();
				this.logger.error(`SOLAPI responded ${response.status}: ${body.slice(0, 500)}`);
				return false;
			}

			return true;
		} finally {
			clearTimeout(timeout);
		}
	}

	/** Phone numbers are personal data; never write them to logs in full. */
	private maskPhone(phone: string): string {
		const digits = phone.replace(/\D/g, '');
		if (digits.length < 4) return '***';
		return `***${digits.slice(-4)}`;
	}
}
