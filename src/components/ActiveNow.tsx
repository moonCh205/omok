import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';

interface Data {
  calories: number;
  carbs: number;
  dessert: string;
  fat: number;
  id: number;
  // protein: number;
}

interface ColumnData {
  dataKey: keyof Data;
  label: string;
  numeric?: boolean;
  width: number;
}

type Sample = [string, number, number, number /*number */];

const sample: readonly Sample[] = [
  ['Frozen yoghurt', 159, 6.0, 24 /* 4.0*/],
  ['Ice cream sandwich', 237, 9.0, 37 /* 4.0*/],
  ['Eclair', 262, 16.0, 24 /* 4.0*/],
  ['Cupcake', 305, 3.7, 67 /* 4.0*/],
  ['Gingerbread', 356, 16.0, 49 /* 4.0*/],
];

function createData(
  id: number,
  dessert: string,
  calories: number,
  fat: number,
  carbs: number /*protein: number*/
): Data {
  return { id, dessert, calories, fat, carbs /*protein */ };
}

const columns: ColumnData[] = [
  {
    width: 200,
    label: '닉네임',
    dataKey: 'dessert',
  },
  {
    width: 120,
    label: '등급',
    dataKey: 'calories',
    numeric: true,
  },
  {
    width: 120,
    label: '승',
    dataKey: 'fat',
    numeric: true,
  },
  {
    width: 120,
    label: '패',
    dataKey: 'carbs',
    numeric: true,
  },
  // {
  //   width: 120,
  //   label: 'Protein\u00A0(g)',
  //   dataKey: 'protein',
  //   numeric: true,
  // },
];

const rows: Data[] = Array.from({ length: 200 }, (_, index) => {
  const randomSelection = sample[Math.floor(Math.random() * sample.length)];
  return createData(index, ...randomSelection);
});

const VirtuosoTableComponents: TableComponents<Data> = {
  Scroller: React.forwardRef<HTMLDivElement>(function ads(props, ref) {
    return <TableContainer component={Paper} {...props} ref={ref} />;
  }),
  Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />,
  TableHead,
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
  TableBody: React.forwardRef<HTMLTableSectionElement>(function asd(props, ref) {
    return <TableBody {...props} ref={ref} />;
  }),
};

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align={column.numeric || false ? 'right' : 'left'}
          style={{ width: column.width }}
          sx={{
            backgroundColor: 'background.paper',
          }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
}

function rowContent(_index: number, row: Data) {
  return (
    <React.Fragment>
      {columns.map((column) => (
        <TableCell key={column.dataKey} align={column.numeric || false ? 'right' : 'left'}>
          {row[column.dataKey]}
        </TableCell>
      ))}
    </React.Fragment>
  );
}

export default function ReactVirtualizedTable() {
  return (
    <Paper style={{ height: 700, width: '100%', maxWidth: 275 }}>
      <TableVirtuoso
        data={rows}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
    </Paper>
  );
}
