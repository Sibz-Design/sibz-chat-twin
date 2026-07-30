export interface ValidationOptions {
  maxMessageLength: number;
  maxHistoryItems: number;
  maxHistoryItemLength: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ChatRequestBody {
  message: string;
  history?: Array<{ role: string; content: string }>;
  clientId?: string;
}

// deno-lint-ignore no-explicit-any
export function validateChatRequest(body: any, opts: ValidationOptions): ValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  if (typeof body.message !== "string" || body.message.trim().length === 0) {
    return { valid: false, error: "The 'message' field must be a non-empty string." };
  }

  if (body.message.length > opts.maxMessageLength) {
    return {
      valid: false,
      error: `Message exceeds the maximum length of ${opts.maxMessageLength} characters.`,
    };
  }

  if (body.history !== undefined) {
    if (!Array.isArray(body.history)) {
      return { valid: false, error: "The 'history' field must be an array." };
    }
    if (body.history.length > opts.maxHistoryItems) {
      return {
        valid: false,
        error: `History exceeds the maximum of ${opts.maxHistoryItems} messages.`,
      };
    }
    for (const item of body.history) {
      if (!item || typeof item !== "object" || typeof item.content !== "string" || typeof item.role !== "string") {
        return { valid: false, error: "Each history item must have a string 'role' and 'content'." };
      }
      if (item.content.length > opts.maxHistoryItemLength) {
        return { valid: false, error: "A history item exceeds the maximum allowed length." };
      }
      if (!["user", "assistant", "system"].includes(item.role)) {
        return { valid: false, error: "History role must be 'user', 'assistant', or 'system'." };
      }
    }
  }

  if (body.clientId !== undefined && (typeof body.clientId !== "string" || body.clientId.length > 100)) {
    return { valid: false, error: "The 'clientId' field must be a string up to 100 characters." };
  }

  return { valid: true };
}
