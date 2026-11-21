import { pad2 } from '../../lib/anim'

interface Props {
  n: number
  title: string
  right?: string
}

export default function PlateHead({ n, title, right }: Props) {
  return (
    <div className="plate-head">
      <div className="plate-head__l lab">
        <span className="plate-head__n">{pad2(n)}</span>
        <span>
          Plate {pad2(n)} — {title}
        </span>
      </div>
      {right ? <div className="plate-head__r lab">{right}</div> : null}
    </div>
  )
}
