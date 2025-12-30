/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useTable } from "react-table";
import cn from "classnames";

const Table = ({
  data,
  columns,
  rowStyle = "primary",
}: {
  data: any;
  columns: any;
  rowStyle?: string;
}) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data,
    });

  return (
    <div className="flex justify-center md:justify-start flex-col w-full">
      <div className="overflow-x-auto touch relative">
        <table
          className="border-separate border-spacing-y-3 w-full overflow-hidden"
          cellPadding="0"
          cellSpacing="0"
          {...getTableProps()}
        >
          <thead>
            {headerGroups.map((headerGroup: any, index: number) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                {headerGroup.headers.map((column: any) => {
                  return (
                    <th
                      className={cn(
                        "font-medium border-none px-2.5 sm:px-4 xl:px-6 py-2 sm:py-3 text-left text-xs text-text-1700"
                      )}
                      {...column.getHeaderProps()}
                      key={column.id}
                    >
                      {column.render("Header")}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()} className="">
            {rows.map((row: any) => {
              prepareRow(row);

              return (
                <tr {...row.getRowProps()} key={row.id}>
                  {row.cells.map((cell: any, cellIndex: number) => {
                    const isLastCell = cellIndex === row.cells.length - 1;
                    const isFirstCell = cellIndex === 0;

                    return (
                      <td
                        className={cn(
                          "text-text-200 dark:text-text-400 px-2.5 sm:px-4 xl:px-6 py-5 sm:py-6 text-left text-xs ",
                          {
                            "rounded-l-lg": isFirstCell,
                            "rounded-r-lg": isLastCell,
                            "bg-bg-600 dark:bg-bg-1100": rowStyle === "primary",
                            "bg-white/5": rowStyle === "secondary",
                          }
                        )}
                        {...cell.getCellProps()}
                        key={cell.column.id}
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
