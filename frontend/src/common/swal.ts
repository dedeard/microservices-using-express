import sweetalert from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const SW = withReactContent(sweetalert)

type Options =
  | {
      title?: string
      text: string
    }
  | string

const swal = {
  success(options: Options) {
    return SW.fire({
      icon: 'success',
      title:
        typeof options !== 'string' ? options.title || 'Success' : 'Success',
      text: typeof options !== 'string' ? options.text : options,
    })
  },
  error(options: Options) {
    return SW.fire({
      icon: 'error',
      title:
        typeof options !== 'string' ? options.title || 'Oops...' : 'Oops...',
      text: typeof options !== 'string' ? options.text : options,
    })
  },
  dangerConfirm() {
    return SW.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })
  },
}

export default swal
