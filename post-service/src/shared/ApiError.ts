import Joi from 'joi'

class ApiError extends Error {
  statusCode: number
  errors?: { [key: string]: string }
  constructor(statusCode: number, message: string, errors?: any, stack?: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.stack = stack
    if (errors) this.formatJoiValidationError(errors)
  }
  formatJoiValidationError(e: any) {
    if (e instanceof Joi.ValidationError) {
      const errors: { [key: string]: string } = {}
      for (let i in e.details) {
        errors[e.details[i].context?.key as string] = e.details[i].message
      }
      if (errors) this.errors = errors
    } else {
      this.name = 'Error'
      this.stack = e.stack
    }
  }
}

export default ApiError
