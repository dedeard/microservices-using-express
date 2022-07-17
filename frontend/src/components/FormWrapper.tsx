type FormWrapperProps = {
  title: string
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
}

export default function FormWrapper(props: FormWrapperProps) {
  const { title, children, onSubmit } = props
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 mx-auto">
          <div className="card">
            <h5 className="card-header bg-white py-4 text-center">{title}</h5>
            <div className="card-body">
              <form onSubmit={onSubmit}>{children}</form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
