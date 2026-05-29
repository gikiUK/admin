import { fireEvent, render, screen } from "@testing-library/react";
import { SortableHeader } from "@/components/analytics/sortable-header";
import { Table, TableHeader, TableRow } from "@/components/ui/table";

function renderHeader({
  currentSort,
  tooltip,
  onSort
}: {
  currentSort: string | undefined;
  tooltip?: string;
  onSort: (next: string | undefined) => void;
}) {
  return render(
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader
            label="Events"
            descSort="most_events"
            ascSort="least_active"
            currentSort={currentSort}
            onSort={onSort}
            tooltip={tooltip}
          />
        </TableRow>
      </TableHeader>
    </Table>
  );
}

describe("SortableHeader", () => {
  test("click cycles unset → DESC → ASC → unset", () => {
    const onSort = jest.fn();
    const { rerender } = renderHeader({ currentSort: undefined, onSort });
    fireEvent.click(screen.getByRole("button", { name: /events/i }));
    expect(onSort).toHaveBeenLastCalledWith("most_events");

    rerender(
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader
              label="Events"
              descSort="most_events"
              ascSort="least_active"
              currentSort="most_events"
              onSort={onSort}
            />
          </TableRow>
        </TableHeader>
      </Table>
    );
    fireEvent.click(screen.getByRole("button", { name: /events/i }));
    expect(onSort).toHaveBeenLastCalledWith("least_active");

    rerender(
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader
              label="Events"
              descSort="most_events"
              ascSort="least_active"
              currentSort="least_active"
              onSort={onSort}
            />
          </TableRow>
        </TableHeader>
      </Table>
    );
    fireEvent.click(screen.getByRole("button", { name: /events/i }));
    expect(onSort).toHaveBeenLastCalledWith(undefined);
  });

  test("tooltip variant still fires onSort when clicked", () => {
    const onSort = jest.fn();
    renderHeader({ currentSort: undefined, tooltip: "Total events recorded", onSort });
    fireEvent.click(screen.getByRole("button", { name: /events/i }));
    expect(onSort).toHaveBeenCalledWith("most_events");
  });
});
