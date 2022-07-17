export default function Avatar(props: {
  name: string
  size?: number
  fontSize?: number
}) {
  const name = props.name.split(' ')
  const caracters = name.length > 1 ? name[0][0] + name[1][0] : name[0][0]
  const size = props.size || 45
  const fontSize = props.fontSize || 16
  return (
    <span
      className="d-inline-flex bg-secondary text-white rounded-circle"
      style={{ width: size, height: size }}
    >
      <span className="d-block m-auto text-uppercase" style={{ fontSize }}>
        <strong>{caracters}</strong>
      </span>
    </span>
  )
}
