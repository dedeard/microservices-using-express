export const errorMessage: (error: any) => string = (e) => {
  let message

  if (e.response && e.response.data && e.response.data.message) {
    message = e.response.data.message
  } else if (e.response && e.response.message) {
    message = e.response.message
  } else {
    message = e.message
  }

  return message
}

export const errorResponse: (error: any) => {
  message: string
  errors: { [key: string]: string }
} = (e: any) => {
  let errors
  let message

  if (e.response && e.response.data) {
    if (e.response.data.errors) {
      errors = e.response.data.errors
    } else if (e.response.data.message) {
      message = e.response.data.message
    }
  }

  if (!errors) errors = {}
  if (!message) message = ''

  return { errors, message }
}
