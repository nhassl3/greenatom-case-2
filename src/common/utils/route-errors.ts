import { randomBytes } from 'crypto'
import { ParseError } from 'jet-validators/utils'

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes'

// Types

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
    requestId: string;
  };
}

// functions

function generateRequestId(): string {
  return randomBytes(4).toString('hex');
}

/******************************************************************************
                                 Classes
******************************************************************************/

export class RouteError extends Error {
  public static DEFAULT_CODE = 'INTERNAL_ERROR';

  public status: HttpStatusCodes;
  public code: string;
  public details?: ErrorDetail[];

  public constructor(
    status: HttpStatusCodes,
    message: string,
    code: string = RouteError.DEFAULT_CODE,
    details?: ErrorDetail[],
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  public toResponseBody(): ErrorResponseBody {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
        requestId: generateRequestId(),
      },
    };
  }
}

export class ValidationError extends RouteError {
  public static MESSAGE = 'Некорректные данные запроса';
  public static CODE = 'VALIDATION_ERROR'

  public constructor(errors: ParseError[]) {
    const details: ErrorDetail[] = errors.map((error) => ({
      field: error.key ?? error.keyPath.join('.'),
      message: error.info,
    }));
    super(HttpStatusCodes.BAD_REQUEST, ValidationError.MESSAGE, ValidationError.CODE, details);
  }
}
