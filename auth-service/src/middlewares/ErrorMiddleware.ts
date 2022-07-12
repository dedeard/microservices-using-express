import { Application, Request, Response, NextFunction } from 'express'
import config from '@/config/config'
import logger from '@/config/logger'
import ApiError from '@/shared/ApiError'

class ErrorMiddleware {
  private app: Application

  constructor(app: Application) {
    this.app = app
    this.app.use(this.catch404)
    this.app.use(this.errorConverter)
    this.app.use(this.makeErrorResponse)
  }

  catch404(req: Request, res: Response, next: NextFunction): void {
    next(new ApiError(404, 'Not found'))
  }

  errorConverter(err: ApiError | Error, req: Request, res: Response, next: NextFunction): void {
    let error = err
    if (err.name !== 'ApiError') {
      const msg = err.message || 'Internal server error'
      error = new ApiError(500, msg, undefined, err.stack)
      logger.error('[HTTP] ' + JSON.stringify(err))
    }
    next(error)
  }

  makeErrorResponse(err: ApiError, req: Request, res: Response, next: NextFunction): void {
    const { statusCode, message, errors } = err
    res.status(statusCode).json({
      statusCode,
      message,
      errors,
      ...(config.isDev && err.stack ? err : {}),
    })
  }
}

export default ErrorMiddleware
