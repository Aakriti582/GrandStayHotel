import { formatMoney } from '@/lib/format'

const cell = 'px-2 py-3 border-b border-chip'

export default function InvoiceTable({ invoice }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-[15px]">
        <caption className="sr-only">Invoice {invoice.reference}</caption>
        <thead>
          <tr className="text-left text-[13px] text-muted">
            <th scope="col" className="border-b border-line px-2 py-2.5 font-bold">Item</th>
            <th scope="col" className="border-b border-line px-2 py-2.5 text-right font-bold">Qty</th>
            <th scope="col" className="border-b border-line px-2 py-2.5 text-right font-bold">Unit price</th>
            <th scope="col" className="border-b border-line px-2 py-2.5 text-right font-bold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line, index) => (
            <tr key={`${line.description}-${index}`}>
              <td className={cell}>{line.description}</td>
              <td className={`${cell} text-right tabular-nums`}>{line.quantity}</td>
              <td className={`${cell} text-right tabular-nums`}>{formatMoney(line.unit_price)}</td>
              <td className={`${cell} text-right font-semibold tabular-nums`}>{formatMoney(line.line_total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="px-2 py-2.5 text-right text-muted">Subtotal</td>
            <td className="px-2 py-2.5 text-right font-semibold tabular-nums">{formatMoney(invoice.subtotal)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="px-2 py-2.5 text-right text-muted">Tax</td>
            <td className="px-2 py-2.5 text-right font-semibold tabular-nums">{formatMoney(invoice.tax)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="px-2 py-2.5 text-right font-bold">Total due</td>
            <td className="px-2 py-2.5 text-right font-display text-2xl font-bold tabular-nums">{formatMoney(invoice.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
