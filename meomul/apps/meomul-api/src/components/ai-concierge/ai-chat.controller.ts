import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsIn,
	IsOptional,
	IsString,
	Matches,
	MaxLength,
	MinLength,
	ValidateNested,
} from 'class-validator';
import type { Request, Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { AiChatService, type ChatEvent } from './ai-chat.service';
import { resolveVisitorKey } from './ai-quota.service';

class AiChatTurnDto {
	@IsIn(['user', 'assistant'])
	role: 'user' | 'assistant';

	@IsString()
	@MinLength(1)
	@MaxLength(4000)
	content: string;
}

class AiShownStayDto {
	@Matches(/^[a-f0-9]{24}$/i)
	hotelId: string;

	@IsString()
	@MaxLength(120)
	title: string;
}

export class AiChatRequestDto {
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(30)
	@ValidateNested({ each: true })
	@Type(() => AiChatTurnDto)
	messages: AiChatTurnDto[];

	/** Stays already shown as cards in this conversation, newest first. */
	@IsOptional()
	@IsArray()
	@ArrayMaxSize(12)
	@ValidateNested({ each: true })
	@Type(() => AiShownStayDto)
	shownStays?: AiShownStayDto[];

	@IsOptional()
	@IsString()
	@MaxLength(200)
	pagePath?: string;

	@IsOptional()
	@IsString()
	@MaxLength(8)
	locale?: string;
}

/**
 * POST /ai/chat streams the assistant's reply as Server-Sent Events:
 * `status` (what it is doing), `delta` (text), `hotels` (cards), then `done` or `error`.
 */
@Controller('ai')
export class AiChatController {
	constructor(private readonly chatService: AiChatService) {}

	@Post('chat')
	@Public()
	public async chat(@Body() body: AiChatRequestDto, @Req() req: Request, @Res() res: Response): Promise<void> {
		res.status(200);
		res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
		res.setHeader('Cache-Control', 'no-cache, no-transform');
		res.setHeader('Connection', 'keep-alive');
		res.setHeader('X-Accel-Buffering', 'no');
		res.flushHeaders();

		// The response closing before we end it means the guest went away. (req 'close' fires once
		// the request body is read on current Node, so it is not a disconnect signal.)
		const abort = new AbortController();
		res.on('close', () => {
			if (!res.writableFinished) abort.abort();
		});

		const emit = (event: ChatEvent) => {
			if (!res.writableEnded) {
				res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
			}
		};
		// Keeps proxies from closing the connection while the model is thinking.
		const heartbeat = setInterval(() => {
			if (!res.writableEnded) res.write(': ping\n\n');
		}, 15_000);

		try {
			await this.chatService.run(
				body.messages,
				{
					visitorKey: resolveVisitorKey(req),
					pagePath: body.pagePath,
					locale: body.locale,
					shownStays: body.shownStays,
				},
				emit,
				abort.signal,
			);
		} finally {
			clearInterval(heartbeat);
			if (!res.writableEnded) res.end();
		}
	}
}
