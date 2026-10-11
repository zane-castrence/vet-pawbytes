import { motion, useReducedMotion } from "motion/react";

// columns: [{ key, label, render?(row, index), className?, headerClassName? }]
export default function DataTable({ columns, rows, rowKey = "id", empty = "Nothing to show.", className = "" }) {
  const reduce = useReducedMotion();

  return (
    <div className={`overflow-hidden rounded-[20px] border border-[#D8DEE3] bg-white font-figtree ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#D8DEE3] bg-[#F9FAFB]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#4B5563] ${c.headerClassName || ""}`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-24 px-4 text-center text-[#4B5563]">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <motion.tr
                  key={row[rowKey] ?? i}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i, 10) * 0.03, ease: "easeOut" }}
                  className="border-b border-[#D8DEE3] transition-colors last:border-0 hover:bg-[#EEF2FF]/60"
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 align-middle text-[#1F2937] ${c.className || ""}`}>
                      {c.render ? c.render(row, i) : row[c.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}